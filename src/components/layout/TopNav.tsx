"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types/database";
import { Avatar } from "@/components/ui/Avatar";
import { useNotifications } from "@/components/providers/NotificationProvider";

export interface TopNavProps {
  profile: Profile;
  className?: string;
}

export function TopNav({ profile, className }: TopNavProps) {
  const { notificationCount } = useNotifications();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-grape-100 bg-white/80 px-8 backdrop-blur-sm",
        className,
      )}
    >
      {/* Page title area */}
      <div />

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          type="button"
          className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-bubblegum-50 hover:text-grape-600"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />

          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bubblegum-500 px-1 text-[10px] font-bold text-white animate-bounce-slow">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <Avatar
          src={profile.avatar_url}
          name={profile.screen_name}
          size="sm"
          online
        />
      </div>
    </header>
  );
}
