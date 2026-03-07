import { redirect } from "next/navigation";
import { BarChart3, Swords, Trophy, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Game, GameType } from "@/types/database";
import { GAME_CONFIG } from "@/lib/utils/constants";
import { Card } from "@/components/ui/Card";
import { StatsCards } from "@/components/analytics/StatsCards";
import { StatsChart } from "@/components/analytics/StatsChart";
import { Leaderboard } from "@/components/analytics/Leaderboard";
import { Achievements } from "@/components/analytics/Achievements";
import { OpponentsList } from "@/components/analytics/OpponentsList";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // ---------- Authenticate ----------
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

  // ---------- Fetch completed games involving the user ----------
  const { data: gamesRaw } = await supabase
    .from("games")
    .select("*")
    .eq("status", "completed")
    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const games = (gamesRaw ?? []) as Game[];

  // ---------- Compute core stats ----------
  const totalGames = games.length;
  const wins = games.filter((g) => g.winner_id === user.id).length;
  const losses = games.filter(
    (g) => g.winner_id !== null && g.winner_id !== user.id,
  ).length;
  const draws = games.filter((g) => g.winner_id === null).length;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  // ---------- Win streaks ----------
  let currentStreak = 0;
  for (const game of games) {
    if (game.winner_id === user.id) {
      currentStreak++;
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let runningStreak = 0;
  for (const game of games) {
    if (game.winner_id === user.id) {
      runningStreak++;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  // ---------- Per-game-type breakdown ----------
  const gameTypes = Object.keys(GAME_CONFIG) as GameType[];
  const perGameType = gameTypes.map((gt) => {
    const gtGames = games.filter((g) => g.game_type === gt);
    return {
      gameType: gt,
      name: GAME_CONFIG[gt].name,
      wins: gtGames.filter((g) => g.winner_id === user.id).length,
      losses: gtGames.filter(
        (g) => g.winner_id !== null && g.winner_id !== user.id,
      ).length,
      draws: gtGames.filter((g) => g.winner_id === null).length,
    };
  });

  // Games per type for achievements
  const gamesPerType: Record<string, number> = {};
  for (const gt of gameTypes) {
    gamesPerType[gt] = games.filter((g) => g.game_type === gt).length;
  }

  // Favorite game type
  const favoriteType = gameTypes.reduce(
    (best, gt) =>
      (gamesPerType[gt] ?? 0) > (gamesPerType[best] ?? 0) ? gt : best,
    gameTypes[0],
  );

  // ---------- Most-played opponents ----------
  const opponentCounts: Record<
    string,
    { opponentId: string; gamesPlayed: number; wins: number; losses: number }
  > = {};

  for (const game of games) {
    const opponentId =
      game.player1_id === user.id ? game.player2_id : game.player1_id;
    if (!opponentCounts[opponentId]) {
      opponentCounts[opponentId] = {
        opponentId,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
      };
    }
    opponentCounts[opponentId].gamesPlayed++;
    if (game.winner_id === user.id) {
      opponentCounts[opponentId].wins++;
    } else if (game.winner_id === opponentId) {
      opponentCounts[opponentId].losses++;
    }
  }

  const topOpponentIds = Object.values(opponentCounts)
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
    .slice(0, 5);

  // Fetch opponent profiles
  let opponentProfiles: Profile[] = [];
  if (topOpponentIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in(
        "id",
        topOpponentIds.map((o) => o.opponentId),
      );
    opponentProfiles = (profiles ?? []) as Profile[];
  }

  const opponents = topOpponentIds
    .map((opp) => {
      const oppProfile = opponentProfiles.find(
        (p) => p.id === opp.opponentId,
      );
      if (!oppProfile) return null;
      return {
        profile: oppProfile,
        gamesPlayed: opp.gamesPlayed,
        wins: opp.wins,
        losses: opp.losses,
      };
    })
    .filter(
      (o): o is { profile: Profile; gamesPlayed: number; wins: number; losses: number } =>
        o !== null,
    );

  // ---------- Global leaderboard ----------
  // Fetch all completed games for leaderboard
  const { data: allGamesRaw } = await supabase
    .from("games")
    .select("player1_id, player2_id, winner_id")
    .eq("status", "completed");

  const allGames = (allGamesRaw ?? []) as Pick<
    Game,
    "player1_id" | "player2_id" | "winner_id"
  >[];

  const leaderboardMap: Record<
    string,
    { id: string; wins: number; total_games: number }
  > = {};

  for (const game of allGames) {
    for (const playerId of [game.player1_id, game.player2_id]) {
      if (!leaderboardMap[playerId]) {
        leaderboardMap[playerId] = { id: playerId, wins: 0, total_games: 0 };
      }
      leaderboardMap[playerId].total_games++;
      if (game.winner_id === playerId) {
        leaderboardMap[playerId].wins++;
      }
    }
  }

  const sortedLeaderboard = Object.values(leaderboardMap)
    .sort((a, b) => b.wins - a.wins || a.total_games - b.total_games)
    .slice(0, 10);

  // Fetch profiles for leaderboard
  let leaderboardProfiles: Profile[] = [];
  if (sortedLeaderboard.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in(
        "id",
        sortedLeaderboard.map((e) => e.id),
      );
    leaderboardProfiles = (profiles ?? []) as Profile[];
  }

  const leaderboardEntries = sortedLeaderboard
    .map((entry, index) => {
      const p = leaderboardProfiles.find((pr) => pr.id === entry.id);
      return {
        rank: index + 1,
        screen_name: p?.screen_name ?? "Unknown Player",
        avatar_url: p?.avatar_url ?? null,
        wins: entry.wins,
        total_games: entry.total_games,
      };
    });

  // ---------- Render ----------
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
          Your Stats
        </h1>
        <p className="mt-1 text-gray-500">
          Every win, every streak, every bonk -- all right here,{" "}
          <span className="font-semibold text-bubblegum-500">
            {typedProfile.screen_name}
          </span>
          !
        </p>
      </div>

      {/* Stats overview cards */}
      <StatsCards
        totalGames={totalGames}
        wins={wins}
        losses={losses}
        draws={draws}
        winRate={winRate}
        currentStreak={currentStreak}
      />

      {/* Per-game breakdown chart */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-grape-400 to-grape-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-700">
              Game Breakdown
            </h2>
            <p className="text-sm text-gray-400">
              Wins, losses, and draws per game type
              {totalGames > 0 && (
                <>
                  {" "}
                  &middot; Favorite:{" "}
                  <span className="font-semibold text-grape-500">
                    {GAME_CONFIG[favoriteType].name}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <Card>
          <StatsChart data={perGameType} />
        </Card>
      </section>

      {/* Most-played opponents */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bubblegum-400 to-bubblegum-600">
            <Swords className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-700">
              Top Rivals
            </h2>
            <p className="text-sm text-gray-400">
              Your most-played opponents
            </p>
          </div>
        </div>
        <OpponentsList opponents={opponents} />
      </section>

      {/* Global leaderboard */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-600">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-700">
              Leaderboard
            </h2>
            <p className="text-sm text-gray-400">
              Top 10 players by wins
            </p>
          </div>
        </div>
        <Leaderboard
          entries={leaderboardEntries}
          currentUserId={typedProfile.screen_name}
        />
      </section>

      {/* Achievements */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-700">
              Achievements
            </h2>
            <p className="text-sm text-gray-400">
              Collect them all! Longest streak ever: {longestStreak}
            </p>
          </div>
        </div>
        <Achievements
          stats={{
            totalGames,
            wins,
            streak: longestStreak,
            gamesPerType,
          }}
        />
      </section>
    </div>
  );
}
