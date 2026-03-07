import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------
 * POST /api/daily/room
 * Creates a Daily.co room for video chat during a game session.
 * ----------------------------------------------------------------------- */

export async function POST(request: Request) {
  // 1. Verify the user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse the request body
  const body = await request.json();
  const { name } = body as { name?: string };

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "A room name is required" },
      { status: 400 },
    );
  }

  // 3. Ensure the Daily API key is configured
  const dailyApiKey = process.env.DAILY_API_KEY;
  if (!dailyApiKey) {
    return NextResponse.json(
      { error: "Daily API key is not configured" },
      { status: 500 },
    );
  }

  // 4. Create the Daily room via REST API
  try {
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dailyApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          enable_chat: true,
          max_participants: 2,
          enable_screenshare: false,
          enable_recording: "none",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as { error?: string }).error ??
        `Daily API error: ${response.status}`;
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const roomData = (await response.json()) as { name: string; url: string };

    return NextResponse.json({
      name: roomData.name,
      url: roomData.url,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create Daily room";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
