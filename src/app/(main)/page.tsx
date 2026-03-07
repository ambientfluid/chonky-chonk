import Link from "next/link";
import {
  Crown,
  Circle,
  Hash,
  Pencil,
  Grid2x2,
  Trophy,
  Flame,
  Target,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GAME_CONFIG } from "@/lib/utils/constants";
import type { GameType, Profile } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const iconMap: Record<string, React.ReactNode> = {
  Crown: <Crown className="h-8 w-8" />,
  Circle: <Circle className="h-8 w-8" />,
  Hash: <Hash className="h-8 w-8" />,
  Pencil: <Pencil className="h-8 w-8" />,
  Grid2x2: <Grid2x2 className="h-8 w-8" />,
};

export default async function DashboardPage() {
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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-bubblegum-500 to-grape-500 bg-clip-text text-transparent">
            {typedProfile.screen_name}
          </span>
          !
        </h1>
        <p className="mt-1 text-gray-500">
          Ready to play? Pick a game and start bonking!
        </p>
      </div>

      {/* Game Cards Grid */}
      <section>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-gray-700">
          Quick Play
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(GAME_CONFIG) as [GameType, (typeof GAME_CONFIG)[GameType]][]).map(
            ([gameType, config]) => (
              <Link key={gameType} href="/games" className="group">
                <Card className="transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.bgGradient} text-white shadow-md`}
                    >
                      {iconMap[config.icon]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-800">
                        {config.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ),
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-gray-700">
          Quick Stats
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-bubblegum-400 to-bubblegum-500 text-white">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">--</p>
              <p className="text-xs text-gray-500">Total Wins</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-grape-400 to-grape-500 text-white">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">--</p>
              <p className="text-xs text-gray-500">Games Played</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 text-white">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">--</p>
              <p className="text-xs text-gray-500">Win Streak</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">--</p>
              <p className="text-xs text-gray-500">Friends</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Online Friends Placeholder */}
      <section>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-gray-700">
          Online Friends
        </h2>
        <Card className="py-12 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-400">
            Online friends will appear here
          </p>
          <Badge variant="purple" className="mt-2">
            Coming Soon
          </Badge>
        </Card>
      </section>
    </div>
  );
}
