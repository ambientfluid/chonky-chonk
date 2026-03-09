import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEngine } from "@/lib/games/engine-factory";
import type { Game } from "@/types/database";
import type { GameState } from "@/types/game";

export const runtime = "edge";

/* -------------------------------------------------------------------------
 * POST /api/games/[gameId]/move
 * Server-validated move endpoint (primarily for Hangman where the word
 * must remain hidden from the guessing player).
 * ----------------------------------------------------------------------- */

interface RouteContext {
  params: Promise<{ gameId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { gameId } = await context.params;

  // 1. Verify the user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch the game
  const { data: gameRow, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (gameError || !gameRow) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const game = gameRow as Game;

  // 3. Verify the user is a participant
  if (game.player1_id !== user.id && game.player2_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Verify the game is active
  if (game.status !== "active") {
    return NextResponse.json(
      { error: "Game is not active" },
      { status: 400 },
    );
  }

  // 5. Parse the move data
  const body = await request.json();
  const { moveData } = body as { moveData: unknown };

  if (moveData === undefined || moveData === null) {
    return NextResponse.json(
      { error: "Move data is required" },
      { status: 400 },
    );
  }

  // 6. Determine the player's role
  const playerRole: "player1" | "player2" =
    user.id === game.player1_id ? "player1" : "player2";

  // 7. Reconstruct game state from the database
  const engine = getEngine(game.game_type);
  let currentState: GameState;

  try {
    const storedState = game.game_state as unknown as GameState;
    if (storedState && storedState.type && storedState.board !== undefined) {
      currentState = storedState;
    } else {
      currentState = engine.createGame();
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid game state" },
      { status: 500 },
    );
  }

  // 8. Verify it's the player's turn
  if (currentState.currentTurn !== playerRole) {
    return NextResponse.json(
      { error: "It's not your turn" },
      { status: 400 },
    );
  }

  // 9. Apply the move using the engine
  let newState: GameState;
  try {
    newState = engine.makeMove(currentState, moveData, playerRole);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid move";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // 10. Determine DB fields
  const currentTurn =
    newState.currentTurn === "player1" ? game.player1_id : game.player2_id;

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

  // 11. Persist the new state
  const { error: updateError } = await supabase
    .from("games")
    .update({
      game_state: newState as unknown as Record<string, unknown>,
      current_turn: currentTurn,
      status: gameStatus,
      winner_id: winnerId,
    })
    .eq("id", gameId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 },
    );
  }

  // 12. Insert the move record
  await supabase.from("game_moves").insert({
    game_id: gameId,
    player_id: user.id,
    move_data: (typeof moveData === "object" && moveData !== null
      ? moveData
      : { value: moveData }) as Record<string, unknown>,
    move_number: newState.moveHistory.length,
  });

  // 13. For hangman, strip the secret word from the response
  // so the guessing player cannot see it in the API response.
  let responseState = newState;

  if (game.game_type === "hangman" && playerRole === "player2") {
    // Player 2 is the guesser -- hide the word
    responseState = {
      ...newState,
      extra: {
        ...(newState.extra ?? {}),
        word: undefined,
      },
    };
  }

  return NextResponse.json({
    gameState: responseState,
    gameStatus,
    winnerId,
  });
}
