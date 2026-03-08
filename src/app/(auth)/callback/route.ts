import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
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
