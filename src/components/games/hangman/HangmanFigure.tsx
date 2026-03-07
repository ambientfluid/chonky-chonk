"use client";

import { cn } from "@/lib/utils/cn";

export interface HangmanFigureProps {
  wrongGuesses: number;
}

/**
 * Progressively reveals a friendly hangman figure as wrong guesses increase.
 *
 * Parts revealed per wrongGuesses count:
 *   0: Gallows only (always shown)
 *   1: Head
 *   2: Body
 *   3: Left arm
 *   4: Right arm
 *   5: Left hand (small circle)
 *   6: Right hand (small circle)
 *   7: Left leg
 *   8: Right leg
 */
export function HangmanFigure({ wrongGuesses }: HangmanFigureProps) {
  const figureColor = "#ee3d8b"; // bubblegum-500
  const gallowsColor = "#c084fc"; // grape-400

  return (
    <svg
      viewBox="0 0 200 220"
      className="mx-auto h-48 w-48 sm:h-56 sm:w-56"
      aria-label={`Hangman figure: ${wrongGuesses} wrong guesses`}
    >
      {/* Gallows - always visible */}
      {/* Base */}
      <line
        x1="20"
        y1="200"
        x2="100"
        y2="200"
        stroke={gallowsColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Vertical pole */}
      <line
        x1="40"
        y1="200"
        x2="40"
        y2="30"
        stroke={gallowsColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Horizontal beam */}
      <line
        x1="40"
        y1="30"
        x2="120"
        y2="30"
        stroke={gallowsColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Rope */}
      <line
        x1="120"
        y1="30"
        x2="120"
        y2="55"
        stroke={gallowsColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Support brace */}
      <line
        x1="40"
        y1="60"
        x2="70"
        y2="30"
        stroke={gallowsColor}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* 1: Head */}
      <circle
        cx="120"
        cy="72"
        r="17"
        stroke={figureColor}
        strokeWidth="3.5"
        fill="none"
        className={cn(
          "transition-opacity duration-500",
          wrongGuesses >= 1 ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Cute face on the head */}
      {wrongGuesses >= 1 && (
        <g
          className={cn(
            "transition-opacity duration-500",
            wrongGuesses >= 1 ? "opacity-100" : "opacity-0",
          )}
        >
          {/* Eyes */}
          {wrongGuesses < 8 ? (
            <>
              <circle cx="114" cy="69" r="2" fill={figureColor} />
              <circle cx="126" cy="69" r="2" fill={figureColor} />
            </>
          ) : (
            <>
              {/* X eyes when fully drawn (game over) */}
              <line x1="111" y1="66" x2="117" y2="72" stroke={figureColor} strokeWidth="2" />
              <line x1="117" y1="66" x2="111" y2="72" stroke={figureColor} strokeWidth="2" />
              <line x1="123" y1="66" x2="129" y2="72" stroke={figureColor} strokeWidth="2" />
              <line x1="129" y1="66" x2="123" y2="72" stroke={figureColor} strokeWidth="2" />
            </>
          )}
          {/* Mouth */}
          {wrongGuesses < 7 ? (
            // Smile
            <path
              d="M 114 78 Q 120 84 126 78"
              stroke={figureColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            // Frown when close to losing
            <path
              d="M 114 82 Q 120 76 126 82"
              stroke={figureColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>
      )}

      {/* 2: Body */}
      <line
        x1="120"
        y1="89"
        x2="120"
        y2="140"
        stroke={figureColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        className={cn(
          "transition-opacity duration-500",
          wrongGuesses >= 2 ? "opacity-100" : "opacity-0",
        )}
      />

      {/* 3: Left arm */}
      <line
        x1="120"
        y1="100"
        x2="92"
        y2="120"
        stroke={figureColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        className={cn(
          "transition-opacity duration-500",
          wrongGuesses >= 3 ? "opacity-100" : "opacity-0",
        )}
      />

      {/* 4: Right arm */}
      <line
        x1="120"
        y1="100"
        x2="148"
        y2="120"
        stroke={figureColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        className={cn(
          "transition-opacity duration-500",
          wrongGuesses >= 4 ? "opacity-100" : "opacity-0",
        )}
      />

      {/* 5: Left hand (small circle) */}
      <circle
        cx="87"
        cy="124"
        r="5"
        stroke={figureColor}
        strokeWidth="2.5"
        fill="none"
        className={cn(
          "transition-opacity duration-500",
          wrongGuesses >= 5 ? "opacity-100" : "opacity-0",
        )}
      />

      {/* 6: Right hand (small circle) */}
      <circle
        cx="153"
        cy="124"
        r="5"
        stroke={figureColor}
        strokeWidth="2.5"
        fill="none"
        className={cn(
          "transition-opacity duration-500",
          wrongGuesses >= 6 ? "opacity-100" : "opacity-0",
        )}
      />

      {/* 7: Left leg */}
      <line
        x1="120"
        y1="140"
        x2="95"
        y2="175"
        stroke={figureColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        className={cn(
          "transition-opacity duration-500",
          wrongGuesses >= 7 ? "opacity-100" : "opacity-0",
        )}
      />

      {/* 8: Right leg */}
      <line
        x1="120"
        y1="140"
        x2="145"
        y2="175"
        stroke={figureColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        className={cn(
          "transition-opacity duration-500",
          wrongGuesses >= 8 ? "opacity-100" : "opacity-0",
        )}
      />
    </svg>
  );
}
