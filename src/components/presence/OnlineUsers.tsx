"use client";

import { useState } from "react";
import { Video, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { usePresence } from "@/lib/hooks/usePresence";
import { useFriends } from "@/lib/hooks/useFriends";
import { GameInviteModal } from "@/components/games/invites/GameInviteModal";

export interface OnlineUsersProps {
  currentUserId: string;
}

export function OnlineUsers({ currentUserId }: OnlineUsersProps) {
  const { onlineUsers } = usePresence();
  const { friends } = useFriends(currentUserId);

  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    screenName: string;
    avatarUrl: string | null;
  } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Filter out the current user
  const otherUsers = onlineUsers.filter((u) => u.user_id !== currentUserId);

  // Check if a user is a friend
  const friendIds = new Set(friends.map((f) => f.profile.id));

  function handleUserClick(user: (typeof otherUsers)[0]) {
    setExpandedUserId((prev) =>
      prev === user.user_id ? null : user.user_id,
    );
  }

  function handleInviteToPlay(user: (typeof otherUsers)[0]) {
    setSelectedUser({
      id: user.user_id,
      screenName: user.screen_name,
      avatarUrl: user.avatar_url,
    });
    setShowInviteModal(true);
    setExpandedUserId(null);
  }

  function handleVideoChat(user: (typeof otherUsers)[0]) {
    // Generate a room name and navigate to the video chat page
    const roomName = [currentUserId.slice(0, 8), user.user_id.slice(0, 8)]
      .sort()
      .join("-");
    window.location.href = `/video-chat/${roomName}`;
  }

  return (
    <>
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-1 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Online
          </span>
          <Badge variant="green" className="text-[10px]">
            {otherUsers.length}
          </Badge>
        </div>

        {/* Scrollable list */}
        <div className="max-h-48 space-y-0.5 overflow-y-auto scrollbar-thin">
          {otherUsers.length === 0 ? (
            <p className="py-3 text-center text-xs text-gray-400">
              No one else online
            </p>
          ) : (
            otherUsers.map((user) => {
              const isFriend = friendIds.has(user.user_id);
              const isExpanded = expandedUserId === user.user_id;

              return (
                <div key={user.user_id}>
                  <button
                    onClick={() => handleUserClick(user)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-all duration-150",
                      isExpanded
                        ? "bg-grape-50"
                        : "hover:bg-gray-50",
                    )}
                  >
                    <Avatar
                      src={user.avatar_url}
                      name={user.screen_name}
                      size="sm"
                      online
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                      {user.screen_name}
                    </span>
                  </button>

                  {/* Action buttons dropdown */}
                  {isExpanded && (
                    <div className="ml-10 mt-1 mb-1 flex gap-1.5">
                      <button
                        onClick={() => handleInviteToPlay(user)}
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                          "bg-bubblegum-100 text-bubblegum-600",
                          "transition-all hover:scale-105 hover:bg-bubblegum-200",
                        )}
                      >
                        <Gamepad2 className="h-3 w-3" />
                        Invite
                      </button>
                      {isFriend && (
                        <button
                          onClick={() => handleVideoChat(user)}
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                            "bg-grape-100 text-grape-600",
                            "transition-all hover:scale-105 hover:bg-grape-200",
                          )}
                        >
                          <Video className="h-3 w-3" />
                          Video
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Game Invite Modal */}
      {selectedUser && (
        <GameInviteModal
          open={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedUser(null);
          }}
          currentUserId={currentUserId}
          targetUserId={selectedUser.id}
          targetScreenName={selectedUser.screenName}
          targetAvatarUrl={selectedUser.avatarUrl}
        />
      )}
    </>
  );
}
