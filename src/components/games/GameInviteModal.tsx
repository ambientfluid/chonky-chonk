"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { GAME_CONFIG } from "@/lib/utils/constants";
import type { Profile, GameType } from "@/types/database";
import { Crown, Circle, Hash, Pencil, Grid2x2 } from "lucide-react";

/* -------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------- */

export interface GameInviteModalProps {
  open: boolean;
  onClose: () => void;
  targetUser: Profile;
  onSendInvite: (toUserId: string, gameType: GameType) => Promise<void>;
}

/* -------------------------------------------------------------------------
 * Icon map
 * ----------------------------------------------------------------------- */

const iconMap: Record<string, React.ReactNode> = {
  Crown: <Crown className="h-6 w-6" />,
  Circle: <Circle className="h-6 w-6" />,
  Hash: <Hash className="h-6 w-6" />,
  Pencil: <Pencil className="h-6 w-6" />,
  Grid2x2: <Grid2x2 className="h-6 w-6" />,
};

/* -------------------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------------- */

export function GameInviteModal({
  open,
  onClose,
  targetUser,
  onSendInvite,
}: GameInviteModalProps) {
  const [sending, setSending] = useState(false);
  const [sentGameType, setSentGameType] = useState<GameType | null>(null);

  const handleSendInvite = useCallback(
    async (gameType: GameType) => {
      setSending(true);
      setSentGameType(null);

      try {
        await onSendInvite(targetUser.id, gameType);
        setSentGameType(gameType);
      } finally {
        setSending(false);
      }
    },
    [onSendInvite, targetUser.id],
  );

  const handleClose = useCallback(() => {
    setSentGameType(null);
    setSending(false);
    onClose();
  }, [onClose]);

  const gameTypes = Object.entries(GAME_CONFIG) as [
    GameType,
    (typeof GAME_CONFIG)[GameType],
  ][];

  return (
    <Modal open={open} onClose={handleClose} title="Challenge to a Game">
      <div className="space-y-6">
        {/* Target user info */}
        <div className="flex items-center gap-3 rounded-xl bg-grape-50 px-4 py-3">
          <Avatar
            src={targetUser.avatar_url}
            name={targetUser.screen_name}
            size="md"
          />
          <div>
            <p className="text-sm text-grape-400">Challenging</p>
            <p className="font-bold text-grape-700">
              {targetUser.screen_name}
            </p>
          </div>
        </div>

        {/* Sent confirmation */}
        {sentGameType && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3",
              "bg-lime-50 border border-lime-200",
              "animate-pop",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-lime-500"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-semibold text-lime-700">
              Invite sent for {GAME_CONFIG[sentGameType].name}!
            </span>
          </div>
        )}

        {/* Game type grid */}
        <div>
          <p className="mb-3 text-sm font-semibold text-grape-500">
            Pick a game
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gameTypes.map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleSendInvite(type)}
                disabled={sending}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl p-4",
                  "border-2 border-grape-100",
                  "transition-all duration-200",
                  "hover:border-bubblegum-300 hover:bg-bubblegum-50 hover:scale-105",
                  "active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bubblegum-400",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  sentGameType === type && "border-lime-400 bg-lime-50",
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl text-white",
                    `bg-gradient-to-br ${config.bgGradient}`,
                  )}
                >
                  {iconMap[config.icon]}
                </div>
                <span className="text-sm font-semibold text-grape-700">
                  {config.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            {sentGameType ? "Done" : "Cancel"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
