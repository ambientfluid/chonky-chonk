"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import type { GameType } from "@/types/database";

export interface GameHelpDrawerProps {
  gameType: GameType;
  open: boolean;
  onClose: () => void;
}

const helpContent: Record<GameType, { title: string; sections: { heading: string; body: string }[] }> = {
  chess: {
    title: "How to Play Chess",
    sections: [
      {
        heading: "Objective",
        body: "Checkmate your opponent's King! This means the King is under attack and cannot escape.",
      },
      {
        heading: "Moving Pieces",
        body: "Drag and drop pieces to move them. Each type of piece moves differently: Pawns move forward, Rooks move in straight lines, Knights move in an L-shape, Bishops move diagonally, the Queen moves any direction, and the King moves one square any direction.",
      },
      {
        heading: "Special Moves",
        body: "Castling: Move your King two squares toward a Rook to castle. En Passant: Capture a pawn that just moved two squares. Promotion: When a Pawn reaches the other end, pick a new piece!",
      },
      {
        heading: "Tips",
        body: "Control the center of the board. Develop your pieces early. Keep your King safe by castling. Think ahead before moving!",
      },
    ],
  },
  checkers: {
    title: "How to Play Checkers",
    sections: [
      {
        heading: "Objective",
        body: "Capture all of your opponent's pieces or block them so they can't move!",
      },
      {
        heading: "Moving",
        body: "Click a piece to select it, then click a highlighted square to move. Regular pieces move diagonally forward one square at a time.",
      },
      {
        heading: "Capturing",
        body: "Jump over your opponent's pieces diagonally to capture them. If you can make another jump after capturing, you must take it (multi-jump)!",
      },
      {
        heading: "Kings",
        body: "When your piece reaches the far side of the board, it becomes a King! Kings can move and capture both forward and backward.",
      },
    ],
  },
  "tic-tac-toe": {
    title: "How to Play Tic-Tac-Toe",
    sections: [
      {
        heading: "Objective",
        body: "Get three of your marks in a row -- horizontally, vertically, or diagonally!",
      },
      {
        heading: "How to Play",
        body: "Take turns placing your mark (X or O) on any empty square. The first player to get three in a row wins!",
      },
      {
        heading: "Tips",
        body: "Try to take the center square first. Watch out for your opponent getting two in a row -- block them! Try to create a 'fork' where you have two ways to win.",
      },
    ],
  },
  hangman: {
    title: "How to Play Hangman",
    sections: [
      {
        heading: "Objective",
        body: "Guess the hidden word before the hangman is fully drawn!",
      },
      {
        heading: "Guessing",
        body: "Click on letters to guess them. If the letter is in the word, it will be revealed. If not, a part of the hangman is drawn.",
      },
      {
        heading: "Winning & Losing",
        body: "You win by guessing all the letters in the word. You lose if the hangman is fully drawn before you guess the word.",
      },
      {
        heading: "Hint",
        body: "Look at the category badge for a clue about what kind of word it is!",
      },
    ],
  },
  "connect-four": {
    title: "How to Play Connect Four",
    sections: [
      {
        heading: "Objective",
        body: "Be the first to connect four of your pieces in a row -- horizontally, vertically, or diagonally!",
      },
      {
        heading: "How to Play",
        body: "Click on a column to drop your piece. It will fall to the lowest available spot. Take turns with your opponent.",
      },
      {
        heading: "Strategy",
        body: "Try to build in multiple directions at once. Watch for your opponent's three-in-a-row and block them. The center column is often the strongest starting position.",
      },
    ],
  },
};

export function GameHelpDrawer({
  gameType,
  open,
  onClose,
}: GameHelpDrawerProps) {
  const content = helpContent[gameType];

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-grape-900/30 backdrop-blur-sm",
          "transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-sm",
          "flex flex-col",
          "bg-white shadow-2xl shadow-grape-200/60",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-6 py-4",
            "border-b border-grape-100",
            "bg-gradient-to-r from-bubblegum-50 to-grape-50",
          )}
        >
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-grape-700">
            {content.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close help"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "text-grape-400 transition-colors",
              "hover:bg-grape-100 hover:text-grape-600",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {content.sections.map((section, i) => (
              <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
                <h3
                  className={cn(
                    "mb-2 text-base font-bold font-[family-name:var(--font-display)]",
                    "text-bubblegum-500",
                  )}
                >
                  {section.heading}
                </h3>
                <p className="text-sm leading-relaxed text-grape-600">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-grape-100 px-6 py-4">
          <button
            onClick={onClose}
            className={cn(
              "w-full rounded-full py-2.5",
              "bg-gradient-to-r from-bubblegum-400 to-bubblegum-500",
              "text-sm font-semibold text-white",
              "shadow-md shadow-bubblegum-300/40",
              "transition-all duration-200",
              "hover:shadow-lg hover:shadow-bubblegum-300/60 hover:scale-[1.02]",
              "active:scale-[0.98]",
            )}
          >
            Got it!
          </button>
        </div>
      </div>
    </>
  );
}
