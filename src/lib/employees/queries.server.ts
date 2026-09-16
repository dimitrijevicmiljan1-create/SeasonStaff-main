import { isDemoMode } from "@/lib/demo/config";
import {
  getDemoEmployeeOverview,
  getDemoEmployees,
} from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import {
  buildAttendanceDaySummaries,
  getMonthRange,
  sumWorkedHours,
} from "@/lib/attendance/utils";
import { mapEmployeeRow } from "@/lib/employees/utils";
import { REQUEST_SELECT, mapRequestRow } from "@/lib/requests/utils";
import { formatTimeFromDb } from "@/lib/shifts/utils";
import type { EmployeeOverviewData, EmployeeWithInvite } from "@/types/employees";

const EMPLOYEE_SELECT = `
  id,
  organization_id,
  profile_id,
  first_name,
  last_name,
  email,
  phone,
  position_id,
  status,
  notes,
  created_at,
  position:positions(id, organization_id, name, created_at),
  employee_invites(id, accepted_at, expires_at)
`;

export async function fetchEmployeesServer(
  organizationId: string,
): Promise<EmployeeWithInvite[]> {
  if (isDemoMode()) {
    return getDemoEmployees();
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("organization_id", organizationId)
    .order("last_name")
    .order("first_name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapEmployeeRow(row));
}

export async function fetchEmployeeOverview(
  employeeId: string,
  organizationId: string,
): Promise<EmployeeOverviewData> {
  if (isDemoMode()) {
    const overview = getDemoEmployeeOverview(employeeId);
    if (!overview) {
      throw new Error("Employee not found.");
    }
    return overview;
  }

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { dateFrom, dateTo } = getMonthRange();

  const [
    shiftsResult,
    monthAttendanceResult,
    requestsResult,
    historyAttendanceResult,
  ] = await Promise.all([
    supabase
      .from("shifts")
      .select(
        "id, shift_date, start_time, end_time, position:positions(name)",
      )
      .eq("employee_id", employeeId)
      .eq("organization_id", organizationId)
      .gte("shift_date", today)
      .neq("status", "cancelled")
      .order("shift_date")
      .order("start_time")
      .limit(10),
    supabase
      .from("attendance_logs")
      .select("id, timestamp, type")
      .eq("employee_id", employeeId)
      .eq("organization_id", organizationId)
      .gte("timestamp", `${dateFrom}T00:00:00.000Z`)
      .lte("timestamp", `${dateTo}T23:59:59.999Z`)
      .order("timestamp"),
    supabase
      .from("requests")
      .select(REQUEST_SELECT)
      .eq("employee_id", employeeId)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("attendance_logs")
      .select("id, timestamp, type")
      .eq("employee_id", employeeId)
      .eq("organization_id", organizationId)
      .order("timestamp", { ascending: false })
      .limit(200),
  ]);

  if (shiftsResult.error) {
    throw new Error(shiftsResult.error.message);
  }
  if (monthAttendanceResult.error) {
    throw new Error(monthAttendanceResult.error.message);
  }
  if (requestsResult.error) {
    throw new Error(requestsResult.error.message);
  }
  if (historyAttendanceResult.error) {
    throw new Error(historyAttendanceResult.error.message);
  }

  const monthLogs = (monthAttendanceResult.data ?? []).map((row) => ({
    id: String(row.id),
    timestamp: String(row.timestamp),
    type: row.type as "check_in" | "check_out",
  }));

  const daySummaries = buildAttendanceDaySummaries(monthLogs);

  const historySummaries = buildAttendanceDaySummaries(
    (historyAttendanceResult.data ?? []).map((row) => ({
      id: String(row.id),
      timestamp: String(row.timestamp),
      type: row.type as "check_in" | "check_out",
    })),
  ).slice(0, 14);

  const upcomingShifts = (shiftsResult.data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const positionRaw = r.position;
    const positionName =
      positionRaw && typeof positionRaw === "object"
        ? String((positionRaw as { name: string }).name)
        : "—";
    return {
      id: String(r.id),
      date: String(r.shift_date),
      startTime: formatTimeFromDb(String(r.start_time)),
      endTime: formatTimeFromDb(String(r.end_time)),
      position: positionName,
    };
  });

  const requestHistory = (requestsResult.data ?? []).map((row) => {
    const mapped = mapRequestRow(row as Record<string, unknown>);
    let summary = mapped.type === "swap" ? "Shift swap" : "Time off";
    if (mapped.type === "time_off" && "date" in mapped.metadata) {
      summary = `Time off · ${mapped.metadata.date}`;
    }
    if (mapped.type === "swap" && "note" in mapped.metadata && mapped.metadata.note) {
      summary = `Shift swap · ${mapped.metadata.note}`;
    }
    return {
      id: mapped.id,
      type: mapped.type,
      summary,
      status: mapped.status,
      date: mapped.created_at.slice(0, 10),
    };
  });

  return {
    upcomingShifts,
    workedHoursThisMonth: sumWorkedHours(daySummaries),
    attendanceHistory: historySummaries.map((day) => ({
      id: day.date,
      date: day.date,
      checkIn: day.checkIn ?? "—",
      checkOut: day.checkOut ?? "—",
      hours: day.hours,
    })),
    requestHistory,
  };
}
