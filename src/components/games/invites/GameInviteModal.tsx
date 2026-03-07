"use client";

import { useState } from "react";
import { Gamepad2, Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { GAME_CONFIG } from "@/lib/utils/constants";
import { useGameInvite } from "@/lib/hooks/useGameInvite";
import type { GameType } from "@/types/database";

export interface GameInviteModalProps {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  targetUserId: string;
  targetScreenName: string;
  targetAvatarUrl: string | null;
}

export function GameInviteModal({
  open,
  onClose,
  currentUserId,
  targetUserId,
  targetScreenName,
  targetAvatarUrl,
}: GameInviteModalProps) {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [sent, setSent] = useState(false);
  const { sendInvite, loading } = useGameInvite({ userId: currentUserId });

  async function handleSendInvite() {
    if (!selectedGame) return;

    await sendInvite(targetUserId, selectedGame);
    setSent(true);

    // Auto-close after a brief delay
    setTimeout(() => {
      setSent(false);
      setSelectedGame(null);
      onClose();
    }, 1500);
  }

  function handleClose() {
    setSent(false);
    setSelectedGame(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Invite to Play">
      <div className="space-y-5">
        {/* Target user info */}
        <div className="flex items-center gap-3 rounded-xl bg-grape-50 p-3">
          <Avatar
            src={targetAvatarUrl}
            name={targetScreenName}
            size="md"
          />
          <div>
            <p className="text-sm font-bold text-gray-800">
              {targetScreenName}
            </p>
            <p className="text-xs text-gray-500">Choose a game to play together</p>
          </div>
        </div>

        {/* Game selection grid */}
        {!sent ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {(
                Object.entries(GAME_CONFIG) as [
                  GameType,
                  (typeof GAME_CONFIG)[GameType],
                ][]
              ).map(([gameType, config]) => (
                <button
                  key={gameType}
                  onClick={() => setSelectedGame(gameType)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200",
                    "hover:scale-[1.02] hover:shadow-md",
                    selectedGame === gameType
                      ? "border-bubblegum-400 bg-bubblegum-50 shadow-sm"
                      : "border-gray-100 bg-white hover:border-grape-200",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                      config.bgGradient,
                    )}
                  >
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {config.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Send button */}
            <Button
              onClick={handleSendInvite}
              disabled={!selectedGame || loading}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Sending..." : "Send Invite"}
            </Button>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-100">
              <Gamepad2 className="h-8 w-8 text-lime-600" />
            </div>
            <p className="mt-3 text-lg font-bold text-gray-800">
              Invite Sent!
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Waiting for {targetScreenName} to accept...
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
