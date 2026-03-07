"use client";

import { useEffect, useCallback } from "react";
import {
  DailyProvider,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  DailyAudio,
} from "@daily-co/daily-react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { VideoTile } from "@/components/video/VideoTile";
import { VideoControls } from "@/components/video/VideoControls";

/* -------------------------------------------------------------------------
 * Props
 * ----------------------------------------------------------------------- */

export interface VideoChatProps {
  roomUrl: string;
  userName: string;
}

/* -------------------------------------------------------------------------
 * Inner component that uses Daily hooks (must be inside DailyProvider)
 * ----------------------------------------------------------------------- */

function VideoInterface({ userName }: { userName: string }) {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  // Join on mount, leave on unmount
  const joinCall = useCallback(async () => {
    if (!daily) return;
    try {
      await daily.join({ userName });
    } catch (err) {
      console.error("Failed to join Daily call:", err);
    }
  }, [daily, userName]);

  useEffect(() => {
    joinCall();

    return () => {
      if (daily) {
        daily.leave().catch(() => {
          // Silently handle leave errors during unmount
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daily]);

  // Still connecting
  if (!localSessionId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-bubblegum-200 border-t-bubblegum-500" />
        <p className="mt-3 text-sm text-gray-400">Connecting to video chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Participant count */}
      <div className="flex items-center gap-2 px-1">
        <Users className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500">
          {remoteParticipantIds.length + 1} in call
        </span>
      </div>

      {/* Video grid */}
      <div
        className={cn(
          "grid gap-2",
          remoteParticipantIds.length === 0
            ? "grid-cols-1"
            : remoteParticipantIds.length <= 1
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-2",
        )}
      >
        {/* Local video */}
        <VideoTile sessionId={localSessionId} isLocal />

        {/* Remote videos */}
        {remoteParticipantIds.map((id) => (
          <VideoTile key={id} sessionId={id} />
        ))}
      </div>

      {/* Controls */}
      <VideoControls />

      {/* Audio (renders hidden audio elements for all participants) */}
      <DailyAudio />
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Main component with DailyProvider wrapper
 * ----------------------------------------------------------------------- */

export function VideoChat({ roomUrl, userName }: VideoChatProps) {
  return (
    <DailyProvider url={roomUrl}>
      <div className="rounded-2xl border border-grape-100 bg-white p-4 shadow-lg shadow-grape-100/40">
        <VideoInterface userName={userName} />
      </div>
    </DailyProvider>
  );
}
