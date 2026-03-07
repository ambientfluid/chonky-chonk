"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Friendship, Profile } from "@/types/database";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface FriendWithProfile {
  friendship: Friendship;
  profile: Profile;
}

export interface PendingRequest {
  friendship: Friendship;
  fromProfile: Profile;
}

interface UseFriendsReturn {
  friends: FriendWithProfile[];
  pendingRequests: PendingRequest[];
  sendFriendRequest: (friendId: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  declineRequest: (friendshipId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useFriends(userId: string): UseFriendsReturn {
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const supabase = createClient();

  const fetchFriendships = useCallback(async () => {
    try {
      setError(null);

      // Fetch all friendships involving this user
      const { data: friendships, error: fetchError } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      if (!friendships) {
        setFriends([]);
        setPendingRequests([]);
        return;
      }

      const typedFriendships = friendships as Friendship[];

      // Separate accepted friendships and pending requests
      const accepted = typedFriendships.filter((f) => f.status === "accepted");
      const pending = typedFriendships.filter(
        (f) => f.status === "pending" && f.friend_id === userId,
      );

      // Collect all user IDs we need to look up
      const otherUserIds = new Set<string>();
      for (const f of accepted) {
        otherUserIds.add(f.user_id === userId ? f.friend_id : f.user_id);
      }
      for (const f of pending) {
        otherUserIds.add(f.user_id);
      }

      // Fetch profiles for all other users in one query
      let profileMap: Record<string, Profile> = {};

      if (otherUserIds.size > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", Array.from(otherUserIds));

        if (profileError) {
          setError(profileError.message);
          return;
        }

        if (profiles) {
          profileMap = Object.fromEntries(
            (profiles as Profile[]).map((p) => [p.id, p]),
          );
        }
      }

      // Build friends list
      const friendsList: FriendWithProfile[] = [];
      for (const f of accepted) {
        const otherId = f.user_id === userId ? f.friend_id : f.user_id;
        const profile = profileMap[otherId];
        if (profile) {
          friendsList.push({ friendship: f, profile });
        }
      }

      // Build pending requests list
      const requestsList: PendingRequest[] = [];
      for (const f of pending) {
        const profile = profileMap[f.user_id];
        if (profile) {
          requestsList.push({ friendship: f, fromProfile: profile });
        }
      }

      setFriends(friendsList);
      setPendingRequests(requestsList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch friendships.",
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchFriendships();
  }, [fetchFriendships]);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel(`friendships:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchFriendships();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `friend_id=eq.${userId}`,
        },
        () => {
          fetchFriendships();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, fetchFriendships]);

  const sendFriendRequest = useCallback(
    async (friendId: string) => {
      try {
        setError(null);

        const { error: insertError } = await supabase
          .from("friendships")
          .insert({
            user_id: userId,
            friend_id: friendId,
            status: "pending",
          });

        if (insertError) {
          setError(insertError.message);
          return;
        }

        // Refresh list
        await fetchFriendships();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send friend request.",
        );
      }
    },
    [userId, fetchFriendships, supabase],
  );

  const acceptRequest = useCallback(
    async (friendshipId: string) => {
      try {
        setError(null);

        // Update the existing friendship to accepted
        const { error: updateError } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("id", friendshipId);

        if (updateError) {
          setError(updateError.message);
          return;
        }

        // Refresh list
        await fetchFriendships();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to accept friend request.",
        );
      }
    },
    [fetchFriendships, supabase],
  );

  const declineRequest = useCallback(
    async (friendshipId: string) => {
      try {
        setError(null);

        const { error: updateError } = await supabase
          .from("friendships")
          .update({ status: "declined" })
          .eq("id", friendshipId);

        if (updateError) {
          setError(updateError.message);
          return;
        }

        await fetchFriendships();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to decline friend request.",
        );
      }
    },
    [fetchFriendships, supabase],
  );

  return {
    friends,
    pendingRequests,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    loading,
    error,
  };
}
