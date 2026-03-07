import { GameType } from "./database";

export interface GameState {
  type: GameType;
  board: unknown;
  currentTurn: "player1" | "player2";
  status: "active" | "completed" | "draw";
  winner?: "player1" | "player2";
  moveHistory: MoveRecord[];
  extra?: Record<string, unknown>;
}

export interface MoveRecord {
  player: "player1" | "player2";
  data: unknown;
  moveNumber: number;
  timestamp: string;
}

export interface IGameEngine {
  createGame(): GameState;
  makeMove(state: GameState, move: unknown, player: "player1" | "player2"): GameState;
  getLegalMoves(state: GameState): unknown[];
  isGameOver(state: GameState): boolean;
  getWinner(state: GameState): "player1" | "player2" | null;
  serialize(state: GameState): string;
  deserialize(json: string): GameState;
}
