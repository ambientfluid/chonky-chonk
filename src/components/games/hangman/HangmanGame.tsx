"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { HangmanFigure } from "./HangmanFigure";

export interface HangmanGameProps {
  revealedWord: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrong: number;
  onGuess: (letter: string) => void;
  isGuesser: boolean;
  isMyTurn: boolean;
  category?: string;
  disabled?: boolean;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function HangmanGame({
  revealedWord,
  guessedLetters,
  wrongGuesses,
  maxWrong,
  onGuess,
  isGuesser,
  isMyTurn,
  category,
  disabled = false,
}: HangmanGameProps) {
  const canInteract = isMyTurn && isGuesser && !disabled;
  const guessedSet = new Set(guessedLetters.map((l) => l.toUpperCase()));
  const isLost = wrongGuesses >= maxWrong;
  const isWon = !revealedWord.includes("_");
  const isGameOver = isLost || isWon || disabled;

  const handleLetterClick = useCallback(
    (letter: string) => {
      if (!canInteract) return;
      if (guessedSet.has(letter)) return;
      onGuess(letter.toLowerCase());
    },
    [canInteract, guessedSet, onGuess],
  );

  // Determine letter status for keyboard styling
  const getLetterStatus = (letter: string): "correct" | "wrong" | "unused" => {
    if (!guessedSet.has(letter)) return "unused";
    // Check if the letter appears in the revealed word
    if (revealedWord.toUpperCase().includes(letter)) return "correct";
    return "wrong";
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Status bar */}
      <div className="flex items-center gap-3">
        {/* Turn indicator */}
        <div
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold",
            "transition-all duration-300",
            isGameOver
              ? isWon
                ? "bg-lime-100 text-lime-700"
                : isLost
                  ? "bg-bubblegum-100 text-bubblegum-600"
                  : "bg-grape-100 text-grape-500"
              : isMyTurn
                ? "bg-lime-100 text-lime-700 animate-pulse"
                : "bg-grape-100 text-grape-500",
          )}
        >
          {isGameOver
            ? isWon
              ? "Word guessed!"
              : isLost
                ? "Out of guesses!"
                : "Game Over"
            : isMyTurn && isGuesser
              ? "Pick a letter!"
              : isGuesser
                ? "Waiting..."
                : "Your friend is guessing"}
        </div>

        {/* Category badge */}
        {category && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
              "bg-sky-100 text-sky-600 text-xs font-semibold",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
            {category}
          </span>
        )}
      </div>

      {/* Wrong guesses counter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-grape-500">
          Wrong guesses:
        </span>
        <div className="flex gap-1">
          {Array.from({ length: maxWrong }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-3 rounded-full transition-all duration-300",
                i < wrongGuesses
                  ? "bg-bubblegum-400 scale-110"
                  : "bg-grape-200",
              )}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-grape-400">
          {wrongGuesses}/{maxWrong}
        </span>
      </div>

      {/* Hangman Figure */}
      <div
        className={cn(
          "rounded-2xl p-4",
          "bg-gradient-to-br from-grape-50 to-bubblegum-50",
          "shadow-inner",
        )}
      >
        <HangmanFigure wrongGuesses={wrongGuesses} />
      </div>

      {/* Word blanks */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-4">
        {revealedWord.split("").map((char, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center",
              "font-[family-name:var(--font-display)] text-2xl font-bold uppercase",
              "transition-all duration-300",
              char === " " && "w-4",
              char !== " " && [
                "h-12 w-10 sm:h-14 sm:w-12",
                "rounded-lg",
                char === "_"
                  ? "border-b-4 border-grape-300 bg-grape-50 text-transparent"
                  : "bg-white border-2 border-bubblegum-200 text-grape-700 animate-pop shadow-sm",
              ],
            )}
          >
            {char !== " " && char !== "_" ? char : ""}
          </div>
        ))}
      </div>

      {/* Alphabet keyboard */}
      {isGuesser && (
        <div className="w-full max-w-md px-2">
          <div className="flex flex-wrap justify-center gap-1.5">
            {ALPHABET.map((letter) => {
              const status = getLetterStatus(letter);
              const isUsed = status !== "unused";

              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={isUsed || !canInteract}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    "font-[family-name:var(--font-display)] text-sm font-bold",
                    "transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bubblegum-400",
                    // Unused letters
                    status === "unused" && [
                      "bg-white border-2 border-grape-200 text-grape-600",
                      canInteract &&
                        "hover:bg-bubblegum-50 hover:border-bubblegum-300 hover:scale-110 active:scale-95 cursor-pointer",
                      !canInteract && "opacity-50",
                    ],
                    // Correct guesses
                    status === "correct" && [
                      "bg-lime-100 border-2 border-lime-300 text-lime-700",
                      "opacity-70 cursor-default",
                    ],
                    // Wrong guesses
                    status === "wrong" && [
                      "bg-bubblegum-100 border-2 border-bubblegum-200 text-bubblegum-400",
                      "opacity-50 cursor-default line-through",
                    ],
                  )}
                  aria-label={`Guess letter ${letter}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
