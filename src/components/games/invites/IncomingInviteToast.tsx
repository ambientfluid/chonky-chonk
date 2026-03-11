"use client";

import { useRouter } from "next/navigation";
import { Gamepad2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { GAME_CONFIG } from "@/lib/utils/constants";
import type { IncomingInvite } from "@/lib/hooks/useGameInvite";

export interface IncomingInviteToastProps {
  invite: IncomingInvite;
  onAccept: (inviteId: string) => Promise<string | null>;
  onDecline: (inviteId: string) => Promise<void>;
}

export function IncomingInviteToast({
  invite,
  onAccept,
  onDecline,
}: IncomingInviteToastProps) {
  const router = useRouter();
  const gameConfig = GAME_CONFIG[invite.game_type];

  async function handleAccept() {
    const gameId = await onAccept(invite.id);
    if (gameId) {
      router.push(`/games/${invite.game_type}/${gameId}`);
    }
  }

  async function handleDecline() {
    await onDecline(invite.id);
  }

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl shadow-grape-200/40",
        "animate-slide-in-right border border-grape-100",
        "max-w-sm",
      )}
    >
      <Avatar
        src={invite.from_profile.avatar_url}
        name={invite.from_profile.screen_name}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-800">
          {invite.from_profile.screen_name}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Gamepad2 className="h-3 w-3" />
          <span>wants to play {gameConfig?.name ?? invite.game_type}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={handleAccept}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            "bg-lime-500 text-white shadow-sm",
            "transition-all hover:scale-110 hover:shadow-md",
          )}
          aria-label="Accept invite"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleDecline}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            "bg-gray-200 text-gray-600",
            "transition-all hover:scale-110 hover:bg-bubblegum-100 hover:text-bubblegum-600",
          )}
          aria-label="Decline invite"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
