"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils/cn";

export interface TicTacToeGameProps {
  board: (string | null)[][];
  onMove: (move: { row: number; col: number }) => void;
  isMyTurn: boolean;
  mySymbol: "X" | "O";
  disabled?: boolean;
  winLine?: number[][] | null;
}

function isWinCell(
  row: number,
  col: number,
  winLine?: number[][] | null,
): boolean {
  if (!winLine) return false;
  return winLine.some(([r, c]) => r === row && c === col);
}

function XMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-full w-full", className)}
      strokeLinecap="round"
      strokeWidth="12"
    >
      <line
        x1="20"
        y1="20"
        x2="80"
        y2="80"
        stroke="currentColor"
      />
      <line
        x1="80"
        y1="20"
        x2="20"
        y2="80"
        stroke="currentColor"
      />
    </svg>
  );
}

function OMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-full w-full", className)}
      strokeLinecap="round"
      strokeWidth="12"
      fill="none"
    >
      <circle cx="50" cy="50" r="30" stroke="currentColor" />
    </svg>
  );
}

export function TicTacToeGame({
  board,
  onMove,
  isMyTurn,
  mySymbol,
  disabled = false,
  winLine,
}: TicTacToeGameProps) {
  const canInteract = isMyTurn && !disabled;

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!canInteract) return;
      if (board[row][col] !== null) return;
      onMove({ row, col });
    },
    [canInteract, board, onMove],
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Turn indicator */}
      <div
        className={cn(
          "rounded-full px-5 py-2 text-base font-bold font-[family-name:var(--font-display)]",
          "transition-all duration-300",
          isMyTurn
            ? "bg-lime-100 text-lime-700 animate-pulse"
            : "bg-grape-100 text-grape-500",
          disabled && "bg-bubblegum-100 text-bubblegum-600",
        )}
      >
        {disabled
          ? winLine
            ? "We have a winner!"
            : "Game Over!"
          : isMyTurn
            ? "Your turn!"
            : "Opponent is thinking..."}
      </div>

      {/* Board */}
      <div
        className={cn(
          "rounded-3xl p-4",
          "bg-gradient-to-br from-bubblegum-100 via-grape-100 to-lime-100",
          "shadow-lg",
          canInteract && "shadow-xl shadow-bubblegum-200/60",
        )}
      >
        <div className="grid grid-cols-3 gap-3">
          {board.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const isWin = isWinCell(rowIdx, colIdx, winLine);
              const isEmpty = cell === null;

              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                  disabled={!canInteract || !isEmpty}
                  className={cn(
                    "flex items-center justify-center",
                    "h-24 w-24 sm:h-28 sm:w-28",
                    "rounded-2xl border-3 border-grape-200",
                    "bg-white",
                    "transition-all duration-200",
                    "font-[family-name:var(--font-display)] text-5xl font-bold",
                    // Win highlight
                    isWin && "bg-lime-200 border-lime-400 scale-105",
                    // Hover for empty cells when it's the player's turn
                    canInteract &&
                      isEmpty &&
                      "cursor-pointer hover:bg-bubblegum-50 hover:border-bubblegum-300 hover:scale-105 active:scale-95",
                    // Disabled style
                    !canInteract && !isWin && "opacity-80",
                  )}
                  aria-label={
                    cell
                      ? `${cell} at row ${rowIdx + 1}, column ${colIdx + 1}`
                      : `Empty cell at row ${rowIdx + 1}, column ${colIdx + 1}`
                  }
                >
                  {cell === "X" && (
                    <div className="h-14 w-14 animate-pop text-bubblegum-500">
                      <XMark />
                    </div>
                  )}
                  {cell === "O" && (
                    <div className="h-14 w-14 animate-pop text-grape-500">
                      <OMark />
                    </div>
                  )}
                  {/* Hover ghost for empty cells */}
                  {isEmpty && canInteract && (
                    <div className="h-14 w-14 opacity-0 transition-opacity hover:opacity-20">
                      {mySymbol === "X" ? (
                        <XMark className="text-bubblegum-300" />
                      ) : (
                        <OMark className="text-grape-300" />
                      )}
                    </div>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Symbol indicator */}
      <div className="flex items-center gap-2 text-sm text-grape-500">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center",
            mySymbol === "X" ? "text-bubblegum-500" : "text-grape-500",
          )}
        >
          {mySymbol === "X" ? <XMark /> : <OMark />}
        </div>
        <span className="font-medium">
          You are {mySymbol}
        </span>
      </div>
    </div>
  );
}
