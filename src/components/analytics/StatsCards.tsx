import { Gamepad2, Trophy, Target, Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface StatsCardsProps {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentStreak: number;
}

const cards = [
  {
    key: "totalGames",
    label: "Total Games",
    icon: Gamepad2,
    gradient: "from-grape-400 to-grape-600",
    bgLight: "bg-grape-50",
    textColor: "text-grape-600",
  },
  {
    key: "wins",
    label: "Wins",
    icon: Trophy,
    gradient: "from-lime-400 to-lime-600",
    bgLight: "bg-lime-50",
    textColor: "text-lime-700",
  },
  {
    key: "winRate",
    label: "Win Rate",
    icon: Target,
    gradient: "from-bubblegum-400 to-bubblegum-600",
    bgLight: "bg-bubblegum-50",
    textColor: "text-bubblegum-600",
    suffix: "%",
  },
  {
    key: "currentStreak",
    label: "Win Streak",
    icon: Flame,
    gradient: "from-sky-400 to-sky-500",
    bgLight: "bg-sky-50",
    textColor: "text-sky-600",
  },
] as const;

export function StatsCards({
  totalGames,
  wins,
  winRate,
  currentStreak,
}: StatsCardsProps) {
  const values: Record<string, number> = {
    totalGames,
    wins,
    winRate,
    currentStreak,
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = values[card.key];

        return (
          <Card key={card.key} className="relative overflow-hidden p-5">
            {/* Decorative gradient circle in background */}
            <div
              className={cn(
                "absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10",
                `bg-gradient-to-br`,
                card.gradient,
              )}
            />

            <div
              className={cn(
                "inline-flex h-12 w-12 items-center justify-center rounded-xl",
                `bg-gradient-to-br`,
                card.gradient,
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>

            <p
              className={cn(
                "mt-4 font-[family-name:var(--font-display)] text-4xl font-bold",
                card.textColor,
              )}
            >
              {value}
              {"suffix" in card && card.suffix}
            </p>

            <p className="mt-1 text-sm font-medium text-gray-500">
              {card.label}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
