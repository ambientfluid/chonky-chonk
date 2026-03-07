import Link from "next/link";
import { Crown, Circle, Hash, Pencil, Grid2x2 } from "lucide-react";
import { GAME_CONFIG } from "@/lib/utils/constants";
import type { GameType } from "@/types/database";

const iconMap: Record<string, React.ReactNode> = {
  Crown: <Crown className="h-10 w-10" />,
  Circle: <Circle className="h-10 w-10" />,
  Hash: <Hash className="h-10 w-10" />,
  Pencil: <Pencil className="h-10 w-10" />,
  Grid2x2: <Grid2x2 className="h-10 w-10" />,
};

export default function GamesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
          Choose Your Game
        </h1>
        <p className="mt-1 text-gray-500">
          Pick a game below and challenge a friend!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(GAME_CONFIG) as [GameType, (typeof GAME_CONFIG)[GameType]][]).map(
          ([gameType, config]) => (
            <Link
              key={gameType}
              href={`/games/${gameType}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
                {/* Gradient background */}
                <div
                  className={`bg-gradient-to-br ${config.bgGradient} p-8 text-white`}
                >
                  {/* Decorative circles */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10" />

                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                      {iconMap[config.icon]}
                    </div>

                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                      {config.name}
                    </h2>
                    <p className="mt-2 text-sm text-white/80">
                      {config.description}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-all group-hover:bg-white/30">
                      Play Now
                      <span className="transition-transform group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
