import type { GameState, IGameEngine } from "@/types/game";

interface HangmanBoard {
  revealedWord: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrong: number;
}

interface HangmanMove {
  letter: string;
}

function buildRevealedWord(word: string, guessedLetters: string[]): string {
  return word
    .split("")
    .map((ch) => {
      if (ch === " ") return "  ";
      return guessedLetters.includes(ch.toLowerCase()) ? ch.toLowerCase() : "_";
    })
    .join(" ");
}

function isWordFullyRevealed(word: string, guessedLetters: string[]): boolean {
  return word
    .toLowerCase()
    .split("")
    .every((ch) => ch === " " || guessedLetters.includes(ch));
}

export class HangmanEngine implements IGameEngine {
  createGame(): GameState {
    const board: HangmanBoard = {
      revealedWord: "",
      guessedLetters: [],
      wrongGuesses: 0,
      maxWrong: 8,
    };

    return {
      type: "hangman",
      board,
      currentTurn: "player1",
      status: "active",
      moveHistory: [],
      extra: { word: "", category: "" },
    };
  }

  createGameWithWord(word: string, category: string = "general"): GameState {
    const normalizedWord = word.toLowerCase();
    const board: HangmanBoard = {
      revealedWord: buildRevealedWord(normalizedWord, []),
      guessedLetters: [],
      wrongGuesses: 0,
      maxWrong: 8,
    };

    return {
      type: "hangman",
      board,
      currentTurn: "player2",
      status: "active",
      moveHistory: [],
      extra: { word: normalizedWord, category },
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

    const { letter } = move as HangmanMove;
    const normalizedLetter = letter.toLowerCase();

    if (!/^[a-z]$/.test(normalizedLetter)) {
      throw new Error("Move must be a single lowercase letter");
    }

    const board = state.board as HangmanBoard;
    const extra = state.extra as { word: string; category: string };

    if (board.guessedLetters.includes(normalizedLetter)) {
      throw new Error(`Letter "${normalizedLetter}" has already been guessed`);
    }

    const word = extra.word;
    const newGuessedLetters = [...board.guessedLetters, normalizedLetter];
    const isCorrect = word.includes(normalizedLetter);
    const newWrongGuesses = isCorrect ? board.wrongGuesses : board.wrongGuesses + 1;
    const newRevealedWord = buildRevealedWord(word, newGuessedLetters);

    const fullyRevealed = isWordFullyRevealed(word, newGuessedLetters);
    const tooManyWrong = newWrongGuesses >= board.maxWrong;

    let status: GameState["status"] = "active";
    let winner: GameState["winner"] = undefined;

    if (fullyRevealed) {
      status = "completed";
      winner = "player2";
    } else if (tooManyWrong) {
      status = "completed";
      winner = "player1";
    }

    const newBoard: HangmanBoard = {
      revealedWord: newRevealedWord,
      guessedLetters: newGuessedLetters,
      wrongGuesses: newWrongGuesses,
      maxWrong: board.maxWrong,
    };

    return {
      ...state,
      board: newBoard,
      currentTurn: "player2",
      status,
      winner,
      moveHistory: [
        ...state.moveHistory,
        {
          player,
          data: { letter: normalizedLetter },
          moveNumber: state.moveHistory.length + 1,
          timestamp: new Date().toISOString(),
        },
      ],
      extra,
    };
  }

  getLegalMoves(state: GameState): unknown[] {
    if (state.status !== "active") return [];

    const board = state.board as HangmanBoard;
    const allLetters = "abcdefghijklmnopqrstuvwxyz".split("");

    return allLetters
      .filter((letter) => !board.guessedLetters.includes(letter))
      .map((letter) => ({ letter }));
  }

  isGameOver(state: GameState): boolean {
    const board = state.board as HangmanBoard;
    const extra = state.extra as { word: string; category: string };

    if (board.wrongGuesses >= board.maxWrong) return true;
    if (extra.word && isWordFullyRevealed(extra.word, board.guessedLetters)) return true;

    return false;
  }

  getWinner(state: GameState): "player1" | "player2" | null {
    const board = state.board as HangmanBoard;
    const extra = state.extra as { word: string; category: string };

    if (extra.word && isWordFullyRevealed(extra.word, board.guessedLetters)) {
      return "player2";
    }
    if (board.wrongGuesses >= board.maxWrong) {
      return "player1";
    }
    return null;
  }

  serialize(state: GameState): string {
    return JSON.stringify(state);
  }

  deserialize(json: string): GameState {
    return JSON.parse(json) as GameState;
  }
}
