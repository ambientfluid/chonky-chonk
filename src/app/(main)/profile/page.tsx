import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const typedProfile = profile as Profile;
  const isWelcome = welcome === "true";

  return (
    <div className="space-y-8">
      {isWelcome && (
        <div className="rounded-xl bg-lime-50 border border-lime-200 p-4 text-center space-y-1">
          <p className="text-lg font-bold font-[family-name:var(--font-display)] text-lime-800">
            Welcome to Chonky Chonk!
          </p>
          <p className="text-sm text-lime-600">
            Upload a profile photo and pick a screen name to finish setting up
            your account.
          </p>
        </div>
      )}

      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
          Profile Settings
        </h1>
        <p className="mt-1 text-gray-500">
          Customize your avatar, screen name, and bio.
        </p>
      </div>

      <ProfileForm initialProfile={typedProfile} />
    </div>
  );
}
