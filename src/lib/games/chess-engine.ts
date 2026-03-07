import { Chess } from "chess.js";
import type { GameState, IGameEngine } from "@/types/game";

interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

export class ChessEngine implements IGameEngine {
  createGame(): GameState {
    const chess = new Chess();

    return {
      type: "chess",
      board: chess.fen(),
      currentTurn: "player1",
      status: "active",
      moveHistory: [],
      extra: { pgn: chess.pgn() },
    };
  }

  makeMove(
    state: GameState,
    move: unknown,
    player: "player1" | "player2",
  ): GameState {
    if (state.status !== "active") {
      throw new Error("Game is not active");
    }

    if (player !== state.currentTurn) {
      throw new Error(`It is not ${player}'s turn`);
    }

    const chess = new Chess(state.board as string);
    const { from, to, promotion } = move as ChessMove;

    // Verify the correct color is moving
    const expectedColor = player === "player1" ? "w" : "b";
    if (chess.turn() !== expectedColor) {
      throw new Error("Turn mismatch between game state and chess engine");
    }

    const result = chess.move({ from, to, promotion });

    if (!result) {
      throw new Error(`Invalid move: ${from} to ${to}`);
    }

    let status: GameState["status"] = "active";
    let winner: GameState["winner"] = undefined;

    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        status = "completed";
        // The player who just moved wins (the opponent is checkmated)
        winner = player;
      } else {
        // Stalemate, draw by repetition, insufficient material, 50-move rule
        status = "draw";
      }
    }

    const nextTurn = player === "player1" ? "player2" : "player1";

    return {
      ...state,
      board: chess.fen(),
      currentTurn: status === "active" ? nextTurn : state.currentTurn,
      status,
      winner,
      moveHistory: [
        ...state.moveHistory,
        {
          player,
          data: { from, to, promotion },
          moveNumber: state.moveHistory.length + 1,
          timestamp: new Date().toISOString(),
        },
      ],
      extra: { pgn: chess.pgn() },
    };
  }

  getLegalMoves(state: GameState): unknown[] {
    if (state.status !== "active") return [];

    const chess = new Chess(state.board as string);
    return chess.moves({ verbose: true });
  }

  isGameOver(state: GameState): boolean {
    const chess = new Chess(state.board as string);
    return chess.isGameOver();
  }

  getWinner(state: GameState): "player1" | "player2" | null {
    const chess = new Chess(state.board as string);

    if (chess.isCheckmate()) {
      // The player whose turn it is has been checkmated, so the OTHER player wins
      const loser = chess.turn() === "w" ? "player1" : "player2";
      return loser === "player1" ? "player2" : "player1";
    }

    return null;
  }

  serialize(state: GameState): string {
    return JSON.stringify(state);
  }

  deserialize(json: string): GameState {
    return JSON.parse(json) as GameState;
  }
}
