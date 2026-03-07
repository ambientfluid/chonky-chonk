"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEngine } from "@/lib/games/engine-factory";
import type { Game } from "@/types/database";
import type { GameState } from "@/types/game";
import type { RealtimeChannel } from "@supabase/supabase-js";

/* -------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------- */

interface MovePayload {
  moveData: unknown;
  player: "player1" | "player2";
  newState: GameState;
}

interface ResignPayload {
  player: "player1" | "player2";
}

interface DrawOfferPayload {
  player: "player1" | "player2";
}

interface UseGameChannelParams {
  gameId: string;
  userId: string;
  game: Game;
  initialState: GameState;
}

interface UseGameChannelReturn {
  gameState: GameState;
  makeMove: (moveData: unknown) => Promise<boolean>;
  resign: () => Promise<void>;
  offerDraw: () => void;
  acceptDraw: () => void;
  declineDraw: () => void;
  opponentConnected: boolean;
  drawOffered: boolean;
  drawOfferedBy: "player1" | "player2" | null;
  error: string | null;
}

/* -------------------------------------------------------------------------
 * Hook
 * ----------------------------------------------------------------------- */

export function useGameChannel({
  gameId,
  userId,
  game,
  initialState,
}: UseGameChannelParams): UseGameChannelReturn {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [drawOffered, setDrawOffered] = useState(false);
  const [drawOfferedBy, setDrawOfferedBy] = useState<"player1" | "player2" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());
  const engineRef = useRef(getEngine(game.game_type));

  // Determine which player the current user is
  const myRole: "player1" | "player2" =
    userId === game.player1_id ? "player1" : "player2";

  // -----------------------------------------------------------------------
  // Subscribe to realtime channel
  // -----------------------------------------------------------------------
  useEffect(() => {
    const supabase = supabaseRef.current;
    const channelName = `game:${gameId}`;

    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } },
    });

    // -- Broadcast: opponent move ----------------------------------------
    channel.on("broadcast", { event: "move" }, ({ payload }) => {
      const movePayload = payload as MovePayload;
      // Only apply opponent moves (ignore our own echo)
      if (movePayload.player !== myRole) {
        setGameState(movePayload.newState);
      }
    });

    // -- Broadcast: resignation ------------------------------------------
    channel.on("broadcast", { event: "resign" }, ({ payload }) => {
      const resignPayload = payload as ResignPayload;
      setGameState((prev) => ({
        ...prev,
        status: "completed",
        winner: resignPayload.player === "player1" ? "player2" : "player1",
      }));
    });

    // -- Broadcast: draw offer -------------------------------------------
    channel.on("broadcast", { event: "draw-offer" }, ({ payload }) => {
      const drawPayload = payload as DrawOfferPayload;
      if (drawPayload.player !== myRole) {
        setDrawOffered(true);
        setDrawOfferedBy(drawPayload.player);
      }
    });

    // -- Broadcast: draw accepted ----------------------------------------
    channel.on("broadcast", { event: "draw-accept" }, () => {
      setGameState((prev) => ({
        ...prev,
        status: "draw",
      }));
      setDrawOffered(false);
      setDrawOfferedBy(null);
    });

    // -- Broadcast: draw declined ----------------------------------------
    channel.on("broadcast", { event: "draw-decline" }, () => {
      setDrawOffered(false);
      setDrawOfferedBy(null);
    });

    // -- Presence: track opponent connection ------------------------------
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const opponentId =
        userId === game.player1_id ? game.player2_id : game.player1_id;

      const opponentPresent = Object.values(state).some((presences) =>
        (presences as Array<{ presence_ref: string } & Record<string, unknown>>).some(
          (p) => {
            // Presence key is the userId
            return Object.keys(state).includes(opponentId);
          },
        ),
      );

      setOpponentConnected(opponentPresent);
    });

    channel.on("presence", { event: "join" }, ({ key }) => {
      const opponentId =
        userId === game.player1_id ? game.player2_id : game.player1_id;
      if (key === opponentId) {
        setOpponentConnected(true);
      }
    });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      const opponentId =
        userId === game.player1_id ? game.player2_id : game.player1_id;
      if (key === opponentId) {
        setOpponentConnected(false);
      }
    });

    // -- Subscribe and track presence ------------------------------------
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: userId, online_at: new Date().toISOString() });
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, userId]);

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const makeMove = useCallback(
    async (moveData: unknown): Promise<boolean> => {
      const engine = engineRef.current;
      const channel = channelRef.current;
      const supabase = supabaseRef.current;

      if (!channel) return false;

      try {
        // 1. Validate locally with the engine
        const newState = engine.makeMove(gameState, moveData, myRole);

        // 2. Optimistically update local state
        setGameState(newState);

        // 3. Broadcast to opponent
        await channel.send({
          type: "broadcast",
          event: "move",
          payload: {
            moveData,
            player: myRole,
            newState,
          } satisfies MovePayload,
        });

        // 4. Persist to database
        const currentTurn =
          newState.currentTurn === "player1"
            ? game.player1_id
            : game.player2_id;

        const gameStatus =
          newState.status === "completed" || newState.status === "draw"
            ? "completed"
            : "active";

        const winnerId =
          newState.winner === "player1"
            ? game.player1_id
            : newState.winner === "player2"
              ? game.player2_id
              : null;

        // Update game row
        await supabase
          .from("games")
          .update({
            game_state: newState as unknown as Record<string, unknown>,
            current_turn: currentTurn,
            status: gameStatus,
            winner_id: winnerId,
          })
          .eq("id", gameId);

        // Insert move record
        await supabase.from("game_moves").insert({
          game_id: gameId,
          player_id: userId,
          move_data: (typeof moveData === "object" && moveData !== null
            ? moveData
            : { value: moveData }) as Record<string, unknown>,
          move_number: newState.moveHistory.length,
        });

        setError(null);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to make move";
        setError(message);
        return false;
      }
    },
    [gameState, myRole, gameId, userId, game.player1_id, game.player2_id],
  );

  const resign = useCallback(async () => {
    const channel = channelRef.current;
    const supabase = supabaseRef.current;

    if (!channel) return;

    // Broadcast resignation
    await channel.send({
      type: "broadcast",
      event: "resign",
      payload: { player: myRole } satisfies ResignPayload,
    });

    // Update local state
    const winnerId =
      myRole === "player1" ? game.player2_id : game.player1_id;

    setGameState((prev) => ({
      ...prev,
      status: "completed",
      winner: myRole === "player1" ? "player2" : "player1",
    }));

    // Persist
    await supabase
      .from("games")
      .update({
        status: "completed",
        winner_id: winnerId,
      })
      .eq("id", gameId);
  }, [myRole, gameId, game.player1_id, game.player2_id]);

  const offerDraw = useCallback(() => {
    const channel = channelRef.current;
    if (!channel) return;

    setDrawOffered(true);
    setDrawOfferedBy(myRole);

    channel.send({
      type: "broadcast",
      event: "draw-offer",
      payload: { player: myRole } satisfies DrawOfferPayload,
    });
  }, [myRole]);

  const acceptDraw = useCallback(async () => {
    const channel = channelRef.current;
    const supabase = supabaseRef.current;

    if (!channel) return;

    await channel.send({
      type: "broadcast",
      event: "draw-accept",
      payload: {},
    });

    setGameState((prev) => ({
      ...prev,
      status: "draw",
    }));
    setDrawOffered(false);
    setDrawOfferedBy(null);

    // Persist
    await supabase
      .from("games")
      .update({
        status: "completed",
        winner_id: null,
      })
      .eq("id", gameId);
  }, [gameId]);

  const declineDraw = useCallback(() => {
    const channel = channelRef.current;
    if (!channel) return;

    channel.send({
      type: "broadcast",
      event: "draw-decline",
      payload: {},
    });

    setDrawOffered(false);
    setDrawOfferedBy(null);
  }, []);

  return {
    gameState,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    opponentConnected,
    drawOffered,
    drawOfferedBy,
    error,
  };
}
