"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Gamepad2,
  Users,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types/database";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/layout/Logo";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
  { label: "Games", href: "/games", icon: <Gamepad2 className="h-5 w-5" /> },
  { label: "Friends", href: "/friends", icon: <Users className="h-5 w-5" /> },
  {
    label: "Stats",
    href: "/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: <Shield className="h-5 w-5" />,
    adminOnly: true,
  },
];

export interface SidebarProps {
  profile: Profile;
  children?: ReactNode;
}

export function Sidebar({ profile, children }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-grape-100 bg-white">
      {/* Logo */}
      <div className="flex items-center justify-center px-6 pt-6 pb-2">
        <Link href="/" className="transition-transform hover:scale-105">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          if (item.adminOnly && !profile.is_admin) return null;

          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-bubblegum-100 to-grape-100 text-grape-700 shadow-sm"
                  : "text-gray-600 hover:bg-bubblegum-50 hover:text-grape-600",
              )}
            >
              <span
                className={cn(
                  "transition-transform duration-200 group-hover:scale-110",
                  active && "text-bubblegum-500",
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Online users widget slot */}
      {children && <div className="px-3 pb-2">{children}</div>}

      {/* User section */}
      <div className="border-t border-grape-100 p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={profile.avatar_url}
            name={profile.screen_name}
            size="md"
            online
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-800">
              {profile.screen_name}
            </p>
            <Link
              href="/profile"
              className="group inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-grape-500"
            >
              <Settings className="h-3 w-3 transition-transform group-hover:rotate-90" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
