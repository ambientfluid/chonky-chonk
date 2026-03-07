"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

export interface GameControlsProps {
  onResign: () => void;
  onOfferDraw?: () => void;
  gameStatus: string;
  isMyTurn: boolean;
}

export function GameControls({
  onResign,
  onOfferDraw,
  gameStatus,
  isMyTurn,
}: GameControlsProps) {
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const isActive = gameStatus === "active";

  const handleResignClick = useCallback(() => {
    if (showResignConfirm) {
      onResign();
      setShowResignConfirm(false);
    } else {
      setShowResignConfirm(true);
    }
  }, [showResignConfirm, onResign]);

  const handleCancelResign = useCallback(() => {
    setShowResignConfirm(false);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        "rounded-2xl bg-white px-4 py-3",
        "shadow-md shadow-grape-100/50",
        "border border-grape-100",
      )}
    >
      {/* Turn indicator */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-3 w-3 rounded-full transition-colors duration-300",
            isActive
              ? isMyTurn
                ? "bg-lime-400 animate-pulse"
                : "bg-grape-300"
              : "bg-gray-300",
          )}
        />
        <span
          className={cn(
            "text-sm font-semibold",
            isActive
              ? isMyTurn
                ? "text-lime-700"
                : "text-grape-500"
              : "text-gray-500",
          )}
        >
          {!isActive
            ? "Game ended"
            : isMyTurn
              ? "Your turn"
              : "Opponent's turn"}
        </span>
      </div>

      {/* Action buttons */}
      {isActive && (
        <div className="flex items-center gap-2">
          {/* Offer Draw */}
          {onOfferDraw && (
            <button
              onClick={onOfferDraw}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2",
                "text-sm font-semibold",
                "bg-grape-100 text-grape-600",
                "transition-all duration-200",
                "hover:bg-grape-200 hover:scale-105",
                "active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape-400",
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.28a.75.75 0 00-.75.75v3.955a.75.75 0 001.5 0v-2.134l.228.228a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.168-7.179a.75.75 0 00-1.5 0v2.134l-.228-.229A7 7 0 003.04 9.287a.75.75 0 101.45.388 5.5 5.5 0 019.201-2.466l.312.311H11.57a.75.75 0 100 1.5h3.951a.75.75 0 00.75-.75V4.245z"
                  clipRule="evenodd"
                />
              </svg>
              Offer Draw
            </button>
          )}

          {/* Resign */}
          {showResignConfirm ? (
            <div className="flex items-center gap-1.5 animate-pop">
              <span className="text-xs font-medium text-bubblegum-600">
                Are you sure?
              </span>
              <button
                onClick={handleResignClick}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold",
                  "bg-bubblegum-500 text-white",
                  "transition-all duration-200",
                  "hover:bg-bubblegum-600 hover:scale-105",
                  "active:scale-95",
                )}
              >
                Yes, resign
              </button>
              <button
                onClick={handleCancelResign}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold",
                  "bg-grape-100 text-grape-600",
                  "transition-all duration-200",
                  "hover:bg-grape-200 hover:scale-105",
                  "active:scale-95",
                )}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleResignClick}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2",
                "text-sm font-semibold",
                "bg-bubblegum-100 text-bubblegum-600",
                "transition-all duration-200",
                "hover:bg-bubblegum-200 hover:scale-105",
                "active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bubblegum-400",
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M3 2a.75.75 0 01.75.75v.443c.572.055 1.14.122 1.706.2C6.862 3.58 8.243 3.75 9.5 3.75c1.256 0 2.637-.17 4.044-.357a41.31 41.31 0 011.706-.2.75.75 0 01.75.75v8.5a.75.75 0 01-.544.721c-.534.15-1.085.286-1.656.406C12.296 13.81 10.876 14 9.5 14c-1.376 0-2.796-.19-4.3-.43a42.71 42.71 0 01-1.45-.348v4.028a.75.75 0 01-1.5 0V2.75A.75.75 0 013 2z"
                  clipRule="evenodd"
                />
              </svg>
              Resign
            </button>
          )}
        </div>
      )}
    </div>
  );
}
