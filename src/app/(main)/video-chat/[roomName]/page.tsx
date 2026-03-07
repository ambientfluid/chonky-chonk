import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { VideoChat } from "@/components/video/VideoChat";

interface VideoChatPageProps {
  params: Promise<{ roomName: string }>;
  searchParams: Promise<{ url?: string }>;
}

export default async function VideoChatPage({
  params,
  searchParams,
}: VideoChatPageProps) {
  const supabase = await createClient();
  const { roomName } = await params;
  const { url: explicitUrl } = await searchParams;

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile for user name
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const typedProfile = profile as Profile;

  // Construct the Daily room URL.
  // If an explicit URL is provided as a query param, use that.
  // Otherwise, check the NEXT_PUBLIC_DAILY_DOMAIN env var.
  // Fallback: use the roomName directly with a configured domain.
  let roomUrl: string;

  if (explicitUrl) {
    roomUrl = explicitUrl;
  } else {
    const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN ?? "chonky-chonk";
    roomUrl = `https://${dailyDomain}.daily.co/${roomName}`;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-800">
          Video Chat
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Room: {roomName}
        </p>
      </div>

      <VideoChat roomUrl={roomUrl} userName={typedProfile.screen_name} />
    </div>
  );
}
