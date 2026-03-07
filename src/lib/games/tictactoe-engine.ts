import type { GameState, IGameEngine } from "@/types/game";

type Board = (string | null)[][];

interface TicTacToeMove {
  row: number;
  col: number;
}

function createEmptyBoard(): Board {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function checkWinner(board: Board): string | null {
  // Check rows
  for (let r = 0; r < 3; r++) {
    if (board[r][0] && board[r][0] === board[r][1] && board[r][1] === board[r][2]) {
      return board[r][0];
    }
  }

  // Check columns
  for (let c = 0; c < 3; c++) {
    if (board[0][c] && board[0][c] === board[1][c] && board[1][c] === board[2][c]) {
      return board[0][c];
    }
  }

  // Check diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return board[0][0];
  }
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return board[0][2];
  }

  return null;
}

function isBoardFull(board: Board): boolean {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}

export class TicTacToeEngine implements IGameEngine {
  createGame(): GameState {
    return {
      type: "tic-tac-toe",
      board: createEmptyBoard(),
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

    const { row, col } = move as TicTacToeMove;

    if (row < 0 || row > 2 || col < 0 || col > 2) {
      throw new Error("Invalid position: row and col must be 0-2");
    }

    const board = state.board as Board;
    if (board[row][col] !== null) {
      throw new Error("Cell is already occupied");
    }

    const newBoard = cloneBoard(board);
    const symbol = player === "player1" ? "X" : "O";
    newBoard[row][col] = symbol;

    const winner = checkWinner(newBoard);
    const full = isBoardFull(newBoard);

    let status: GameState["status"] = "active";
    let gameWinner: GameState["winner"] = undefined;
    if (winner) {
      status = "completed";
      gameWinner = winner === "X" ? "player1" : "player2";
    } else if (full) {
      status = "draw";
    }

    const nextTurn = player === "player1" ? "player2" : "player1";

    return {
      ...state,
      board: newBoard,
      currentTurn: status === "active" ? nextTurn : state.currentTurn,
      status,
      winner: gameWinner,
      moveHistory: [
        ...state.moveHistory,
        {
          player,
          data: { row, col },
          moveNumber: state.moveHistory.length + 1,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  getLegalMoves(state: GameState): unknown[] {
    if (state.status !== "active") return [];

    const board = state.board as Board;
    const moves: TicTacToeMove[] = [];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) {
          moves.push({ row, col });
        }
      }
    }

    return moves;
  }

  isGameOver(state: GameState): boolean {
    return state.status === "completed" || state.status === "draw";
  }

  getWinner(state: GameState): "player1" | "player2" | null {
    const board = state.board as Board;
    const winner = checkWinner(board);
    if (winner === "X") return "player1";
    if (winner === "O") return "player2";
    return null;
  }

  serialize(state: GameState): string {
    return JSON.stringify(state);
  }

  deserialize(json: string): GameState {
    return JSON.parse(json) as GameState;
  }
}
