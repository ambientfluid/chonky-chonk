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

  // Check if the user still needs to set a password / complete profile setup.
  // Invited users who haven't finished onboarding won't have a screen_name yet.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("screen_name")
      .eq("id", user.id)
      .single();

    if (!profile?.screen_name) {
      return NextResponse.redirect(`${origin}/set-password`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
