"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/useProfile";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface OnlineUser {
  user_id: string;
  screen_name: string;
  avatar_url: string | null;
  online_at: string;
}

interface UsePresenceReturn {
  onlineUsers: OnlineUser[];
  isOnline: (userId: string) => boolean;
}

export function usePresence(): UsePresenceReturn {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { profile } = useProfile();

  const isOnline = useCallback(
    (userId: string) => onlineUsers.some((u) => u.user_id === userId),
    [onlineUsers],
  );

  useEffect(() => {
    if (!profile) return;

    const supabase = createClient();

    const channel = supabase.channel("online-users", {
      config: { presence: { key: profile.id } },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<OnlineUser>();
        const users: OnlineUser[] = [];

        for (const key of Object.keys(state)) {
          const presences = state[key];
          if (presences && presences.length > 0) {
            // Take the most recent presence for each user
            const presence = presences[0];
            users.push({
              user_id: presence.user_id,
              screen_name: presence.screen_name,
              avatar_url: presence.avatar_url,
              online_at: presence.online_at,
            });
          }
        }

        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: profile.id,
            screen_name: profile.screen_name,
            avatar_url: profile.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  return { onlineUsers, isOnline };
}
