"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import { useGameInvite } from "@/lib/hooks/useGameInvite";
import { IncomingInviteToast } from "@/components/games/invites/IncomingInviteToast";

/* -------------------------------------------------------------------------
 * Context for notification count
 * ----------------------------------------------------------------------- */

interface NotificationContextValue {
  notificationCount: number;
}

const NotificationContext = createContext<NotificationContextValue>({
  notificationCount: 0,
});

export function useNotifications(): NotificationContextValue {
  return useContext(NotificationContext);
}

/* -------------------------------------------------------------------------
 * Provider
 * ----------------------------------------------------------------------- */

export interface NotificationProviderProps {
  userId: string;
  children: ReactNode;
}

export function NotificationProvider({
  userId,
  children,
}: NotificationProviderProps) {
  const { incomingInvites, acceptInvite, declineInvite } = useGameInvite({
    userId,
  });

  const value = useMemo(
    () => ({ notificationCount: incomingInvites.length }),
    [incomingInvites.length],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Incoming invite toasts - positioned top-right */}
      {incomingInvites.length > 0 && (
        <div className="pointer-events-none fixed right-4 top-20 z-[90] flex flex-col gap-2">
          {incomingInvites.map((invite) => (
            <IncomingInviteToast
              key={invite.id}
              invite={invite}
              onAccept={acceptInvite}
              onDecline={declineInvite}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
}
