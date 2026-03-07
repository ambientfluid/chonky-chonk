import { Swords } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types/database";

interface OpponentEntry {
  profile: Profile;
  gamesPlayed: number;
  wins: number;
  losses: number;
}

interface OpponentsListProps {
  opponents: OpponentEntry[];
}

export function OpponentsList({ opponents }: OpponentsListProps) {
  if (opponents.length === 0) {
    return (
      <Card className="py-12 text-center">
        <Swords className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-gray-400">
          No opponents yet. Challenge someone to a game!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {opponents.map((opponent) => {
        const winRate =
          opponent.gamesPlayed > 0
            ? Math.round((opponent.wins / opponent.gamesPlayed) * 100)
            : 0;

        return (
          <Card
            key={opponent.profile.id}
            className="flex flex-col gap-4 p-5"
          >
            {/* Header with avatar and name */}
            <div className="flex items-center gap-3">
              <Avatar
                src={opponent.profile.avatar_url}
                name={opponent.profile.screen_name}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-[family-name:var(--font-display)] text-sm font-bold text-gray-700">
                  {opponent.profile.screen_name}
                </p>
                <p className="text-xs text-gray-400">
                  {opponent.gamesPlayed} game{opponent.gamesPlayed !== 1 && "s"}{" "}
                  together
                </p>
              </div>
            </div>

            {/* Win/Loss record */}
            <div className="flex items-center gap-2">
              <Badge variant="green">{opponent.wins}W</Badge>
              <Badge variant="pink">{opponent.losses}L</Badge>
              <Badge variant="gray">
                {opponent.gamesPlayed - opponent.wins - opponent.losses}D
              </Badge>
            </div>

            {/* Win rate bar */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Your win rate
                </span>
                <span
                  className={cn(
                    "font-[family-name:var(--font-display)] text-sm font-bold",
                    winRate >= 50 ? "text-lime-600" : "text-bubblegum-500",
                  )}
                >
                  {winRate}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    winRate >= 50
                      ? "bg-gradient-to-r from-lime-400 to-lime-500"
                      : "bg-gradient-to-r from-bubblegum-400 to-bubblegum-500",
                  )}
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
