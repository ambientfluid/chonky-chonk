-- Chonky Chonk Game Bonk - Database Schema
-- Run this against your Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- Profiles: extends auth.users with game-specific data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  screen_name TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendships between users
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Games: each game session between two players
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type TEXT CHECK (game_type IN ('chess', 'checkers', 'tic-tac-toe', 'hangman', 'connect-four')) NOT NULL,
  player1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  player2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'active', 'completed', 'abandoned')) DEFAULT 'waiting',
  winner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_state JSONB DEFAULT '{}'::jsonb,
  current_turn UUID,
  daily_room_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Moves: append-only log of all moves
CREATE TABLE IF NOT EXISTS public.game_moves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  move_data JSONB NOT NULL,
  move_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Invites: pending game invitations
CREATE TABLE IF NOT EXISTS public.game_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT CHECK (game_type IN ('chess', 'checkers', 'tic-tac-toe', 'hangman', 'connect-four')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_games_players ON public.games(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_game_moves_game_id ON public.game_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_game_invites_to_user ON public.game_invites(to_user, status);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id, status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_invites ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id);

-- Games
CREATE POLICY "Players can view their games"
  ON public.games FOR SELECT
  TO authenticated USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Authenticated users can create games"
  ON public.games FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Players can update their games"
  ON public.games FOR UPDATE
  TO authenticated USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Game Moves
CREATE POLICY "Players can view game moves"
  ON public.game_moves FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.games
      WHERE id = game_id
      AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can insert moves"
  ON public.game_moves FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = player_id);

-- Game Invites
CREATE POLICY "Users can view their invites"
  ON public.game_invites FOR SELECT
  TO authenticated USING (auth.uid() = from_user OR auth.uid() = to_user);

CREATE POLICY "Users can create invites"
  ON public.game_invites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = from_user);

CREATE POLICY "Users can update invites sent to them"
  ON public.game_invites FOR UPDATE
  TO authenticated USING (auth.uid() = to_user);

-- Friendships
CREATE POLICY "Users can view their friendships"
  ON public.friendships FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
  ON public.friendships FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships involving them"
  ON public.friendships FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, screen_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'screen_name', split_part(NEW.email, '@', 1)),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-friend after game completion (both directions)
CREATE OR REPLACE FUNCTION public.auto_friend_after_game()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (NEW.player1_id, NEW.player2_id, 'accepted')
    ON CONFLICT (user_id, friend_id) DO NOTHING;

    INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (NEW.player2_id, NEW.player1_id, 'accepted')
    ON CONFLICT (user_id, friend_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_game_completed ON public.games;
CREATE TRIGGER on_game_completed
  AFTER UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.auto_friend_after_game();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_games ON public.games;
CREATE TRIGGER set_updated_at_games
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- STORAGE
-- ============================================

-- Create avatars bucket (public for reading, restricted writing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
