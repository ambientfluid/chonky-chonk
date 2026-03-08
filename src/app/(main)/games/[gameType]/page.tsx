import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Crown, Circle, Hash, Pencil, Grid2x2, ArrowLeft } from "lucide-react";
import { GAME_CONFIG } from "@/lib/utils/constants";
import type { GameType } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { GameLobby } from "@/components/games/GameLobby";

const iconMap: Record<string, React.ReactNode> = {
  Crown: <Crown className="h-12 w-12" />,
  Circle: <Circle className="h-12 w-12" />,
  Hash: <Hash className="h-12 w-12" />,
  Pencil: <Pencil className="h-12 w-12" />,
  Grid2x2: <Grid2x2 className="h-12 w-12" />,
};

interface GameTypePageProps {
  params: Promise<{ gameType: string }>;
}

export default async function GameTypePage({ params }: GameTypePageProps) {
  const { gameType } = await params;

  const validGameTypes = Object.keys(GAME_CONFIG) as GameType[];
  if (!validGameTypes.includes(gameType as GameType)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Fetch active/waiting games for this user and game type
  const { data: activeGames } = await supabase
    .from("games")
    .select(
      "*, player1:profiles!games_player1_id_fkey(*), player2:profiles!games_player2_id_fkey(*)"
    )
    .eq("game_type", gameType)
    .in("status", ["active", "waiting"])
    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  // Fetch recent completed games
  const { data: recentGames } = await supabase
    .from("games")
    .select(
      "*, player1:profiles!games_player1_id_fkey(*), player2:profiles!games_player2_id_fkey(*)"
    )
    .eq("game_type", gameType)
    .eq("status", "completed")
    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })
    .limit(5);

  const config = GAME_CONFIG[gameType as GameType];

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/games"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-grape-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Games
      </Link>

      {/* Game header */}
      <div className="flex items-center gap-6">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${config.bgGradient} text-white shadow-lg`}
        >
          {iconMap[config.icon]}
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
            {config.name}
          </h1>
          <p className="mt-1 text-gray-500">{config.description}</p>
        </div>
      </div>

      {/* Game lobby */}
      <GameLobby
        gameType={gameType as GameType}
        userId={user.id}
        profile={profile}
        activeGames={activeGames || []}
        recentGames={recentGames || []}
      />
    </div>
  );
}
