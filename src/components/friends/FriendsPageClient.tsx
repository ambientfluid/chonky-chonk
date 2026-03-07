"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Video,
  Gamepad2,
  Inbox,
  Check,
  X,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useFriends } from "@/lib/hooks/useFriends";
import { usePresence } from "@/lib/hooks/usePresence";
import { GameInviteModal } from "@/components/games/invites/GameInviteModal";

export interface FriendsPageClientProps {
  userId: string;
  profile: Profile;
}

type Tab = "friends" | "requests";

export function FriendsPageClient({ userId, profile }: FriendsPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const {
    friends,
    pendingRequests,
    acceptRequest,
    declineRequest,
    loading,
  } = useFriends(userId);
  const { isOnline } = usePresence();

  const [inviteTarget, setInviteTarget] = useState<{
    id: string;
    screenName: string;
    avatarUrl: string | null;
  } | null>(null);

  function handleVideoChat(friendId: string) {
    const roomName = [userId.slice(0, 8), friendId.slice(0, 8)]
      .sort()
      .join("-");
    window.location.href = `/video-chat/${roomName}`;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-800">
          Friends
        </h1>
        <p className="mt-1 text-gray-500">
          Manage your friends and find new people to play with.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("friends")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200",
            activeTab === "friends"
              ? "bg-white text-grape-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          <Users className="h-4 w-4" />
          Friends
          {friends.length > 0 && (
            <Badge variant="pink">{friends.length}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200",
            activeTab === "requests"
              ? "bg-white text-grape-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          <Inbox className="h-4 w-4" />
          Requests
          {pendingRequests.length > 0 && (
            <Badge variant="purple">{pendingRequests.length}</Badge>
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-bubblegum-200 border-t-bubblegum-500" />
          <p className="mt-3 text-sm text-gray-400">Loading...</p>
        </div>
      )}

      {/* Friends Tab */}
      {!loading && activeTab === "friends" && (
        <>
          {friends.length === 0 ? (
            <Card className="py-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-bubblegum-100 to-grape-100">
                <Heart className="h-10 w-10 text-bubblegum-400" />
              </div>
              <h2 className="mt-6 font-[family-name:var(--font-display)] text-xl font-bold text-gray-600">
                No friends yet!
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
                Play some games to make friends! When you find cool people
                online, send them a friend request.
              </p>
              <Badge variant="pink" className="mt-4">
                Go play some games to meet people
              </Badge>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {friends.map(({ friendship, profile: friendProfile }) => {
                const online = isOnline(friendProfile.id);
                return (
                  <Card
                    key={friendship.id}
                    className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={friendProfile.avatar_url}
                        name={friendProfile.screen_name}
                        size="lg"
                        online={online}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-800 truncate">
                          {friendProfile.screen_name}
                        </h3>
                        <Badge variant={online ? "green" : "gray"}>
                          {online ? "Online" : "Offline"}
                        </Badge>
                        {friendProfile.bio && (
                          <p className="mt-2 text-xs text-gray-400 line-clamp-2">
                            {friendProfile.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleVideoChat(friendProfile.id)}
                      >
                        <Video className="mr-1.5 h-3.5 w-3.5" />
                        Video Chat
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          setInviteTarget({
                            id: friendProfile.id,
                            screenName: friendProfile.screen_name,
                            avatarUrl: friendProfile.avatar_url,
                          })
                        }
                      >
                        <Gamepad2 className="mr-1.5 h-3.5 w-3.5" />
                        Invite to Play
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Requests Tab */}
      {!loading && activeTab === "requests" && (
        <>
          {pendingRequests.length === 0 ? (
            <Card className="py-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-grape-100 to-lime-100">
                <UserPlus className="h-10 w-10 text-grape-400" />
              </div>
              <h2 className="mt-6 font-[family-name:var(--font-display)] text-xl font-bold text-gray-600">
                No pending requests
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
                When someone sends you a friend request, it will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(({ friendship, fromProfile }) => (
                <Card
                  key={friendship.id}
                  className="flex items-center gap-4 transition-all duration-200 hover:shadow-lg"
                >
                  <Avatar
                    src={fromProfile.avatar_url}
                    name={fromProfile.screen_name}
                    size="md"
                    online={isOnline(fromProfile.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-800">
                      {fromProfile.screen_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Wants to be your friend
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => acceptRequest(friendship.id)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        "bg-lime-500 text-white shadow-sm",
                        "transition-all hover:scale-110 hover:shadow-md",
                      )}
                      aria-label="Accept request"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => declineRequest(friendship.id)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        "bg-gray-200 text-gray-600",
                        "transition-all hover:scale-110 hover:bg-bubblegum-100 hover:text-bubblegum-600",
                      )}
                      aria-label="Decline request"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Game Invite Modal */}
      {inviteTarget && (
        <GameInviteModal
          open={!!inviteTarget}
          onClose={() => setInviteTarget(null)}
          currentUserId={userId}
          targetUserId={inviteTarget.id}
          targetScreenName={inviteTarget.screenName}
          targetAvatarUrl={inviteTarget.avatarUrl}
        />
      )}
    </div>
  );
}
