import { isDemoMode } from "@/lib/demo/config";
import { getDemoAttendanceLogs } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import {
  ATTENDANCE_LOG_SELECT,
  buildAttendanceDaySummaries,
  mapAttendanceLogRow,
  sumWorkedHours,
  getMonthRange,
} from "@/lib/attendance/utils";
import { getEmployeeFullName } from "@/lib/employees/utils";
import type {
  AttendanceEmployeeMonthlySummary,
  AttendanceLog,
  AttendanceLogFilters,
} from "@/types/attendance";

export async function fetchAttendanceLogsServer(
  organizationId: string,
  filters: AttendanceLogFilters = {},
): Promise<AttendanceLog[]> {
  if (isDemoMode()) {
    return getDemoAttendanceLogs(filters);
  }

  const supabase = await createClient();

  let query = supabase
    .from("attendance_logs")
    .select(ATTENDANCE_LOG_SELECT)
    .eq("organization_id", organizationId)
    .order("timestamp", { ascending: false })
    .limit(500);

  if (filters.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.dateFrom) {
    query = query.gte("timestamp", `${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters.dateTo) {
    query = query.lte("timestamp", `${filters.dateTo}T23:59:59.999Z`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    mapAttendanceLogRow(row as Parameters<typeof mapAttendanceLogRow>[0]),
  );
}

export async function fetchAttendanceMonthlySummariesServer(
  organizationId: string,
  monthDate = new Date(),
): Promise<AttendanceEmployeeMonthlySummary[]> {
  const { dateFrom, dateTo } = getMonthRange(monthDate);
  const logs = await fetchAttendanceLogsServer(organizationId, {
    dateFrom,
    dateTo,
  });

  const byEmployee = new Map<string, AttendanceLog[]>();
  for (const log of logs) {
    const list = byEmployee.get(log.employee_id) ?? [];
    list.push(log);
    byEmployee.set(log.employee_id, list);
  }

  const summaries: AttendanceEmployeeMonthlySummary[] = [];

  for (const [employeeId, employeeLogs] of byEmployee.entries()) {
    const employee = employeeLogs[0]?.employee;
    const daySummaries = buildAttendanceDaySummaries(employeeLogs);
    summaries.push({
      employeeId,
      employeeName: employee
        ? getEmployeeFullName(employee)
        : "Unknown",
      totalHours: sumWorkedHours(daySummaries),
    });
  }

  return summaries.sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName),
  );
}
