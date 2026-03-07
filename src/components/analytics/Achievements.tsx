import {
  Trophy,
  Gamepad2,
  Flame,
  Medal,
  Zap,
  Star,
  Layers,
  Crown,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface AchievementsProps {
  stats: {
    totalGames: number;
    wins: number;
    streak: number;
    gamesPerType: Record<string, number>;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgLight: string;
  check: (stats: AchievementsProps["stats"]) => boolean;
}

const achievements: Achievement[] = [
  {
    id: "first-win",
    name: "First Win",
    description: "Win your very first game",
    icon: Trophy,
    gradient: "from-lime-400 to-lime-600",
    bgLight: "bg-lime-50",
    check: (s) => s.wins >= 1,
  },
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Play 5 games",
    icon: Gamepad2,
    gradient: "from-grape-400 to-grape-600",
    bgLight: "bg-grape-50",
    check: (s) => s.totalGames >= 5,
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    description: "Win 3 games in a row",
    icon: Flame,
    gradient: "from-bubblegum-400 to-bubblegum-600",
    bgLight: "bg-bubblegum-50",
    check: (s) => s.streak >= 3,
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Play 25 games",
    icon: Medal,
    gradient: "from-sky-400 to-sky-500",
    bgLight: "bg-sky-50",
    check: (s) => s.totalGames >= 25,
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Win 5 games in a row",
    icon: Zap,
    gradient: "from-lime-500 to-lime-700",
    bgLight: "bg-lime-50",
    check: (s) => s.streak >= 5,
  },
  {
    id: "century",
    name: "Century",
    description: "Play 100 games",
    icon: Star,
    gradient: "from-grape-500 to-grape-700",
    bgLight: "bg-grape-50",
    check: (s) => s.totalGames >= 100,
  },
  {
    id: "jack-of-all-trades",
    name: "Jack of All Trades",
    description: "Play all 5 game types",
    icon: Layers,
    gradient: "from-bubblegum-300 to-grape-400",
    bgLight: "bg-bubblegum-50",
    check: (s) => {
      const typesPlayed = Object.values(s.gamesPerType).filter(
        (count) => count > 0,
      ).length;
      return typesPlayed >= 5;
    },
  },
  {
    id: "champion",
    name: "Champion",
    description: "Win 50 games",
    icon: Crown,
    gradient: "from-yellow-400 to-amber-500",
    bgLight: "bg-yellow-50",
    check: (s) => s.wins >= 50,
  },
];

export function Achievements({ stats }: AchievementsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {achievements.map((achievement) => {
        const unlocked = achievement.check(stats);
        const Icon = achievement.icon;

        return (
          <Card
            key={achievement.id}
            className={cn(
              "relative flex flex-col items-center p-5 text-center transition-all",
              unlocked
                ? "border-2 border-transparent shadow-md"
                : "opacity-60 grayscale",
            )}
          >
            {/* Badge icon */}
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                unlocked
                  ? `bg-gradient-to-br ${achievement.gradient}`
                  : "bg-gray-200",
              )}
            >
              {unlocked ? (
                <Icon className="h-7 w-7 text-white" />
              ) : (
                <Lock className="h-6 w-6 text-gray-400" />
              )}
            </div>

            {/* Text */}
            <p
              className={cn(
                "mt-3 font-[family-name:var(--font-display)] text-sm font-bold",
                unlocked ? "text-gray-700" : "text-gray-400",
              )}
            >
              {achievement.name}
            </p>
            <p
              className={cn(
                "mt-1 text-xs",
                unlocked ? "text-gray-500" : "text-gray-300",
              )}
            >
              {achievement.description}
            </p>

            {/* Unlocked indicator */}
            {unlocked && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-lime-100 px-2 py-0.5 text-xs font-semibold text-lime-700">
                <Star className="h-3 w-3" />
                Unlocked
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
