"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GameType, GameInvite, Profile } from "@/types/database";

/* -------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------- */

export interface IncomingInvite extends GameInvite {
  from_profile: Profile;
}

interface UseGameInviteParams {
  userId: string;
}

interface UseGameInviteReturn {
  incomingInvites: IncomingInvite[];
  sendInvite: (toUserId: string, gameType: GameType) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<string | null>;
  declineInvite: (inviteId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/* -------------------------------------------------------------------------
 * Hook
 * ----------------------------------------------------------------------- */

export function useGameInvite({ userId }: UseGameInviteParams): UseGameInviteReturn {
  const [incomingInvites, setIncomingInvites] = useState<IncomingInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseRef = useRef(createClient());

  // -----------------------------------------------------------------------
  // Subscribe to incoming invites via postgres_changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    const supabase = supabaseRef.current;

    // Fetch any existing pending invites on mount
    async function fetchPendingInvites() {
      const { data, error: fetchError } = await supabase
        .from("game_invites")
        .select("*")
        .eq("to_user", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      if (data && data.length > 0) {
        // Fetch profiles for each invite sender
        const fromUserIds = [...new Set(data.map((invite) => invite.from_user))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", fromUserIds);

        const profileMap = new Map<string, Profile>();
        if (profiles) {
          for (const profile of profiles) {
            profileMap.set(profile.id, profile as Profile);
          }
        }

        const invitesWithProfiles: IncomingInvite[] = data
          .filter((invite) => profileMap.has(invite.from_user))
          .map((invite) => ({
            ...(invite as GameInvite),
            from_profile: profileMap.get(invite.from_user)!,
          }));

        setIncomingInvites(invitesWithProfiles);
      }
    }

    fetchPendingInvites();

    // Subscribe to new invites
    const channel = supabase
      .channel(`invites:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_invites",
          filter: `to_user=eq.${userId}`,
        },
        async (payload) => {
          const newInvite = payload.new as GameInvite;

          if (newInvite.status !== "pending") return;

          // Fetch the sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newInvite.from_user)
            .single();

          if (profile) {
            const inviteWithProfile: IncomingInvite = {
              ...newInvite,
              from_profile: profile as Profile,
            };

            setIncomingInvites((prev) => [inviteWithProfile, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // -----------------------------------------------------------------------
  // Send an invite
  // -----------------------------------------------------------------------
  const sendInvite = useCallback(
    async (toUserId: string, gameType: GameType) => {
      const supabase = supabaseRef.current;
      setLoading(true);
      setError(null);

      try {
        const { error: insertError } = await supabase
          .from("game_invites")
          .insert({
            from_user: userId,
            to_user: toUserId,
            game_type: gameType,
            status: "pending",
          });

        if (insertError) {
          setError(insertError.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send invite");
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  // -----------------------------------------------------------------------
  // Accept an invite
  // -----------------------------------------------------------------------
  const acceptInvite = useCallback(
    async (inviteId: string): Promise<string | null> => {
      const supabase = supabaseRef.current;
      setLoading(true);
      setError(null);

      try {
        // 1. Get the invite
        const { data: invite, error: fetchError } = await supabase
          .from("game_invites")
          .select("*")
          .eq("id", inviteId)
          .single();

        if (fetchError || !invite) {
          setError("Invite not found");
          return null;
        }

        const typedInvite = invite as GameInvite;

        // 2. Update invite status to accepted
        const { error: updateError } = await supabase
          .from("game_invites")
          .update({ status: "accepted" })
          .eq("id", inviteId);

        if (updateError) {
          setError(updateError.message);
          return null;
        }

        // 3. Create a Daily room for video chat
        let dailyRoomName: string | null = null;
        try {
          const roomResponse = await fetch("/api/daily/room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: `game-${crypto.randomUUID().slice(0, 8)}` }),
          });

          if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            dailyRoomName = roomData.name ?? null;
          }
        } catch {
          // Video chat is optional; continue without it
        }

        // 4. Create the game
        const { data: newGame, error: gameError } = await supabase
          .from("games")
          .insert({
            game_type: typedInvite.game_type,
            player1_id: typedInvite.from_user,
            player2_id: typedInvite.to_user,
            status: "active",
            current_turn: typedInvite.from_user,
            game_state: {},
            daily_room_name: dailyRoomName,
          })
          .select()
          .single();

        if (gameError || !newGame) {
          setError(gameError?.message ?? "Failed to create game");
          return null;
        }

        // 5. Remove from local incoming invites
        setIncomingInvites((prev) => prev.filter((inv) => inv.id !== inviteId));

        return (newGame as { id: string }).id;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to accept invite",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Decline an invite
  // -----------------------------------------------------------------------
  const declineInvite = useCallback(async (inviteId: string) => {
    const supabase = supabaseRef.current;
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("game_invites")
        .update({ status: "declined" })
        .eq("id", inviteId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setIncomingInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to decline invite",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    incomingInvites,
    sendInvite,
    acceptInvite,
    declineInvite,
    loading,
    error,
  };
}
