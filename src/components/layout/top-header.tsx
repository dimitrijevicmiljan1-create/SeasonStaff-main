"use client";

import { AppLink } from "@/components/ui/app-link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Settings } from "lucide-react";

import { SeasonStaffLogo } from "@/components/brand/seasonstaff-logo";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "@/lib/auth/actions";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/actions";
import { formatNotificationTime } from "@/lib/notifications/format";
import {
  notificationsQueryKey,
  unreadNotificationsQueryKey,
} from "@/lib/notifications/queries";
import { LIST_QUERY_STALE_MS } from "@/lib/query/options";
import { NotificationDropdownItem } from "@/components/layout/notification-dropdown-item";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopHeaderProps {
  title: string;
}

function displayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | undefined,
) {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  return email ?? "Account";
}

function initials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) {
  const a = firstName?.[0] ?? "";
  const b = lastName?.[0] ?? "";
  const combined = `${a}${b}`.toUpperCase();
  return combined || "SS";
}

export const TopHeader = memo(function TopHeader({ title }: TopHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const userId = user?.id ?? "";

  const { data: notificationData } = useQuery({
    queryKey: notificationsQueryKey(userId),
    queryFn: getMyNotifications,
    enabled: Boolean(userId),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const notifications = notificationData?.notifications ?? [];
  const unreadCount = notificationData?.unreadCount ?? 0;

  const invalidateNotifications = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({
      queryKey: notificationsQueryKey(userId),
    });
    await queryClient.invalidateQueries({
      queryKey: unreadNotificationsQueryKey(userId),
    });
  }, [queryClient, userId]);

  const handleMarkAllRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      const result = await markAllNotificationsRead();
      if (!result.error) {
        await invalidateNotifications();
      }
    } finally {
      setMarkingAll(false);
    }
  }, [invalidateNotifications, markingAll, unreadCount]);

  const handleNotificationClick = useCallback(
    async (notificationId: string, isUnread: boolean) => {
      if (!isUnread) return;
      await markNotificationRead(notificationId);
      await invalidateNotifications();
    },
    [invalidateNotifications],
  );

  const name = displayName(profile?.first_name, profile?.last_name, user?.email);
  const avatarInitials = initials(profile?.first_name, profile?.last_name);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const result = await signOut();
    if (result?.error) {
      setIsLoggingOut(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="pointer-events-none sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface/95 px-4 shadow-[var(--shadow-card)] lg:h-14 lg:backdrop-blur-sm lg:px-6">
      <div className="pointer-events-auto flex min-w-0 items-center gap-2 lg:gap-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 lg:hidden">
            <DropdownMenuLabel className="p-0 font-normal">
              <SeasonStaffLogo size={32} href={null} className="px-1 py-0.5" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <AppLink href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </AppLink>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLoggingOut}
              className="text-status-rejected focus:text-status-rejected"
              onSelect={() => {
                void handleLogout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SeasonStaffLogo
          size={28}
          showWordmark={false}
          className="shrink-0 lg:hidden"
        />
        <h1 className="truncate text-base font-semibold tracking-tight text-text-primary lg:text-lg">
          {title}
        </h1>
      </div>

      <div className="pointer-events-auto flex shrink-0 items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
            >
              <Bell className="h-5 w-5 text-text-primary" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-status-rejected px-1 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[min(360px,calc(100vw-32px))]">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold tracking-tight text-text-primary">
                Notifications
              </span>
              <button
                type="button"
                disabled={markingAll || unreadCount === 0}
                className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50"
                onClick={() => void handleMarkAllRead()}
              >
                {markingAll ? "Saving…" : "Mark all read"}
              </button>
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="flex min-h-[120px] items-center justify-center px-4 py-6 text-sm text-text-secondary">
                No notifications
              </div>
            ) : (
              <div className="max-h-[min(400px,60vh)] divide-y divide-border overflow-y-auto">
                {notifications.map((notification) => (
                  <NotificationDropdownItem
                    key={notification.id}
                    notification={notification}
                    timeLabel={formatNotificationTime(notification.created_at)}
                    onNavigate={() =>
                      void handleNotificationClick(
                        notification.id,
                        notification.unread,
                      )
                    }
                  />
                ))}
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <AppLink
                href="/requests"
                className="justify-center text-sm font-medium text-accent"
              >
                View all requests →
              </AppLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{avatarInitials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal text-text-secondary">
              {name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <AppLink href="/settings">Settings</AppLink>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLoggingOut}
              className="text-status-rejected focus:text-status-rejected"
              onSelect={() => {
                void handleLogout();
              }}
            >
              {isLoggingOut ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});
