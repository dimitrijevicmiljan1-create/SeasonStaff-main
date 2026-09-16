"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatWeekRange } from "@/lib/week-utils";
import { Button } from "@/components/ui/button";

interface WeekNavigationProps {
  weekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  isCurrentWeek: boolean;
}

export function WeekNavigation({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  onToday,
  isCurrentWeek,
}: WeekNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2.5 lg:px-6 lg:py-3">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={onPreviousWeek}
          aria-label="Previous week"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </Button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold text-text-primary lg:text-base">
            {formatWeekRange(weekStart)}
          </p>
          {isCurrentWeek && (
            <p className="text-[10px] font-medium uppercase tracking-wide text-accent lg:text-xs">
              Current week
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={onNextWeek}
          aria-label="Next week"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </Button>
      </div>

      {!isCurrentWeek && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={onToday}
        >
          Today
        </Button>
      )}
    </div>
  );
}
