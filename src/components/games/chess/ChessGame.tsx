"use client";

import { useState, useMemo, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { cn } from "@/lib/utils/cn";

export interface ChessGameProps {
  position: string;
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  isMyTurn: boolean;
  playerColor: "white" | "black";
  disabled?: boolean;
}

export function ChessGame({
  position,
  onMove,
  isMyTurn,
  playerColor,
  disabled = false,
}: ChessGameProps) {
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const canInteract = isMyTurn && !disabled;

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: "rgba(134, 239, 172, 0.5)",
      };
      styles[lastMove.to] = {
        backgroundColor: "rgba(134, 239, 172, 0.5)",
      };
    }

    // Highlight selected square
    if (moveFrom) {
      styles[moveFrom] = {
        backgroundColor: "rgba(246, 110, 171, 0.6)",
      };
    }

    return styles;
  }, [lastMove, moveFrom]);

  const handlePieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
      piece,
    }: {
      piece: { pieceType: string; position: string; isSparePiece: boolean };
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (!canInteract || !targetSquare) return false;

      // Check if this is a pawn promotion
      const pieceType = piece.pieceType;
      const isPromotion =
        pieceType.toLowerCase().includes("p") &&
        ((pieceType.startsWith("w") && targetSquare[1] === "8") ||
          (pieceType.startsWith("b") && targetSquare[1] === "1"));

      const move: { from: string; to: string; promotion?: string } = {
        from: sourceSquare,
        to: targetSquare,
      };

      if (isPromotion) {
        move.promotion = "q"; // Auto-promote to queen for simplicity
      }

      setLastMove({ from: sourceSquare, to: targetSquare });
      setMoveFrom(null);
      onMove(move);
      return true;
    },
    [canInteract, onMove],
  );

  const handleSquareClick = useCallback(
    ({
      square,
    }: {
      piece: { pieceType: string } | null;
      square: string;
    }) => {
      if (!canInteract) return;

      if (moveFrom) {
        // Try to make a move
        const move = { from: moveFrom, to: square };
        setLastMove(move);
        setMoveFrom(null);
        onMove(move);
      } else {
        setMoveFrom(square);
      }
    },
    [canInteract, moveFrom, onMove],
  );

  return (
    <div className={cn("flex flex-col items-center gap-4")}>
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
            ? "Your turn!"
            : "Waiting for opponent..."}
      </div>

      {/* Chess Board */}
      <div
        className={cn(
          "rounded-2xl p-3 shadow-lg transition-shadow duration-300",
          "bg-gradient-to-br from-bubblegum-100 via-grape-100 to-lime-100",
          canInteract && "shadow-bubblegum-200/60 shadow-xl",
          !canInteract && "opacity-90",
        )}
      >
        <div className="overflow-hidden rounded-xl">
          <Chessboard
            options={{
              id: "chonky-chess-board",
              position,
              onPieceDrop: handlePieceDrop,
              onSquareClick: handleSquareClick,
              boardOrientation: playerColor,
              allowDragging: canInteract,
              boardStyle: {
                borderRadius: "0.75rem",
              },
              darkSquareStyle: { backgroundColor: "#d8b4fe" },
              lightSquareStyle: { backgroundColor: "#fef1f7" },
              squareStyles: customSquareStyles,
              animationDurationInMs: 200,
            }}
          />
        </div>
      </div>

      {/* Playing as indicator */}
      <div className="flex items-center gap-2 text-sm text-grape-500">
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2 border-grape-300",
            playerColor === "white" ? "bg-white" : "bg-grape-800",
          )}
        />
        <span className="font-medium">
          Playing as {playerColor === "white" ? "White" : "Black"}
        </span>
      </div>
    </div>
  );
}
