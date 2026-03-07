"use client";

import { useState, useCallback } from "react";
import { useDaily, useLocalSessionId } from "@daily-co/daily-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function VideoControls() {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const toggleMic = useCallback(() => {
    if (!daily) return;
    daily.setLocalAudio(!isMicOn);
    setIsMicOn((prev) => !prev);
  }, [daily, isMicOn]);

  const toggleCam = useCallback(() => {
    if (!daily) return;
    daily.setLocalVideo(!isCamOn);
    setIsCamOn((prev) => !prev);
  }, [daily, isCamOn]);

  const leaveCall = useCallback(() => {
    if (!daily) return;
    daily.leave();
    // Navigate back after leaving
    window.history.back();
  }, [daily]);

  if (!localSessionId) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-3">
      {/* Toggle Mic */}
      <button
        onClick={toggleMic}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200",
          "hover:scale-110 active:scale-95",
          isMicOn
            ? "bg-grape-100 text-grape-600 hover:bg-grape-200"
            : "bg-bubblegum-500 text-white shadow-md shadow-bubblegum-300/40",
        )}
        aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
      >
        {isMicOn ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </button>

      {/* Toggle Camera */}
      <button
        onClick={toggleCam}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200",
          "hover:scale-110 active:scale-95",
          isCamOn
            ? "bg-grape-100 text-grape-600 hover:bg-grape-200"
            : "bg-bubblegum-500 text-white shadow-md shadow-bubblegum-300/40",
        )}
        aria-label={isCamOn ? "Turn off camera" : "Turn on camera"}
      >
        {isCamOn ? (
          <Video className="h-5 w-5" />
        ) : (
          <VideoOff className="h-5 w-5" />
        )}
      </button>

      {/* Leave Call */}
      <button
        onClick={leaveCall}
        className={cn(
          "flex h-11 w-14 items-center justify-center rounded-full transition-all duration-200",
          "bg-red-500 text-white shadow-md shadow-red-300/40",
          "hover:scale-110 hover:bg-red-600 active:scale-95",
        )}
        aria-label="Leave call"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  );
}
