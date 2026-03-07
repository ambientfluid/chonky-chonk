import { Users, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function FriendsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
          Friends
        </h1>
        <p className="mt-1 text-gray-500">
          Manage your friends and find new people to play with.
        </p>
      </div>

      <Card className="py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-bubblegum-100 to-grape-100">
          <Users className="h-10 w-10 text-grape-400" />
        </div>
        <h2 className="mt-6 font-[family-name:var(--font-display)] text-xl font-bold text-gray-600">
          Friends List Coming Soon
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
          Add friends, see who is online, and send game invites. This feature is
          being built!
        </p>
        <Badge variant="purple" className="mt-4">
          Coming Soon
        </Badge>
      </Card>
    </div>
  );
}
