import { AppLink } from "@/components/ui/app-link";

import type { TodayShift } from "@/types/shifts";
import { listMeta, sectionHeaderRow, sectionTitle } from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TodayScheduleProps {
  shifts: TodayShift[];
  className?: string;
}

export function TodaySchedule({ shifts, className }: TodayScheduleProps) {
  const visible = shifts.slice(0, 8);
  const remaining = shifts.length - visible.length;
  const checkedInCount = shifts.filter((s) => s.checkedIn).length;

  return (
    <section className={cn("min-w-0", className)}>
      <div className={cn(sectionHeaderRow, "px-0")}>
        <div>
          <h2 className={cn(sectionTitle, "text-base lg:text-sm")}>
            Today&apos;s Schedule
          </h2>
          {shifts.length > 0 && (
            <p className={cn(listMeta, "mt-1")}>
              {shifts.length} shifts · {checkedInCount} checked in
            </p>
          )}
        </div>
        <AppLink
          href="/shifts"
          className="shrink-0 text-xs font-medium text-accent hover:text-accent-hover lg:text-sm"
        >
          Full week →
        </AppLink>
      </div>

      <Card className="-mx-3 overflow-hidden rounded-none border-x-0 lg:mx-0 lg:rounded-lg lg:border-x">
        <CardContent className="p-0">
          {shifts.length === 0 ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 px-4 py-6">
              <p className="text-sm text-text-secondary">
                No shifts scheduled today
              </p>
              <Button size="sm" asChild>
                <AppLink href="/shifts">Create Shift</AppLink>
              </Button>
            </div>
          ) : (
            <>
              {visible.map((shift, index) => (
                <AppLink
                  key={shift.id}
                  href="/shifts"
                  className={cn(
                    "flex min-h-[44px] items-center gap-3 px-3 py-2 transition-colors active:bg-subtle hover:bg-subtle lg:min-h-[52px] lg:gap-4 lg:px-4",
                    index < visible.length - 1 && "border-b border-border",
                  )}
                >
                  <span className="w-[86px] shrink-0 text-sm font-semibold tabular-nums text-text-primary lg:w-[120px]">
                    {shift.startTime}–{shift.endTime}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {shift.employeeName}
                    </p>
                    <p className="truncate text-xs text-text-secondary lg:hidden">
                      {shift.position}
                    </p>
                  </div>
                  {shift.checkedIn ? (
                    <Badge variant="active" className="shrink-0">
                      In
                    </Badge>
                  ) : (
                    <span className="hidden w-[100px] shrink-0 text-sm text-text-secondary lg:block">
                      {shift.position}
                    </span>
                  )}
                </AppLink>
              ))}
              {remaining > 0 && (
                <div className="border-t border-border px-3 py-2 lg:px-4 lg:py-3">
                  <AppLink
                    href="/shifts"
                    className="text-xs font-medium text-accent hover:text-accent-hover lg:text-sm"
                  >
                    +{remaining} more shifts
                  </AppLink>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
