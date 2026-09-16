import { isDemoMode } from "@/lib/demo/config";
import {
  getDemoActiveEmployeeCount,
  getDemoPendingRequestSummaries,
  getDemoTodayShifts,
} from "@/lib/demo/store";
import { getEmployeeFullName } from "@/lib/employees/utils";
import {
  formatRequestDetails,
  loadShiftPreviewsForRequests,
  mapRequestRow,
} from "@/lib/requests/utils";
import { formatTimeFromDb } from "@/lib/shifts/utils";
import { createClient } from "@/lib/supabase/client";
import { toDateKey } from "@/lib/week-utils";
import type { TodayShift } from "@/types/shifts";
import type { PendingRequestSummary } from "@/types/requests";

const PENDING_REQUEST_SELECT = `
  id, type, metadata,
  employees ( first_name, last_name )
`;

export const dashboardPendingQueryKey = (organizationId: string) =>
  ["dashboard-pending", organizationId] as const;

export const dashboardTodayShiftsQueryKey = (organizationId: string) =>
  ["dashboard-today-shifts", organizationId] as const;

export async function fetchDashboardPendingRequests(
  organizationId: string,
): Promise<PendingRequestSummary[]> {
  if (isDemoMode()) {
    return getDemoPendingRequestSummaries();
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(PENDING_REQUEST_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const mapped = data.map((row) => mapRequestRow(row as Record<string, unknown>));
  const shiftById = await loadShiftPreviewsForRequests(supabase, mapped);

  return mapped.map((r) => ({
    id: r.id,
    type: r.type,
    employeeName: getEmployeeFullName(r.employees),
    summary: formatRequestDetails(r, shiftById),
  }));
}

export async function fetchDashboardTodayShifts(
  organizationId: string,
): Promise<TodayShift[]> {
  if (isDemoMode()) {
    return getDemoTodayShifts();
  }

  const supabase = createClient();
  const today = toDateKey(new Date());

  const [shiftsResult, checkinsResult] = await Promise.all([
    supabase
      .from("shifts")
      .select(
        "id, employee_id, start_time, end_time, employees ( first_name, last_name ), positions ( name )",
      )
      .eq("organization_id", organizationId)
      .eq("shift_date", today)
      .neq("status", "cancelled")
      .order("start_time"),
    supabase
      .from("attendance_logs")
      .select("employee_id")
      .eq("organization_id", organizationId)
      .eq("type", "check_in")
      .gte("timestamp", `${today}T00:00:00`)
      .lt("timestamp", `${today}T23:59:59.999`),
  ]);

  if (shiftsResult.error || !shiftsResult.data) return [];

  const checkedInIds = new Set(
    (checkinsResult.data ?? []).map((c) => String(c.employee_id)),
  );

  return shiftsResult.data.map((row) => {
    const r = row as Record<string, unknown>;
    const emp = r.employees as { first_name: string; last_name: string } | null;
    const pos = r.positions as { name: string } | null;
    return {
      id: String(r.id),
      employeeId: String(r.employee_id),
      startTime: formatTimeFromDb(String(r.start_time)),
      endTime: formatTimeFromDb(String(r.end_time)),
      employeeName: emp ? `${emp.first_name} ${emp.last_name}`.trim() : "—",
      position: pos?.name ?? "—",
      checkedIn: checkedInIds.has(String(r.employee_id)),
    };
  });
}

export async function fetchActiveEmployeeCount(
  organizationId: string,
): Promise<number> {
  if (isDemoMode()) {
    return getDemoActiveEmployeeCount();
  }

  const supabase = createClient();
  const { count } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  return count ?? 0;
}
