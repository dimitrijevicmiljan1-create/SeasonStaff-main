"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AttendanceLogAddModal } from "@/components/attendance/attendance-log-add-modal";
import { AttendanceLogEditModal } from "@/components/attendance/attendance-log-edit-modal";
import { AttendanceSummary } from "@/components/attendance/attendance-summary";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  attendanceLogsQueryKey,
  attendanceMonthlySummaryQueryKey,
  fetchAttendanceLogs,
  fetchAttendanceMonthlySummaries,
} from "@/lib/attendance/queries";
import { fetchEmployees, employeesQueryKey } from "@/lib/employees/queries";
import {
  keepPreviousData,
  LIST_QUERY_STALE_MS,
} from "@/lib/query/options";
import {
  filterPillActive,
  filterPillBase,
  filterPillInactive,
  listMeta,
  pageContainer,
  pageStack,
} from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import type {
  AttendanceLog,
  AttendanceLogFilters,
  AttendanceLogType,
} from "@/types/attendance";
import type { EmployeeWithInvite } from "@/types/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const typeFilters: { id: "all" | AttendanceLogType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "check_in", label: "Check in" },
  { id: "check_out", label: "Check out" },
];

interface AttendancePageProps {}

export function AttendancePage(_props: AttendancePageProps = {}) {
  const { profile, isLoading: authLoading } = useAuth();
  const organizationId = profile?.organization_id ?? "";
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const isOwner = profile?.role === "owner";

  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | AttendanceLogType>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editLog, setEditLog] = useState<AttendanceLog | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filters: AttendanceLogFilters = useMemo(() => {
    const f: AttendanceLogFilters = {};
    if (employeeFilter !== "all") f.employeeId = employeeFilter;
    if (typeFilter !== "all") f.type = typeFilter;
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;
    return f;
  }, [employeeFilter, typeFilter, dateFrom, dateTo]);

  const monthLabel = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const { data: employees = [] } = useQuery({
    queryKey: employeesQueryKey(organizationId),
    queryFn: () => fetchEmployees(organizationId),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const {
    data: logs = [],
    isLoading: logsLoading,
    isFetching: logsFetching,
  } = useQuery({
    queryKey: attendanceLogsQueryKey(organizationId, filters),
    queryFn: () => fetchAttendanceLogs(organizationId, filters),
    enabled: Boolean(organizationId),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const { data: summaries = [] } = useQuery({
    queryKey: attendanceMonthlySummaryQueryKey(organizationId),
    queryFn: () => fetchAttendanceMonthlySummaries(organizationId),
    enabled: Boolean(organizationId),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const invalidateAttendance = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["attendance-logs", organizationId],
    });
    await queryClient.invalidateQueries({
      queryKey: attendanceMonthlySummaryQueryKey(organizationId),
    });
  }, [organizationId, queryClient]);

  const employeeOptions = useMemo(
    () =>
      [...employees].sort((a, b) =>
        `${a.last_name} ${a.first_name}`.localeCompare(
          `${b.last_name} ${b.first_name}`,
        ),
      ),
    [employees],
  );

  function handleEdit(log: AttendanceLog) {
    setEditLog(log);
    setEditOpen(true);
  }

  const showLoading = (authLoading || !organizationId || logsLoading) && logs.length === 0;

  if (authLoading || !organizationId) {
    return (
      <div className={pageContainer}>
        <div className={pageStack}>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (profile?.role === "employee") {
    return (
      <div className={pageContainer}>
        <p className="text-sm text-text-secondary">
          You do not have permission to view attendance.
        </p>
      </div>
    );
  }

  return (
    <div className={pageContainer}>
      <div className={pageStack}>
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text-primary lg:text-2xl">
              Attendance
            </h1>
            <p className={cn(listMeta, "mt-1")}>
              Review check-in and check-out logs. Owners can edit entries.
            </p>
          </div>
          {isOwner && (
            <Button
              size="sm"
              className="h-9 shrink-0 gap-1.5"
              onClick={() => setAddOpen(true)}
            >
              + Add Entry
            </Button>
          )}
        </header>

        <AttendanceSummary summaries={summaries} monthLabel={monthLabel} />

        <section className="space-y-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setEmployeeFilter("all")}
                className={cn(
                  filterPillBase,
                  employeeFilter === "all"
                    ? filterPillActive
                    : filterPillInactive,
                )}
              >
                All employees
              </button>
              {employeeOptions.map((employee: EmployeeWithInvite) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => setEmployeeFilter(employee.id)}
                  className={cn(
                    filterPillBase,
                    employeeFilter === employee.id
                      ? filterPillActive
                      : filterPillInactive,
                  )}
                >
                  {employee.first_name} {employee.last_name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {typeFilters.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTypeFilter(id)}
                  className={cn(
                    filterPillBase,
                    typeFilter === id ? filterPillActive : filterPillInactive,
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="date-from" className="text-xs">
                  From
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 w-[160px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="date-to" className="text-xs">
                  To
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 w-[160px]"
                />
              </div>
            </div>
          </div>

          {logsFetching && !showLoading && (
            <p className={listMeta}>Updating…</p>
          )}

          {showLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <AttendanceTable
              logs={logs}
              canEdit={isOwner}
              onEdit={handleEdit}
            />
          )}
        </section>
      </div>

      <AttendanceLogEditModal
        log={editLog}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => {
          showSuccess("Attendance log updated.");
          void invalidateAttendance();
        }}
        onError={showError}
      />

      <AttendanceLogAddModal
        open={addOpen}
        onOpenChange={setAddOpen}
        employees={employees}
        onSaved={() => {
          showSuccess("Attendance entry added.");
          void invalidateAttendance();
        }}
        onError={showError}
      />
    </div>
  );
}
