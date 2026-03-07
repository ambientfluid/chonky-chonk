import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GameSession } from "@/components/games/GameSession";
import type { Game, Profile, GameType } from "@/types/database";

/* -------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------- */

interface GameSessionPageProps {
  params: Promise<{ gameType: string; gameId: string }>;
}

/* -------------------------------------------------------------------------
 * Page (Server Component)
 * ----------------------------------------------------------------------- */

export default async function GameSessionPage({ params }: GameSessionPageProps) {
  const { gameType, gameId } = await params;
  const supabase = await createClient();

  // 1. Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch the game row
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (gameError || !game) {
    redirect("/games");
  }

  const typedGame = game as Game;

  // 3. Verify the game type matches the URL
  if (typedGame.game_type !== (gameType as GameType)) {
    redirect("/games");
  }

  // 4. Verify the current user is a participant
  if (typedGame.player1_id !== user.id && typedGame.player2_id !== user.id) {
    redirect("/games");
  }

  // 5. Fetch both player profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", [typedGame.player1_id, typedGame.player2_id]);

  if (profilesError || !profiles || profiles.length < 2) {
    redirect("/games");
  }

  const typedProfiles = profiles as Profile[];
  const myProfile = typedProfiles.find((p) => p.id === user.id)!;
  const opponentProfile = typedProfiles.find((p) => p.id !== user.id)!;

  // 6. Render the game session
  return (
    <GameSession
      game={typedGame}
      profile={myProfile}
      opponentProfile={opponentProfile}
      userId={user.id}
    />
  );
}
