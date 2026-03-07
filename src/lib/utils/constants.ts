import { GameType } from "@/types/database";

export const GAME_CONFIG: Record<GameType, { name: string; description: string; icon: string; color: string; bgGradient: string }> = {
  chess: {
    name: "Chess",
    description: "The classic strategy game of kings and queens",
    icon: "Crown",
    color: "grape",
    bgGradient: "from-grape-400 to-grape-600",
  },
  checkers: {
    name: "Checkers",
    description: "Jump and capture your way to victory",
    icon: "Circle",
    color: "bubblegum",
    bgGradient: "from-bubblegum-400 to-bubblegum-600",
  },
  "tic-tac-toe": {
    name: "Tic-Tac-Toe",
    description: "Three in a row wins the show",
    icon: "Hash",
    color: "lime",
    bgGradient: "from-lime-400 to-lime-600",
  },
  hangman: {
    name: "Hangman",
    description: "Guess the word before time runs out",
    icon: "Pencil",
    color: "sky",
    bgGradient: "from-sky-400 to-sky-500",
  },
  "connect-four": {
    name: "Connect Four",
    description: "Drop discs and connect four to win",
    icon: "Grid2x2",
    color: "bubblegum",
    bgGradient: "from-bubblegum-300 to-grape-400",
  },
};

export const MAX_BIO_LENGTH = 200;
export const MAX_SCREEN_NAME_LENGTH = 30;
