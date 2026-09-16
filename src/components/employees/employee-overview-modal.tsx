"use client";

import { useQuery } from "@tanstack/react-query";

import type { EmployeeWithInvite } from "@/types/employees";
import {
  employeeOverviewQueryKey,
  fetchEmployeeOverviewForModal,
} from "@/lib/employees/queries";
import {
  getEmployeeFullName,
  getEmployeePositionName,
  getEmptyEmployeeOverview,
} from "@/lib/employees/utils";
import { sectionTitle } from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmployeeStatusBadge,
  InvitePendingBadge,
} from "@/components/employees/employee-status-badge";

interface EmployeeOverviewModalProps {
  employee: EmployeeWithInvite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatShiftDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatOverviewDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function OverviewSectionSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}

export function EmployeeOverviewModal({
  employee,
  open,
  onOpenChange,
}: EmployeeOverviewModalProps) {
  const employeeId = employee?.id ?? "";

  const { data: overview, isLoading, isError, error } = useQuery({
    queryKey: employeeOverviewQueryKey(employeeId),
    queryFn: () => fetchEmployeeOverviewForModal(employeeId),
    enabled: open && !!employeeId,
  });

  if (!employee) return null;

  const display = overview ?? getEmptyEmployeeOverview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{getEmployeeFullName(employee)}</DialogTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {employee.pending_invite ? (
              <InvitePendingBadge />
            ) : (
              <EmployeeStatusBadge status={employee.status} />
            )}
            <span className="text-sm text-text-secondary">
              {getEmployeePositionName(employee)}
            </span>
          </div>
          {employee.email && (
            <p className="text-sm text-text-secondary">{employee.email}</p>
          )}
          {employee.phone && (
            <p className="text-sm text-text-secondary">{employee.phone}</p>
          )}
        </DialogHeader>

        {isError && (
          <p className="text-sm text-status-rejected">
            {error instanceof Error
              ? error.message
              : "Failed to load employee overview."}
          </p>
        )}

        <div className="space-y-6 py-2">
          {isLoading ? (
            <>
              <OverviewSectionSkeleton />
              <OverviewSectionSkeleton />
              <OverviewSectionSkeleton />
              <OverviewSectionSkeleton />
            </>
          ) : (
            <>
              <section>
                <h3 className={cn(sectionTitle, "mb-2")}>Upcoming shifts</h3>
                {display.upcomingShifts.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    No upcoming shifts scheduled
                  </p>
                ) : (
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {display.upcomingShifts.map((shift) => (
                      <li
                        key={shift.id}
                        className="flex items-center justify-between px-3 py-2.5 text-sm"
                      >
                        <span className="font-medium text-text-primary">
                          {formatShiftDate(shift.date)}
                        </span>
                        <span className="tabular-nums text-text-secondary">
                          {shift.startTime}–{shift.endTime} · {shift.position}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className={cn(sectionTitle, "mb-2")}>Worked hours</h3>
                <p className="text-2xl font-semibold tabular-nums text-text-primary">
                  {display.workedHoursThisMonth.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-text-secondary">
                    hrs this month
                  </span>
                </p>
              </section>

              <section>
                <h3 className={cn(sectionTitle, "mb-2")}>Attendance history</h3>
                {display.attendanceHistory.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    No attendance recorded yet
                  </p>
                ) : (
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {display.attendanceHistory.map((entry) => (
                      <li key={entry.id} className="px-3 py-2.5 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="font-medium text-text-primary">
                            {formatOverviewDate(entry.date)}
                          </span>
                          <span className="tabular-nums text-text-secondary">
                            {entry.hours}h
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          In {entry.checkIn} · Out {entry.checkOut}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className={cn(sectionTitle, "mb-2")}>Request history</h3>
                {display.requestHistory.length === 0 ? (
                  <p className="text-sm text-text-secondary">No requests yet</p>
                ) : (
                  <ul className="space-y-2">
                    {display.requestHistory.map((request) => (
                      <li
                        key={request.id}
                        className="rounded-lg border border-border px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-text-primary">
                            {request.type === "swap" ? "Swap" : "Time off"}
                          </span>
                          <Badge
                            variant={
                              request.status === "pending"
                                ? "pending"
                                : request.status === "approved"
                                  ? "approved"
                                  : "rejected"
                            }
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                          {request.summary}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
