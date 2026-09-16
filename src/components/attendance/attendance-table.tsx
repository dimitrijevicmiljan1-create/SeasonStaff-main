"use client";

import { Pencil } from "lucide-react";

import {
  formatAttendanceTimestamp,
  formatAttendanceType,
} from "@/lib/attendance/utils";
import { getEmployeeFullName } from "@/lib/employees/utils";
import type { AttendanceLog } from "@/types/attendance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AttendanceTableProps {
  logs: AttendanceLog[];
  canEdit: boolean;
  onEdit: (log: AttendanceLog) => void;
}

export function AttendanceTable({
  logs,
  canEdit,
  onEdit,
}: AttendanceTableProps) {
  if (logs.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-text-secondary">
        No attendance logs match your filters.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-subtle/80">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Employee
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Type
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Timestamp
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Notes
              </th>
              {canEdit && (
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const name = log.employee
                ? getEmployeeFullName(log.employee)
                : "—";
              return (
                <tr
                  key={log.id}
                  className="border-b border-border last:border-b-0 transition-colors hover:bg-subtle/60"
                >
                  <td className="px-4 py-3.5 font-medium text-text-primary">
                    {name}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        log.type === "check_in" ? "approved" : "neutral"
                      }
                    >
                      {formatAttendanceType(log.type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-text-secondary">
                    {formatAttendanceTimestamp(log.timestamp)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3.5 text-text-secondary">
                    {log.notes ?? "—"}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(log)}
                        aria-label="Edit log"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
