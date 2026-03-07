import Draughts from "draughts";
import type { GameState, IGameEngine } from "@/types/game";

export class CheckersEngine implements IGameEngine {
  createGame(): GameState {
    const draughts = new Draughts();

    return {
      type: "checkers",
      board: draughts.fen(),
      currentTurn: "player1",
      status: "active",
      moveHistory: [],
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

    const draughts = new Draughts(state.board as string);

    // Verify the correct color is moving
    const expectedTurn = player === "player1" ? "w" : "b";
    if (draughts.turn() !== expectedTurn) {
      throw new Error("Turn mismatch between game state and draughts engine");
    }

    // Parse the move string (e.g., "3126" -> from: 31, to: 26)
    const moveStr = move as string;
    const from = parseInt(moveStr.slice(0, 2), 10);
    const to = parseInt(moveStr.slice(2, 4), 10);

    const result = draughts.move({ from, to });

    if (!result) {
      throw new Error(`Invalid move: ${moveStr} (from: ${from}, to: ${to})`);
    }

    let status: GameState["status"] = "active";
    let winner: GameState["winner"] = undefined;

    if (draughts.gameOver()) {
      status = "completed";
      // When the game is over, the current player (whose turn it now is)
      // has no moves, so the player who just moved wins
      winner = player;
    }

    const nextTurn = player === "player1" ? "player2" : "player1";

    return {
      ...state,
      board: draughts.fen(),
      currentTurn: status === "active" ? nextTurn : state.currentTurn,
      status,
      winner,
      moveHistory: [
        ...state.moveHistory,
        {
          player,
          data: moveStr,
          moveNumber: state.moveHistory.length + 1,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  getLegalMoves(state: GameState): unknown[] {
    if (state.status !== "active") return [];

    const draughts = new Draughts(state.board as string);
    return draughts.moves();
  }

  isGameOver(state: GameState): boolean {
    const draughts = new Draughts(state.board as string);
    return draughts.gameOver();
  }

  getWinner(state: GameState): "player1" | "player2" | null {
    const draughts = new Draughts(state.board as string);

    if (draughts.gameOver()) {
      // The player whose turn it is has no moves, so they lose
      const loserTurn = draughts.turn();
      if (loserTurn === "w") {
        return "player2"; // White (player1) lost, so player2 wins
      } else {
        return "player1"; // Black (player2) lost, so player1 wins
      }
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
