export type GameType = "chess" | "checkers" | "tic-tac-toe" | "hangman" | "connect-four";
export type GameStatus = "waiting" | "active" | "completed" | "abandoned";
export type FriendshipStatus = "pending" | "accepted" | "declined";
export type InviteStatus = "pending" | "accepted" | "declined" | "expired";

export interface Profile {
  id: string;
  screen_name: string;
  avatar_url: string | null;
  bio: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  game_type: GameType;
  player1_id: string;
  player2_id: string;
  status: GameStatus;
  winner_id: string | null;
  game_state: Record<string, unknown>;
  current_turn: string;
  daily_room_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameMove {
  id: string;
  game_id: string;
  player_id: string;
  move_data: Record<string, unknown>;
  move_number: number;
  created_at: string;
}

export interface GameInvite {
  id: string;
  from_user: string;
  to_user: string;
  game_type: GameType;
  status: InviteStatus;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
}
