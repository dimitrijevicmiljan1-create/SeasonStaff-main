"use client";

import { memo } from "react";
import { AppLink } from "@/components/ui/app-link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { SeasonStaffLogo } from "@/components/brand/seasonstaff-logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/shifts", label: "Shift Board", icon: CalendarDays },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/attendance", label: "Attendance", icon: ClipboardList },
];

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  if (!isLargeScreen) {
    return null;
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center px-5">
        <SeasonStaffLogo size={36} />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <AppLink
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium",
                active
                  ? "border-l-2 border-accent bg-accent-subtle pl-[14px] text-accent"
                  : "text-text-secondary hover:bg-subtle hover:text-text-primary",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              {label}
            </AppLink>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <AppLink
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium",
            pathname.startsWith("/settings")
              ? "border-l-2 border-accent bg-accent-subtle pl-[14px] text-accent"
              : "text-text-secondary hover:bg-subtle hover:text-text-primary",
          )}
        >
          <Settings className="h-5 w-5 shrink-0" strokeWidth={1.5} />
          Settings
        </AppLink>
      </div>
    </aside>
  );
});
