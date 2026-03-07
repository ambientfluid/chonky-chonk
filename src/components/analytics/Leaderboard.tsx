import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

interface LeaderboardEntry {
  rank: number;
  screen_name: string;
  avatar_url: string | null;
  wins: number;
  total_games: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const rankMedals: Record<number, string> = {
  1: "\u{1F947}",
  2: "\u{1F948}",
  3: "\u{1F949}",
};

const rankColors: Record<number, string> = {
  1: "from-yellow-400 to-amber-500",
  2: "from-gray-300 to-gray-400",
  3: "from-amber-600 to-amber-700",
};

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <Card className="py-12 text-center">
        <Trophy className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-gray-400">
          No leaderboard data yet. Start playing to compete!
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="divide-y divide-gray-50">
        {entries.map((entry) => {
          const isCurrentUser = entry.screen_name === currentUserId;
          const medal = rankMedals[entry.rank];
          const winRate =
            entry.total_games > 0
              ? Math.round((entry.wins / entry.total_games) * 100)
              : 0;

          return (
            <div
              key={`${entry.rank}-${entry.screen_name}`}
              className={cn(
                "flex items-center gap-4 px-6 py-4 transition-colors",
                isCurrentUser && "bg-bubblegum-50",
              )}
            >
              {/* Rank */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                {medal ? (
                  <span className="text-2xl">{medal}</span>
                ) : (
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                      entry.rank <= 3
                        ? `bg-gradient-to-br ${rankColors[entry.rank]} text-white`
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar + Name */}
              <Avatar
                src={entry.avatar_url}
                name={entry.screen_name}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate font-[family-name:var(--font-display)] text-sm font-bold",
                    isCurrentUser ? "text-bubblegum-600" : "text-gray-700",
                  )}
                >
                  {entry.screen_name}
                  {isCurrentUser && (
                    <Badge variant="pink" className="ml-2">
                      You
                    </Badge>
                  )}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold text-lime-600">
                    {entry.wins}
                  </p>
                  <p className="text-xs text-gray-400">wins</p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-500">
                    {entry.total_games}
                  </p>
                  <p className="text-xs text-gray-400">games</p>
                </div>
                <Badge variant={winRate >= 50 ? "green" : "gray"}>
                  {winRate}%
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
