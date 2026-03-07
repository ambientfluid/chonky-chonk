import { notFound } from "next/navigation";
import Link from "next/link";
import { Crown, Circle, Hash, Pencil, Grid2x2, ArrowLeft } from "lucide-react";
import { GAME_CONFIG } from "@/lib/utils/constants";
import type { GameType } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

  // Validate gameType against GAME_CONFIG keys
  const validGameTypes = Object.keys(GAME_CONFIG) as GameType[];
  if (!validGameTypes.includes(gameType as GameType)) {
    notFound();
  }

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
          <div className="flex items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
              {config.name}
            </h1>
            <Badge variant="purple">Coming Soon</Badge>
          </div>
          <p className="mt-1 text-gray-500">{config.description}</p>
        </div>
      </div>

      {/* Placeholder content */}
      <Card className="py-16 text-center">
        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${config.bgGradient} text-white opacity-30`}
        >
          {iconMap[config.icon]}
        </div>
        <h2 className="mt-6 font-[family-name:var(--font-display)] text-xl font-bold text-gray-600">
          Game Lobby Coming Soon
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
          The {config.name} lobby is being built. Soon you will be able to
          create and join games, challenge friends, and track your stats!
        </p>
        <div className="mt-8">
          <Link href="/games">
            <Button variant="ghost" size="sm">
              Browse Other Games
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
