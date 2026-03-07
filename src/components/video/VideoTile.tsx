"use client";

import { DailyVideo, useParticipantProperty } from "@daily-co/daily-react";
import { MicOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface VideoTileProps {
  sessionId: string;
  isLocal?: boolean;
}

export function VideoTile({ sessionId, isLocal = false }: VideoTileProps) {
  const userName = useParticipantProperty(sessionId, "user_name");
  const audioState = useParticipantProperty(sessionId, "tracks.audio.state");
  const videoState = useParticipantProperty(sessionId, "tracks.video.state");

  const isMuted = audioState === "off" || audioState === "blocked";
  const isVideoOff = videoState === "off" || videoState === "blocked";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gray-900",
        "aspect-video",
        "ring-2",
        isLocal
          ? "ring-bubblegum-400/50"
          : "ring-grape-300/30",
      )}
    >
      {/* Video element */}
      {!isVideoOff ? (
        <DailyVideo
          sessionId={sessionId}
          mirror={isLocal}
          type="video"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-grape-800 to-grape-900">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-bubblegum-400 via-grape-400 to-lime-400 text-xl font-bold text-white">
            {(userName as string)?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-semibold text-white">
            {isLocal ? "You" : (userName as string) ?? "User"}
          </span>

          {/* Muted indicator */}
          {isMuted && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80">
              <MicOff className="h-3 w-3 text-white" />
            </span>
          )}
        </div>
      </div>

      {/* Local badge */}
      {isLocal && (
        <div className="absolute left-2 top-2">
          <span className="rounded-full bg-bubblegum-500/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            YOU
          </span>
        </div>
      )}
    </div>
  );
}
