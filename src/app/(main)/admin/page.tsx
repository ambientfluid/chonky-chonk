import { redirect } from "next/navigation";
import { Shield, Users, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InviteUserForm } from "@/components/admin/InviteUserForm";
import { UserTable } from "@/components/admin/UserTable";

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

  // Fetch all profiles using admin client (bypasses RLS)
  const adminClient = createAdminClient();
  const { data: allProfiles } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const users = (allProfiles ?? []) as Profile[];
  const adminCount = users.filter((u) => u.is_admin).length;

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-grape-100 to-bubblegum-100">
            <Shield className="h-5 w-5 text-grape-500" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
              Admin Panel
            </h1>
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <Sparkles className="h-3.5 w-3.5 text-bubblegum-400" />
              Manage your players and keep the fun going
            </p>
          </div>
          <Badge variant="purple" className="ml-auto hidden sm:inline-flex">
            Admin
          </Badge>
        </div>
      </div>

      {/* Two-column layout: Invite form + Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Invite form */}
        <InviteUserForm />

        {/* Right: User stats */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-grape-400 via-bubblegum-400 to-lime-400" />

          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-grape-100">
              <Users className="h-4 w-4 text-grape-500" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-800">
              Player Stats
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Total users */}
            <div className="rounded-xl bg-gradient-to-br from-bubblegum-50 to-bubblegum-100/50 p-4 text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-bubblegum-600">
                {users.length}
              </p>
              <p className="mt-1 text-xs font-medium text-bubblegum-400">
                Total Players
              </p>
            </div>

            {/* Admins */}
            <div className="rounded-xl bg-gradient-to-br from-grape-50 to-grape-100/50 p-4 text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-grape-600">
                {adminCount}
              </p>
              <p className="mt-1 text-xs font-medium text-grape-400">
                Admins
              </p>
            </div>

            {/* Online placeholder */}
            <div className="col-span-2 rounded-xl bg-gradient-to-br from-lime-50 to-lime-100/50 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-500" />
                </span>
                <p className="text-sm font-medium text-lime-600">
                  Online status coming soon
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Full-width User Table */}
      <UserTable initialUsers={users} />
    </div>
  );
}
