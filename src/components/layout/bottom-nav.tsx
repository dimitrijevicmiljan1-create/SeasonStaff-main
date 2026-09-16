"use client";

import { memo } from "react";
import { AppLink } from "@/components/ui/app-link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { LIST_QUERY_STALE_MS } from "@/lib/query/options";
import {
  fetchPendingRequestsCount,
  pendingRequestsCountQueryKey,
} from "@/lib/requests/queries";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/shifts", label: "Shifts", icon: CalendarDays },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/requests", label: "Requests", icon: Inbox, showDot: true },
  { href: "/attendance", label: "Attendance", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const BottomNav = memo(function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  const isStaff = ["owner", "manager"].includes(profile?.role ?? "");

  const { data: pendingCount = 0 } = useQuery({
    queryKey: pendingRequestsCountQueryKey(orgId ?? ""),
    queryFn: () => fetchPendingRequestsCount(orgId!),
    enabled: Boolean(orgId && isStaff),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
  });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface shadow-sm lg:hidden">
      <div
        className="flex h-14 items-stretch pb-[env(safe-area-inset-bottom)]"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        {tabs.map(({ href, label, icon: Icon, showDot }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <AppLink
              key={href}
              href={href}
              className="relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1"
            >
              {active && (
                <span className="absolute top-1.5 h-1 w-1 rounded-full bg-accent" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-accent" : "text-text-secondary",
                )}
                strokeWidth={active ? 2 : 1.5}
              />
              <span
                className={cn(
                  "max-w-full truncate text-[10px] leading-none sm:text-xs",
                  active
                    ? "font-medium text-accent"
                    : "font-medium text-text-secondary",
                )}
              >
                {label}
              </span>
              {showDot && pendingCount > 0 && !active && (
                <span className="absolute right-[calc(50%-18px)] top-2 h-2 w-2 rounded-full bg-status-rejected" />
              )}
            </AppLink>
          );
        })}
      </div>
    </nav>
  );
});
