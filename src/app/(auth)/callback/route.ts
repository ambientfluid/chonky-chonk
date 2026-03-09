import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "invite"
    | "email"
    | "signup"
    | "recovery"
    | null;

  const supabase = await createClient();

  if (tokenHash && type) {
    // Direct token verification (invite emails, email confirmations)
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      return NextResponse.redirect(`${origin}/login`);
    }
  } else if (code) {
    // PKCE code exchange (OAuth, magic link)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login`);
    }
  } else {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Check if the user still needs to complete onboarding (set password, profile).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.user_metadata?.onboarding_completed === false) {
    return NextResponse.redirect(`${origin}/set-password`);
  }

  return NextResponse.redirect(`${origin}/`);
}
