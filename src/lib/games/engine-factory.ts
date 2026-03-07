import type { GameType } from "@/types/database";
import type { IGameEngine } from "@/types/game";
import { ChessEngine } from "./chess-engine";
import { CheckersEngine } from "./checkers-engine";
import { TicTacToeEngine } from "./tictactoe-engine";
import { HangmanEngine } from "./hangman-engine";
import { ConnectFourEngine } from "./connect-four-engine";

export function getEngine(gameType: GameType): IGameEngine {
  switch (gameType) {
    case "chess":
      return new ChessEngine();
    case "checkers":
      return new CheckersEngine();
    case "tic-tac-toe":
      return new TicTacToeEngine();
    case "hangman":
      return new HangmanEngine();
    case "connect-four":
      return new ConnectFourEngine();
    default: {
      const _exhaustive: never = gameType;
      throw new Error(`Unknown game type: ${_exhaustive}`);
    }
  }
}
