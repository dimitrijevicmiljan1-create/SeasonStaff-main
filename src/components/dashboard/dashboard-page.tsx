"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { CopyPreviousWeekDialog } from "@/components/dashboard/copy-previous-week-dialog";
import { PendingRequestsSection } from "@/components/dashboard/pending-requests";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatsRow } from "@/components/dashboard/stats-row";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useCopyPreviousWeek } from "@/hooks/use-copy-previous-week";
import {
  dashboardPendingQueryKey,
  dashboardTodayShiftsQueryKey,
  fetchDashboardPendingRequests,
  fetchDashboardTodayShifts,
} from "@/lib/dashboard/queries";
import { employeesQueryKey, fetchEmployees } from "@/lib/employees/queries";
import {
  keepPreviousData,
  LIST_QUERY_STALE_MS,
} from "@/lib/query/options";
import { pageContainer, pageStack } from "@/lib/page-styles";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const organizationId = profile?.organization_id;
  const role = profile?.role ?? "employee";
  const isStaff = role !== "employee";

  const copyPreviousWeek = useCopyPreviousWeek();
  const { showSuccess, showError } = useToast();
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const { data: todayShifts = [] } = useQuery({
    queryKey: dashboardTodayShiftsQueryKey(organizationId ?? ""),
    queryFn: () => fetchDashboardTodayShifts(organizationId!),
    enabled: Boolean(organizationId),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: dashboardPendingQueryKey(organizationId ?? ""),
    queryFn: () => fetchDashboardPendingRequests(organizationId!),
    enabled: Boolean(organizationId && isStaff),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const { data: employees = [] } = useQuery({
    queryKey: employeesQueryKey(organizationId ?? ""),
    queryFn: () => fetchEmployees(organizationId!),
    enabled: Boolean(organizationId && isStaff),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "active").length,
    [employees],
  );

  const resolvedPendingCount = pendingCount || pendingRequests.length;

  const checkedInToday = useMemo(
    () =>
      new Set(
        todayShifts.filter((shift) => shift.checkedIn).map((shift) => shift.employeeId),
      ).size,
    [todayShifts],
  );

  const stats = useMemo(
    () => [
      { label: "Today's shifts", value: todayShifts.length },
      {
        label: "Active employees",
        value: activeEmployees,
        href: "/employees",
      },
      {
        label: "Pending requests",
        value: resolvedPendingCount,
        href: "/requests",
      },
      {
        label: "Checked-in",
        value: checkedInToday,
      },
    ],
    [activeEmployees, checkedInToday, resolvedPendingCount, todayShifts.length],
  );
  const handleCopyWeekConfirm = useCallback(async () => {
    setIsCopying(true);

    try {
      const result = await copyPreviousWeek();

      if (result.success) {
        showSuccess("Week copied successfully");
        setCopyDialogOpen(false);
        return;
      }

      showError(result.error);
    } catch {
      showError("Failed to copy the previous week");
    } finally {
      setIsCopying(false);
    }
  }, [copyPreviousWeek, showError, showSuccess]);

  if (authLoading || !organizationId) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={cn(pageContainer, pageStack)}>
      <StatsRow items={stats} />

      <QuickActions
        pendingCount={resolvedPendingCount}
        onAddEmployee={() => {
          window.location.href = "/employees";
        }}
        onCopyWeek={() => setCopyDialogOpen(true)}
      />

      <CopyPreviousWeekDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        onConfirm={handleCopyWeekConfirm}
        isCopying={isCopying}
      />

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <TodaySchedule shifts={todayShifts} className="lg:px-0" />
        </div>
        <div className="lg:col-span-5">
          {isStaff && (
            <PendingRequestsSection
              initialRequests={pendingRequests}
              onCountChange={setPendingCount}
              role={role}
            />
          )}
        </div>
      </div>
    </div>
  );
}
