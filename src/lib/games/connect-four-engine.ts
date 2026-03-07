import type { GameState, IGameEngine } from "@/types/game";

const ROWS = 6;
const COLS = 7;

type Board = (string | null)[][];

interface ConnectFourMove {
  column: number;
}

function createEmptyBoard(): Board {
  const board: Board = [];
  for (let r = 0; r < ROWS; r++) {
    board.push(new Array(COLS).fill(null));
  }
  return board;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function findLowestEmptyRow(board: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return -1;
}

function checkLine(
  board: Board,
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number,
): string | null {
  const first = board[startRow][startCol];
  if (!first) return null;

  for (let i = 1; i < 4; i++) {
    const r = startRow + dRow * i;
    const c = startCol + dCol * i;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    if (board[r][c] !== first) return null;
  }

  return first;
}

function checkWinner(board: Board): string | null {
  // Check horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const result = checkLine(board, r, c, 0, 1);
      if (result) return result;
    }
  }

  // Check vertical
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      const result = checkLine(board, r, c, 1, 0);
      if (result) return result;
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const result = checkLine(board, r, c, 1, 1);
      if (result) return result;
    }
  }

  // Check diagonal (bottom-left to top-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const result = checkLine(board, r, c, -1, 1);
      if (result) return result;
    }
  }

  return null;
}

function isBoardFull(board: Board): boolean {
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === null) return false;
  }
  return true;
}

export class ConnectFourEngine implements IGameEngine {
  createGame(): GameState {
    return {
      type: "connect-four",
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

    const { column } = move as ConnectFourMove;

    if (column < 0 || column >= COLS) {
      throw new Error(`Invalid column: ${column}. Must be 0-${COLS - 1}`);
    }

    const board = state.board as Board;
    const row = findLowestEmptyRow(board, column);

    if (row === -1) {
      throw new Error(`Column ${column} is full`);
    }

    const newBoard = cloneBoard(board);
    const piece = player === "player1" ? "R" : "Y";
    newBoard[row][column] = piece;

    const winner = checkWinner(newBoard);
    const full = isBoardFull(newBoard);

    let status: GameState["status"] = "active";
    let gameWinner: GameState["winner"] = undefined;

    if (winner) {
      status = "completed";
      gameWinner = winner === "R" ? "player1" : "player2";
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
          data: { column },
          moveNumber: state.moveHistory.length + 1,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  getLegalMoves(state: GameState): unknown[] {
    if (state.status !== "active") return [];

    const board = state.board as Board;
    const moves: ConnectFourMove[] = [];

    for (let c = 0; c < COLS; c++) {
      if (board[0][c] === null) {
        moves.push({ column: c });
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
    if (winner === "R") return "player1";
    if (winner === "Y") return "player2";
    return null;
  }

  serialize(state: GameState): string {
    return JSON.stringify(state);
  }

  deserialize(json: string): GameState {
    return JSON.parse(json) as GameState;
  }
}
