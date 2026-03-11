import type { GameState, IGameEngine } from "@/types/game";

// Board cell values matching the UI component:
// "w" = white piece, "W" = white king
// "b" = black piece, "B" = black king
// "" = empty playable square, null = non-playable square
type Cell = "w" | "W" | "b" | "B" | "" | null;
type Board = Cell[][];

function createInitialBoard(): Board {
  const board: Board = [];
  for (let r = 0; r < 8; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < 8; c++) {
      const isDark = (r + c) % 2 === 1;
      if (!isDark) {
        row.push(null);
      } else if (r < 3) {
        row.push("b"); // Black pieces on top rows
      } else if (r > 4) {
        row.push("w"); // White pieces on bottom rows
      } else {
        row.push("");
      }
    }
    board.push(row);
  }
  return board;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function toNotation(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (8 - row).toString();
}

function fromNotation(notation: string): [number, number] {
  const col = notation.charCodeAt(0) - 97;
  const row = 8 - parseInt(notation[1], 10);
  return [row, col];
}

function isOwn(cell: Cell, side: "w" | "b"): boolean {
  if (!cell) return false;
  return side === "w"
    ? cell === "w" || cell === "W"
    : cell === "b" || cell === "B";
}

function isOpponent(cell: Cell, side: "w" | "b"): boolean {
  if (!cell) return false;
  return side === "w"
    ? cell === "b" || cell === "B"
    : cell === "w" || cell === "W";
}

function isKing(cell: Cell): boolean {
  return cell === "W" || cell === "B";
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Get capture sequences from a position (multi-jump support)
function getCaptureSequences(
  board: Board,
  row: number,
  col: number,
  side: "w" | "b",
  isKingPiece: boolean,
  path: string[],
  captured: Set<string>,
): string[][] {
  const directions = isKingPiece
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : side === "w"
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] // All directions for captures
      : [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  const sequences: string[][] = [];
  let foundCapture = false;

  for (const [dr, dc] of directions) {
    const midR = row + dr;
    const midC = col + dc;
    const endR = row + dr * 2;
    const endC = col + dc * 2;
    const midKey = `${midR},${midC}`;

    if (
      inBounds(endR, endC) &&
      isOpponent(board[midR][midC], side) &&
      !captured.has(midKey) &&
      (board[endR][endC] === "" || (endR === row && endC === col))
    ) {
      foundCapture = true;
      const newCaptured = new Set(captured);
      newCaptured.add(midKey);
      const endNotation = toNotation(endR, endC);

      // Check if piece becomes king at this position
      const becomesKing = !isKingPiece &&
        ((side === "w" && endR === 0) || (side === "b" && endR === 7));

      const subSequences = getCaptureSequences(
        board,
        endR,
        endC,
        side,
        isKingPiece || becomesKing,
        [...path, endNotation],
        newCaptured,
      );

      sequences.push(...subSequences);
    }
  }

  // If no further captures, this is a terminal sequence
  if (!foundCapture && path.length > 1) {
    sequences.push(path);
  }

  return sequences;
}

function getMovesForPiece(
  board: Board,
  row: number,
  col: number,
  side: "w" | "b",
): string[] {
  const cell = board[row][col];
  if (!cell || !isOwn(cell, side)) return [];

  const isK = isKing(cell);
  const from = toNotation(row, col);

  // Check captures first (mandatory in checkers)
  const captures = getCaptureSequences(
    board, row, col, side, isK, [from], new Set(),
  );

  if (captures.length > 0) {
    return captures.map((seq) => seq.join("x"));
  }

  // Simple moves
  const directions = isK
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : side === "w"
      ? [[-1, -1], [-1, 1]] // White moves up
      : [[1, -1], [1, 1]];  // Black moves down

  const moves: string[] = [];
  for (const [dr, dc] of directions) {
    const newR = row + dr;
    const newC = col + dc;
    if (inBounds(newR, newC) && board[newR][newC] === "") {
      moves.push(`${from}-${toNotation(newR, newC)}`);
    }
  }

  return moves;
}

function getAllMoves(board: Board, side: "w" | "b"): string[] {
  const allCaptures: string[] = [];
  const allSimple: string[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isOwn(board[r][c], side)) {
        const moves = getMovesForPiece(board, r, c, side);
        for (const m of moves) {
          if (m.includes("x")) {
            allCaptures.push(m);
          } else {
            allSimple.push(m);
          }
        }
      }
    }
  }

  // Captures are mandatory
  return allCaptures.length > 0 ? allCaptures : allSimple;
}

function applyMove(board: Board, moveStr: string): Board {
  const newBoard = cloneBoard(board);
  const isCapture = moveStr.includes("x");
  const parts = moveStr.split(isCapture ? "x" : "-");

  const [startR, startC] = fromNotation(parts[0]);
  const piece = newBoard[startR][startC];

  // Clear start position
  newBoard[startR][startC] = "";

  if (isCapture) {
    // Process each hop in the capture sequence
    let prevR = startR;
    let prevC = startC;

    for (let i = 1; i < parts.length; i++) {
      const [nextR, nextC] = fromNotation(parts[i]);
      // Remove captured piece (midpoint)
      const midR = (prevR + nextR) / 2;
      const midC = (prevC + nextC) / 2;
      newBoard[midR][midC] = "";
      prevR = nextR;
      prevC = nextC;
    }

    // Place piece at final position
    const [endR, endC] = fromNotation(parts[parts.length - 1]);
    newBoard[endR][endC] = maybePromote(piece!, endR);
  } else {
    // Simple move
    const [endR, endC] = fromNotation(parts[1]);
    newBoard[endR][endC] = maybePromote(piece!, endR);
  }

  return newBoard;
}

function maybePromote(piece: Cell, row: number): Cell {
  if (piece === "w" && row === 0) return "W";
  if (piece === "b" && row === 7) return "B";
  return piece;
}

export class CheckersEngine implements IGameEngine {
  createGame(): GameState {
    return {
      type: "checkers",
      board: createInitialBoard(),
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

    const board = state.board as Board;
    const side = player === "player1" ? "w" : "b";
    const moveStr = move as string;

    // Validate move is legal
    const legalMoves = getAllMoves(board, side);
    if (!legalMoves.includes(moveStr)) {
      throw new Error(`Invalid move: ${moveStr}`);
    }

    const newBoard = applyMove(board, moveStr);
    const nextPlayer = player === "player1" ? "player2" : "player1";
    const nextSide = nextPlayer === "player1" ? "w" : "b";

    // Check if opponent has any moves
    const opponentMoves = getAllMoves(newBoard, nextSide);
    const gameOver = opponentMoves.length === 0;

    return {
      ...state,
      board: newBoard,
      currentTurn: gameOver ? state.currentTurn : nextPlayer,
      status: gameOver ? "completed" : "active",
      winner: gameOver ? player : undefined,
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

    const board = state.board as Board;
    const side = state.currentTurn === "player1" ? "w" : "b";
    return getAllMoves(board, side);
  }

  isGameOver(state: GameState): boolean {
    return state.status === "completed" || state.status === "draw";
  }

  getWinner(state: GameState): "player1" | "player2" | null {
    return state.winner ?? null;
  }

  serialize(state: GameState): string {
    return JSON.stringify(state);
  }

  deserialize(json: string): GameState {
    return JSON.parse(json) as GameState;
  }
}
