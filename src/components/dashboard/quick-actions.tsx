"use client";

import { AppLink } from "@/components/ui/app-link";
import {
  CalendarPlus,
  Copy,
  Inbox,
  UserPlus,
} from "lucide-react";

import { sectionHeaderRow, sectionTitle } from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAddEmployee?: () => void;
  onCopyWeek?: () => void;
  pendingCount?: number;
  className?: string;
}

const actions = [
  {
    id: "add-employee",
    label: "Add Employee",
    shortLabel: "Add Employee",
    icon: UserPlus,
    variant: "default" as const,
  },
  {
    id: "create-shift",
    label: "Create Shift",
    shortLabel: "Create Shift",
    icon: CalendarPlus,
    variant: "outline" as const,
    href: "/shifts",
  },
  {
    id: "copy-week",
    label: "Copy Previous Week",
    shortLabel: "Copy week",
    icon: Copy,
    variant: "outline" as const,
  },
  {
    id: "view-requests",
    label: "View Requests",
    shortLabel: "Requests",
    icon: Inbox,
    variant: "outline" as const,
    href: "/requests",
  },
];

export function QuickActions({
  onAddEmployee,
  onCopyWeek,
  pendingCount = 0,
  className,
}: QuickActionsProps) {
  return (
    <section className={className}>
      <div className={sectionHeaderRow}>
        <h2 className={sectionTitle}>Quick Actions</h2>
        {pendingCount > 0 && (
          <AppLink
            href="/requests"
            className="text-xs font-medium text-accent lg:hidden"
          >
            {pendingCount} pending
          </AppLink>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:flex lg:flex-wrap lg:gap-3">
        {actions.map(
          ({ id, label, shortLabel, icon: Icon, variant, href }) => {
            const content = (
              <>
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span className="text-center leading-tight lg:hidden">{shortLabel}</span>
                <span className="hidden truncate lg:inline">{label}</span>
                {id === "view-requests" && pendingCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-status-rejected px-1 text-[10px] font-medium text-white lg:ml-1">
                    {pendingCount}
                  </span>
                )}
              </>
            );

            const buttonClass = cn(
              "h-10 gap-1.5 px-2.5 text-xs lg:h-10 lg:gap-2 lg:px-4 lg:text-sm",
              id === "create-shift" &&
                "border-accent/30 bg-accent-subtle text-accent hover:bg-accent-subtle lg:border-border lg:bg-surface lg:text-text-primary lg:hover:bg-subtle",
            );

            if (href) {
              return (
                <Button
                  key={id}
                  variant={variant}
                  className={buttonClass}
                  asChild
                >
                  <AppLink href={href}>{content}</AppLink>
                </Button>
              );
            }

            return (
              <Button
                key={id}
                variant={variant}
                className={buttonClass}
                onClick={
                  id === "add-employee"
                    ? onAddEmployee
                    : id === "copy-week"
                      ? onCopyWeek
                      : undefined
                }
                type="button"
              >
                {content}
              </Button>
            );
          },
        )}
      </div>
    </section>
  );
}
