"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { getEngine } from "@/lib/games/engine-factory";
import { useGameChannel } from "@/lib/hooks/useGameChannel";
import { useGameInvite } from "@/lib/hooks/useGameInvite";
import { GAME_CONFIG } from "@/lib/utils/constants";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GameControls } from "@/components/games/GameControls";
import { GameHelpDrawer } from "@/components/games/GameHelpDrawer";
import { VideoChat } from "@/components/video/VideoChat";
import { ChessGame } from "@/components/games/chess/ChessGame";
import { CheckersGame } from "@/components/games/checkers/CheckersGame";
import { TicTacToeGame } from "@/components/games/tictactoe/TicTacToeGame";
import { HangmanGame } from "@/components/games/hangman/HangmanGame";
import { ConnectFourGame } from "@/components/games/connect-four/ConnectFourGame";
import type { Game, Profile } from "@/types/database";
import type { GameState } from "@/types/game";

/* -------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------- */

export interface GameSessionProps {
  game: Game;
  profile: Profile;
  opponentProfile: Profile;
  userId: string;
}

/* -------------------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------------- */

export function GameSession({
  game,
  profile,
  opponentProfile,
  userId,
}: GameSessionProps) {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const dailyDomain =
    process.env.NEXT_PUBLIC_DAILY_DOMAIN || "chonky-chonk";
  const videoRoomUrl = game.daily_room_name
    ? `https://${dailyDomain}.daily.co/${game.daily_room_name}`
    : null;

  const config = GAME_CONFIG[game.game_type];

  // Determine player role
  const myRole: "player1" | "player2" =
    userId === game.player1_id ? "player1" : "player2";

  // Initialize engine and state
  const engine = useMemo(() => getEngine(game.game_type), [game.game_type]);

  const initialState: GameState = useMemo(() => {
    // If game has existing state, deserialize it
    if (game.game_state && Object.keys(game.game_state).length > 0) {
      try {
        // game_state is stored as a JSON object that matches GameState
        const stored = game.game_state as unknown as GameState;
        if (stored.type && stored.board !== undefined) {
          return stored;
        }
      } catch {
        // Fall through to create new
      }
    }
    // Create new game state
    return engine.createGame();
  }, [game.game_state, engine]);

  // Real-time channel
  const {
    gameState,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    opponentConnected,
    drawOffered,
    drawOfferedBy,
    error: channelError,
  } = useGameChannel({
    gameId: game.id,
    userId,
    game,
    initialState,
  });

  // Game invite (for "Play Again")
  const { sendInvite } = useGameInvite({ userId });

  // Derived state
  const isMyTurn = gameState.currentTurn === myRole;
  const isGameOver =
    gameState.status === "completed" || gameState.status === "draw";
  const iWon = gameState.winner === myRole;
  const isDraw = gameState.status === "draw";

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleMove = useCallback(
    async (moveData: unknown) => {
      await makeMove(moveData);
    },
    [makeMove],
  );

  const handleResign = useCallback(() => {
    resign();
  }, [resign]);

  const handleOfferDraw = useCallback(() => {
    offerDraw();
  }, [offerDraw]);

  const handlePlayAgain = useCallback(async () => {
    await sendInvite(opponentProfile.id, game.game_type);
  }, [sendInvite, opponentProfile.id, game.game_type]);

  const handleBackToGames = useCallback(() => {
    router.push("/games");
  }, [router]);

  // -----------------------------------------------------------------------
  // Game Board Renderer
  // -----------------------------------------------------------------------

  function renderGameBoard() {
    switch (game.game_type) {
      case "chess": {
        const board = gameState.board as { fen?: string };
        return (
          <ChessGame
            position={
              typeof board === "string" ? board : (board?.fen ?? "start")
            }
            onMove={handleMove}
            isMyTurn={isMyTurn}
            playerColor={myRole === "player1" ? "white" : "black"}
            disabled={isGameOver}
          />
        );
      }

      case "checkers": {
        const board = gameState.board as import("@/components/games/checkers/CheckersGame").CheckerCell[][];
        const legalMoves = (engine.getLegalMoves(gameState) as string[]) ?? [];
        return (
          <CheckersGame
            board={board}
            onMove={handleMove as (move: string) => void}
            isMyTurn={isMyTurn}
            playerSide={myRole === "player1" ? "white" : "black"}
            legalMoves={isMyTurn ? legalMoves : []}
            disabled={isGameOver}
          />
        );
      }

      case "tic-tac-toe": {
        const board = gameState.board as (string | null)[][];
        const extra = gameState.extra as { winLine?: number[][] | null } | undefined;
        return (
          <TicTacToeGame
            board={board}
            onMove={handleMove}
            isMyTurn={isMyTurn}
            mySymbol={myRole === "player1" ? "X" : "O"}
            disabled={isGameOver}
            winLine={extra?.winLine}
          />
        );
      }

      case "hangman": {
        const board = gameState.board as {
          revealedWord: string;
          guessedLetters: string[];
          wrongGuesses: number;
          maxWrong: number;
        };
        const extra = gameState.extra as { category?: string } | undefined;
        // Player 1 picks the word, Player 2 guesses
        const isGuesser = myRole === "player2";
        return (
          <HangmanGame
            revealedWord={board.revealedWord}
            guessedLetters={board.guessedLetters}
            wrongGuesses={board.wrongGuesses}
            maxWrong={board.maxWrong}
            onGuess={(letter) => handleMove({ letter })}
            isGuesser={isGuesser}
            isMyTurn={isMyTurn}
            category={extra?.category}
            disabled={isGameOver}
          />
        );
      }

      case "connect-four": {
        const board = gameState.board as (string | null)[][];
        const extra = gameState.extra as { winCells?: number[][] | null } | undefined;
        return (
          <ConnectFourGame
            board={board}
            onMove={handleMove}
            isMyTurn={isMyTurn}
            myColor={myRole === "player1" ? "R" : "Y"}
            disabled={isGameOver}
            winCells={extra?.winCells}
          />
        );
      }

      default:
        return (
          <div className="py-12 text-center text-grape-500">
            Unknown game type
          </div>
        );
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToGames}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              "bg-grape-50 text-grape-400",
              "transition-all duration-200",
              "hover:bg-grape-100 hover:text-grape-600 hover:scale-105",
              "active:scale-95",
            )}
            aria-label="Back to games"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-grape-700">
              {config.name}
            </h1>
            <Badge variant={isGameOver ? "pink" : "green"}>
              {isGameOver
                ? isDraw
                  ? "Draw"
                  : iWon
                    ? "You won!"
                    : "You lost"
                : "Live"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {videoRoomUrl && (
            <button
              onClick={() => setVideoOpen((v) => !v)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                videoOpen
                  ? "bg-bubblegum-100 text-bubblegum-600"
                  : "bg-grape-50 text-grape-400 hover:bg-grape-100 hover:text-grape-600",
              )}
              aria-label={videoOpen ? "Close video chat" : "Open video chat"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.218-.584l-3.032 2.422v6.824l3.032 2.422A.75.75 0 0019 15.25V4.75z" />
              </svg>
            </button>
          )}
        <button
          onClick={() => setHelpOpen(true)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            "bg-grape-50 text-grape-400",
            "transition-all duration-200",
            "hover:bg-grape-100 hover:text-grape-600 hover:scale-105",
            "active:scale-95",
          )}
          aria-label="Game help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left panel: Game board */}
        <Card variant="game" className="flex items-center justify-center p-4 sm:p-6">
          {renderGameBoard()}
        </Card>

        {/* Right panel: Side info */}
        <div className="space-y-4">
          {/* Video chat */}
          {videoOpen && videoRoomUrl && (
            <VideoChat roomUrl={videoRoomUrl} userName={profile.screen_name} />
          )}

          {/* Players card */}
          <Card className="space-y-3 p-4">
            <h3 className="text-sm font-bold text-grape-400">Players</h3>

            {/* My info */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2",
                isMyTurn && !isGameOver
                  ? "bg-lime-50 border border-lime-200"
                  : "bg-grape-50",
              )}
            >
              <Avatar
                src={profile.avatar_url}
                name={profile.screen_name}
                size="sm"
                online
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-grape-700">
                  {profile.screen_name}
                </p>
                <p className="text-xs text-grape-400">You</p>
              </div>
              {isMyTurn && !isGameOver && (
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-lime-400" />
              )}
            </div>

            {/* VS divider */}
            <div className="flex items-center gap-2 px-2">
              <div className="h-px flex-1 bg-grape-100" />
              <span className="text-xs font-bold text-grape-300">VS</span>
              <div className="h-px flex-1 bg-grape-100" />
            </div>

            {/* Opponent info */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2",
                !isMyTurn && !isGameOver
                  ? "bg-lime-50 border border-lime-200"
                  : "bg-grape-50",
              )}
            >
              <Avatar
                src={opponentProfile.avatar_url}
                name={opponentProfile.screen_name}
                size="sm"
                online={opponentConnected}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-grape-700">
                  {opponentProfile.screen_name}
                </p>
                <p className="text-xs text-grape-400">
                  {opponentConnected ? "Online" : "Offline"}
                </p>
              </div>
              {!isMyTurn && !isGameOver && (
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-lime-400" />
              )}
            </div>
          </Card>

          {/* Draw offer banner */}
          {drawOffered && drawOfferedBy !== myRole && (
            <Card
              className={cn(
                "space-y-3 p-4",
                "border-2 border-bubblegum-200",
                "animate-pop",
              )}
            >
              <p className="text-sm font-bold text-grape-700">
                {opponentProfile.screen_name} offers a draw!
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={acceptDraw}>
                  Accept Draw
                </Button>
                <Button size="sm" variant="ghost" onClick={declineDraw}>
                  Decline
                </Button>
              </div>
            </Card>
          )}

          {/* Game controls */}
          {!isGameOver && (
            <GameControls
              onResign={handleResign}
              onOfferDraw={
                game.game_type !== "hangman" ? handleOfferDraw : undefined
              }
              gameStatus={gameState.status}
              isMyTurn={isMyTurn}
            />
          )}

          {/* Game over card */}
          {isGameOver && (
            <Card
              className={cn(
                "space-y-4 p-4 text-center",
                "border-2",
                isDraw
                  ? "border-grape-200 bg-grape-50"
                  : iWon
                    ? "border-lime-200 bg-lime-50"
                    : "border-bubblegum-200 bg-bubblegum-50",
              )}
            >
              <div className="animate-pop">
                <div className="text-4xl">
                  {isDraw ? "🤝" : iWon ? "🎉" : "😢"}
                </div>
                <h3
                  className={cn(
                    "mt-2 font-[family-name:var(--font-display)] text-xl font-bold",
                    isDraw
                      ? "text-grape-600"
                      : iWon
                        ? "text-lime-700"
                        : "text-bubblegum-600",
                  )}
                >
                  {isDraw
                    ? "It's a Draw!"
                    : iWon
                      ? "You Won!"
                      : "Better Luck Next Time!"}
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={handlePlayAgain}>
                  Play Again
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleBackToGames}
                >
                  Back to Games
                </Button>
              </div>
            </Card>
          )}

          {/* Move history */}
          {gameState.moveHistory.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-2 text-sm font-bold text-grape-400">
                Move History
              </h3>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {gameState.moveHistory
                  .slice()
                  .reverse()
                  .map((move, i) => (
                    <div
                      key={gameState.moveHistory.length - i}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-1.5",
                        "text-xs",
                        i % 2 === 0 ? "bg-grape-50" : "bg-white",
                      )}
                    >
                      <span className="font-mono font-bold text-grape-400">
                        #{move.moveNumber}
                      </span>
                      <span className="font-medium text-grape-600">
                        {move.player === myRole ? "You" : opponentProfile.screen_name}
                      </span>
                      <span className="text-grape-400">
                        {typeof move.data === "object" && move.data !== null
                          ? JSON.stringify(move.data)
                          : String(move.data)}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Error display */}
          {channelError && (
            <div
              className={cn(
                "rounded-xl border border-bubblegum-200 bg-bubblegum-50 px-4 py-3",
                "text-sm text-bubblegum-600",
              )}
              role="alert"
            >
              {channelError}
            </div>
          )}
        </div>
      </div>

      {/* Help drawer */}
      <GameHelpDrawer
        gameType={game.game_type}
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </div>
  );
}
