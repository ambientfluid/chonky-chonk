import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { ToastProvider } from "@/components/ui/Toast";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const typedProfile = profile as Profile;

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50/50">
        <Sidebar profile={typedProfile} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav profile={typedProfile} />

          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
