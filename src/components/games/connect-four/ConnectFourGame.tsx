"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

export interface ConnectFourGameProps {
  board: (string | null)[][];
  onMove: (move: { column: number }) => void;
  isMyTurn: boolean;
  myColor: "R" | "Y";
  disabled?: boolean;
  winCells?: number[][] | null;
}

const ROWS = 6;
const COLS = 7;

function isWinCell(
  row: number,
  col: number,
  winCells?: number[][] | null,
): boolean {
  if (!winCells) return false;
  return winCells.some(([r, c]) => r === row && c === col);
}

export function ConnectFourGame({
  board,
  onMove,
  isMyTurn,
  myColor,
  disabled = false,
  winCells,
}: ConnectFourGameProps) {
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const canInteract = isMyTurn && !disabled;

  // Find the next available row in a column (where the piece would land)
  const getNextRow = useCallback(
    (col: number): number | null => {
      for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row]?.[col]) return row;
      }
      return null;
    },
    [board],
  );

  const hoverRow = useMemo(() => {
    if (hoverCol === null) return null;
    return getNextRow(hoverCol);
  }, [hoverCol, getNextRow]);

  const handleColumnClick = useCallback(
    (col: number) => {
      if (!canInteract) return;
      const nextRow = getNextRow(col);
      if (nextRow === null) return; // Column is full
      onMove({ column: col });
    },
    [canInteract, getNextRow, onMove],
  );

  const handleColumnHover = useCallback(
    (col: number) => {
      if (!canInteract) return;
      setHoverCol(col);
    },
    [canInteract],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverCol(null);
  }, []);

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
          disabled && "bg-bubblegum-100 text-bubblegum-600 animate-none",
        )}
      >
        {disabled
          ? winCells
            ? "We have a winner!"
            : "Game Over!"
          : isMyTurn
            ? "Drop your piece!"
            : "Opponent is thinking..."}
      </div>

      {/* Board container */}
      <div
        className={cn(
          "rounded-3xl p-4",
          "bg-gradient-to-br from-bubblegum-100 via-grape-100 to-lime-100",
          "shadow-lg",
          canInteract && "shadow-xl shadow-bubblegum-200/60",
        )}
        onMouseLeave={handleMouseLeave}
      >
        {/* Column hover indicators */}
        <div className="mb-2 grid grid-cols-7 gap-1.5 px-1">
          {Array.from({ length: COLS }).map((_, col) => {
            const isHovered = hoverCol === col;
            const columnFull = getNextRow(col) === null;

            return (
              <div
                key={`indicator-${col}`}
                className="flex items-center justify-center h-8"
              >
                {isHovered && !columnFull && canInteract && (
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full animate-pop",
                      "shadow-md",
                      myColor === "R"
                        ? "bg-bubblegum-400/70"
                        : "bg-lime-400/70",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Game board */}
        <div
          className={cn(
            "rounded-2xl p-3",
            "bg-gradient-to-b from-grape-500 to-grape-600",
            "shadow-inner",
          )}
        >
          {Array.from({ length: ROWS }).map((_, row) => (
            <div key={row} className="grid grid-cols-7 gap-1.5 mb-1.5 last:mb-0">
              {Array.from({ length: COLS }).map((_, col) => {
                const cell = board[row]?.[col];
                const isWin = isWinCell(row, col, winCells);
                const isHoverTarget =
                  canInteract && hoverCol === col && hoverRow === row && !cell;
                const columnFull = getNextRow(col) === null;

                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => handleColumnClick(col)}
                    onMouseEnter={() => handleColumnHover(col)}
                    disabled={!canInteract || columnFull}
                    className={cn(
                      "aspect-square w-full rounded-full",
                      "flex items-center justify-center",
                      "transition-all duration-200",
                      // Base hole style
                      "bg-grape-700/50 shadow-inner",
                      // Interactive column
                      canInteract &&
                        !columnFull &&
                        "cursor-pointer hover:bg-grape-700/30",
                    )}
                    aria-label={`Column ${col + 1}, Row ${row + 1}${cell ? `, ${cell === "R" ? "Red" : "Yellow"}` : ", Empty"}`}
                  >
                    {/* Piece */}
                    {cell && (
                      <div
                        className={cn(
                          "h-[85%] w-[85%] rounded-full",
                          "shadow-md",
                          "transition-all duration-300",
                          cell === "R" && [
                            "bg-gradient-to-br from-bubblegum-300 to-bubblegum-500",
                            "shadow-bubblegum-600/30",
                          ],
                          cell === "Y" && [
                            "bg-gradient-to-br from-lime-300 to-lime-500",
                            "shadow-lime-600/30",
                          ],
                          isWin && [
                            "ring-3 ring-white scale-105",
                            "animate-pulse",
                          ],
                        )}
                      >
                        {/* Inner shine */}
                        <div
                          className={cn(
                            "h-full w-full rounded-full",
                            "bg-gradient-to-br from-white/30 to-transparent",
                          )}
                        />
                      </div>
                    )}

                    {/* Ghost piece for hover preview */}
                    {isHoverTarget && (
                      <div
                        className={cn(
                          "h-[85%] w-[85%] rounded-full opacity-40",
                          "animate-fade-in",
                          myColor === "R"
                            ? "bg-bubblegum-400"
                            : "bg-lime-400",
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Color indicator */}
      <div className="flex items-center gap-2 text-sm text-grape-500">
        <div
          className={cn(
            "h-5 w-5 rounded-full border-2 border-grape-300 shadow-sm",
            myColor === "R"
              ? "bg-bubblegum-400"
              : "bg-lime-400",
          )}
        />
        <span className="font-medium">
          You are {myColor === "R" ? "Pink" : "Green"}
        </span>
      </div>
    </div>
  );
}
