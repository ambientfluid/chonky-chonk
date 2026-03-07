"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { GAME_CONFIG } from "@/lib/utils/constants";
import type { GameInvite, Profile } from "@/types/database";
import { Crown, Circle, Hash, Pencil, Grid2x2 } from "lucide-react";

/* -------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------- */

export interface IncomingInviteToastProps {
  invite: GameInvite & { from_profile: Profile };
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
}

/* -------------------------------------------------------------------------
 * Icon map
 * ----------------------------------------------------------------------- */

const iconMap: Record<string, React.ReactNode> = {
  Crown: <Crown className="h-5 w-5" />,
  Circle: <Circle className="h-5 w-5" />,
  Hash: <Hash className="h-5 w-5" />,
  Pencil: <Pencil className="h-5 w-5" />,
  Grid2x2: <Grid2x2 className="h-5 w-5" />,
};

/* -------------------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------------- */

export function IncomingInviteToast({
  invite,
  onAccept,
  onDecline,
}: IncomingInviteToastProps) {
  const config = GAME_CONFIG[invite.game_type];

  const handleAccept = useCallback(() => {
    onAccept(invite.id);
  }, [invite.id, onAccept]);

  const handleDecline = useCallback(() => {
    onDecline(invite.id);
  }, [invite.id, onDecline]);

  return (
    <div
      className={cn(
        "pointer-events-auto w-80",
        "rounded-2xl border-2 border-bubblegum-200",
        "bg-gradient-to-br from-white via-bubblegum-50 to-grape-50",
        "p-4 shadow-xl shadow-bubblegum-200/40",
        "animate-slide-in-right",
      )}
      role="alert"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <Avatar
          src={invite.from_profile.avatar_url}
          name={invite.from_profile.screen_name}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-grape-700">
            {invite.from_profile.screen_name}
          </p>
          <p className="text-xs text-grape-400">wants to play!</p>
        </div>
        {/* Pulsing indicator */}
        <div className="h-3 w-3 animate-pulse rounded-full bg-bubblegum-400" />
      </div>

      {/* Game type badge */}
      <div
        className={cn(
          "mb-3 flex items-center gap-2 rounded-xl px-3 py-2",
          "bg-white/70 border border-grape-100",
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-white",
            `bg-gradient-to-br ${config.bgGradient}`,
          )}
        >
          {iconMap[config.icon]}
        </div>
        <div>
          <p className="text-sm font-bold text-grape-700">{config.name}</p>
          <p className="text-xs text-grape-400">{config.description}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAccept}
          className={cn(
            "flex-1 rounded-full py-2.5 text-sm font-bold",
            "bg-gradient-to-r from-lime-400 to-lime-500 text-white",
            "shadow-md shadow-lime-300/40",
            "transition-all duration-200",
            "hover:shadow-lg hover:shadow-lime-300/60 hover:scale-105",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400",
          )}
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          className={cn(
            "flex-1 rounded-full py-2.5 text-sm font-bold",
            "bg-grape-100 text-grape-500",
            "transition-all duration-200",
            "hover:bg-grape-200 hover:scale-105",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape-400",
          )}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
