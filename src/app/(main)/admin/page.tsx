import { redirect } from "next/navigation";
import { Shield, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AdminPage() {
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

  // Only admins can access this page
  if (!typedProfile.is_admin) {
    redirect("/");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
          Admin Panel
        </h1>
        <Badge variant="purple">Admin</Badge>
      </div>
      <p className="text-gray-500">
        Manage users, games, and application settings.
      </p>

      <Card className="py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-grape-100 to-bubblegum-100">
          <Shield className="h-10 w-10 text-grape-400" />
        </div>
        <h2 className="mt-6 font-[family-name:var(--font-display)] text-xl font-bold text-gray-600">
          Admin Tools Coming Soon
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
          User management, game moderation, and analytics will be available
          here.
        </p>
        <Badge variant="purple" className="mt-4">
          Coming Soon
        </Badge>
      </Card>
    </div>
  );
}
