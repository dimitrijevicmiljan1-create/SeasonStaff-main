"use client";

import type { AttendanceEmployeeMonthlySummary } from "@/types/attendance";
import { sectionTitle } from "@/lib/page-styles";
import { cn } from "@/lib/utils";

interface AttendanceSummaryProps {
  summaries: AttendanceEmployeeMonthlySummary[];
  monthLabel: string;
}

export function AttendanceSummary({
  summaries,
  monthLabel,
}: AttendanceSummaryProps) {
  if (summaries.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className={cn(sectionTitle, "mb-1")}>Worked hours — {monthLabel}</h2>
        <p className="text-sm text-text-secondary">
          No attendance recorded this month yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className={cn(sectionTitle, "mb-3")}>Worked hours — {monthLabel}</h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((item) => (
          <li
            key={item.employeeId}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
          >
            <span className="truncate text-sm font-medium text-text-primary">
              {item.employeeName}
            </span>
            <span className="ml-2 shrink-0 text-sm font-semibold tabular-nums text-text-primary">
              {item.totalHours}h
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
