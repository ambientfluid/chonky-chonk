"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

// Board cell values:
// "w" = white piece, "W" = white king
// "b" = black piece, "B" = black king
// "" = empty playable square, null = non-playable square
export type CheckerCell = "w" | "W" | "b" | "B" | "" | null;

export interface CheckersGameProps {
  board: CheckerCell[][];
  onMove: (move: string) => void;
  isMyTurn: boolean;
  playerSide: "white" | "black";
  legalMoves: string[];
  disabled?: boolean;
}

function parseSquare(notation: string): [number, number] | null {
  // Parse draughts notation like "a1", "b2", etc.
  const col = notation.charCodeAt(0) - 97; // 'a' = 0
  const row = 8 - parseInt(notation[1], 10); // '8' = 0, '1' = 7
  if (col >= 0 && col < 8 && row >= 0 && row < 8) {
    return [row, col];
  }
  return null;
}

function toSquareNotation(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (8 - row).toString();
}

export function CheckersGame({
  board,
  onMove,
  isMyTurn,
  playerSide,
  legalMoves,
  disabled = false,
}: CheckersGameProps) {
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null,
  );

  const canInteract = isMyTurn && !disabled;

  // Parse legal moves to find destinations for selected piece
  const legalDestinations = useMemo(() => {
    if (!selectedSquare) return new Set<string>();

    const selectedNotation = toSquareNotation(
      selectedSquare[0],
      selectedSquare[1],
    );
    const destinations = new Set<string>();

    for (const move of legalMoves) {
      // Moves can be in format "a3-b4" or "a3xb5" (captures) or multi-hop "a3xb5xc7"
      const parts = move.split(/[-x]/);
      if (parts[0] === selectedNotation && parts.length >= 2) {
        // Show the final destination
        const dest = parts[parts.length - 1];
        destinations.add(dest);
      }
    }

    return destinations;
  }, [selectedSquare, legalMoves]);

  // Find which squares have pieces that can move
  const movableSquares = useMemo(() => {
    const squares = new Set<string>();
    for (const move of legalMoves) {
      const parts = move.split(/[-x]/);
      if (parts[0]) squares.add(parts[0]);
    }
    return squares;
  }, [legalMoves]);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (!canInteract) return;

      const cell = board[row]?.[col];
      const clickedNotation = toSquareNotation(row, col);

      // If clicking a legal destination, make the move
      if (selectedSquare && legalDestinations.has(clickedNotation)) {
        const fromNotation = toSquareNotation(
          selectedSquare[0],
          selectedSquare[1],
        );
        // Find the full move string from legal moves
        const fullMove = legalMoves.find((m) => {
          const parts = m.split(/[-x]/);
          return (
            parts[0] === fromNotation &&
            parts[parts.length - 1] === clickedNotation
          );
        });
        if (fullMove) {
          onMove(fullMove);
          setSelectedSquare(null);
        }
        return;
      }

      // If clicking own piece, select it
      const isPiece = cell === "w" || cell === "W" || cell === "b" || cell === "B";
      if (isPiece) {
        const isWhitePiece = cell === "w" || cell === "W";
        const isOwnPiece =
          (playerSide === "white" && isWhitePiece) ||
          (playerSide === "black" && !isWhitePiece);

        if (isOwnPiece && movableSquares.has(clickedNotation)) {
          setSelectedSquare([row, col]);
        } else {
          setSelectedSquare(null);
        }
      } else {
        setSelectedSquare(null);
      }
    },
    [
      canInteract,
      board,
      selectedSquare,
      legalDestinations,
      legalMoves,
      playerSide,
      movableSquares,
      onMove,
    ],
  );

  // Render board from the perspective of the player
  const renderBoard = () => {
    const rows = [];
    const startRow = playerSide === "white" ? 0 : 7;
    const endRow = playerSide === "white" ? 8 : -1;
    const rowStep = playerSide === "white" ? 1 : -1;

    for (let r = startRow; r !== endRow; r += rowStep) {
      const cols = [];
      const startCol = playerSide === "white" ? 0 : 7;
      const endCol = playerSide === "white" ? 8 : -1;
      const colStep = playerSide === "white" ? 1 : -1;

      for (let c = startCol; c !== endCol; c += colStep) {
        const cell = board[r]?.[c];
        const isDarkSquare = (r + c) % 2 === 1;
        const squareNotation = toSquareNotation(r, c);
        const isSelected =
          selectedSquare?.[0] === r && selectedSquare?.[1] === c;
        const isLegalDest = legalDestinations.has(squareNotation);
        const isMovable = movableSquares.has(squareNotation);

        cols.push(
          <div
            key={`${r}-${c}`}
            onClick={() => handleSquareClick(r, c)}
            className={cn(
              "relative flex items-center justify-center",
              "aspect-square w-full",
              "transition-colors duration-150",
              isDarkSquare ? "bg-grape-600" : "bg-bubblegum-50",
              isSelected && "bg-bubblegum-300/80 ring-2 ring-bubblegum-400 ring-inset",
              isLegalDest && "cursor-pointer",
              canInteract &&
                isDarkSquare &&
                isMovable &&
                !isSelected &&
                "hover:bg-grape-500",
            )}
          >
            {/* Legal move dot indicator */}
            {isLegalDest && (
              <div
                className={cn(
                  "absolute z-10",
                  cell === "w" || cell === "W" || cell === "b" || cell === "B"
                    ? "inset-1 rounded-full ring-4 ring-lime-400/70"
                    : "h-4 w-4 rounded-full bg-lime-400/70",
                )}
              />
            )}

            {/* Checker pieces */}
            {(cell === "w" || cell === "W" || cell === "b" || cell === "B") && (
              <div
                className={cn(
                  "flex items-center justify-center",
                  "h-[75%] w-[75%] rounded-full",
                  "shadow-md transition-transform duration-150",
                  "border-2",
                  // White pieces
                  (cell === "w" || cell === "W") && [
                    "bg-gradient-to-br from-bubblegum-300 to-bubblegum-400",
                    "border-bubblegum-500",
                    "shadow-bubblegum-400/40",
                  ],
                  // Black pieces
                  (cell === "b" || cell === "B") && [
                    "bg-gradient-to-br from-grape-600 to-grape-700",
                    "border-grape-800",
                    "shadow-grape-700/40",
                  ],
                  // Hoverable own pieces
                  canInteract && isMovable && "cursor-pointer hover:scale-110",
                  isSelected && "scale-110 ring-2 ring-lime-400",
                )}
              >
                {/* King indicator */}
                {(cell === "W" || cell === "B") && (
                  <span className="text-lg leading-none drop-shadow-sm select-none">
                    {cell === "W" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-300 drop-shadow"
                      >
                        <path d="M2 19h20v2H2v-2zm1-1l2-7 4 3 3-5 3 5 4-3 2 7H3zm9-14a2 2 0 110 4 2 2 0 010-4z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-300 drop-shadow"
                      >
                        <path d="M2 19h20v2H2v-2zm1-1l2-7 4 3 3-5 3 5 4-3 2 7H3zm9-14a2 2 0 110 4 2 2 0 010-4z" />
                      </svg>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>,
        );
      }

      rows.push(
        <div key={r} className="grid grid-cols-8">
          {cols}
        </div>,
      );
    }

    return rows;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Turn indicator */}
      <div
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-semibold",
          "transition-all duration-300",
          isMyTurn
            ? "bg-lime-100 text-lime-700 animate-pulse"
            : "bg-grape-100 text-grape-500",
        )}
      >
        {disabled
          ? "Game Over"
          : isMyTurn
            ? "Your turn! Select a piece."
            : "Waiting for opponent..."}
      </div>

      {/* Board */}
      <div
        className={cn(
          "w-full max-w-[400px] rounded-2xl p-3",
          "bg-gradient-to-br from-bubblegum-100 via-grape-100 to-lime-100",
          "shadow-lg",
          canInteract && "shadow-xl shadow-bubblegum-200/60",
        )}
      >
        <div className="overflow-hidden rounded-xl border-2 border-grape-300">
          {renderBoard()}
        </div>
      </div>

      {/* Playing as indicator */}
      <div className="flex items-center gap-2 text-sm text-grape-500">
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2 border-grape-300",
            playerSide === "white"
              ? "bg-bubblegum-400"
              : "bg-grape-700",
          )}
        />
        <span className="font-medium">
          Playing as {playerSide === "white" ? "Pink" : "Purple"}
        </span>
      </div>
    </div>
  );
}
