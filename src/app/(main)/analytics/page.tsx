import { BarChart3, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
          Stats
        </h1>
        <p className="mt-1 text-gray-500">
          Track your performance across all games.
        </p>
      </div>

      <Card className="py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-lime-100 to-grape-100">
          <BarChart3 className="h-10 w-10 text-grape-400" />
        </div>
        <h2 className="mt-6 font-[family-name:var(--font-display)] text-xl font-bold text-gray-600">
          Analytics Dashboard Coming Soon
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
          Win rates, game history, leaderboards, and more. Your stats dashboard
          is on the way!
        </p>
        <Badge variant="green" className="mt-4">
          Coming Soon
        </Badge>
      </Card>
    </div>
  );
}
