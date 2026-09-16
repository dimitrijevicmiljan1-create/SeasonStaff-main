import { addWeeks, toDateKey } from "@/lib/week-utils";
import { getEmployeeFullName } from "@/lib/employees/utils";
import {
  formatRequestDetails,
  toRequestListItem,
  type ShiftPreview,
} from "@/lib/requests/utils";
import type { AttendanceLog } from "@/types/attendance";
import type { EmployeeOverviewData, EmployeeWithInvite, Position } from "@/types/employees";
import type { Notification } from "@/types/notifications";
import type { PendingRequestSummary, RequestListItem, RequestStatus } from "@/types/requests";
import type { CreateShiftInput, ShiftWithPosition, TodayShift } from "@/types/shifts";

import {
  buildDemoDataset,
  filterDemoWeekShifts,
  getDemoTodayShifts as computeDemoTodayShifts,
  getWeekDateRange,
  type DemoDataset,
} from "./build-data";
import { DEMO_ORG_ID } from "./constants";

function clone<T>(value: T): T {
  return structuredClone(value);
}

let store: DemoDataset = buildDemoDataset();

function refreshStore(): void {
  store = buildDemoDataset();
}

function shiftPreviewMap(): Map<string, ShiftPreview> {
  const map = new Map<string, ShiftPreview>();
  for (const shift of store.shifts) {
    map.set(shift.id, {
      id: shift.id,
      shift_date: shift.shift_date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      positions: shift.position ? { name: shift.position.name } : null,
    });
  }
  return map;
}

export function getDemoPositions(): Position[] {
  return clone(store.positions);
}

export function getDemoEmployees(): EmployeeWithInvite[] {
  return clone(store.employees);
}

export function getDemoActiveEmployeeCount(): number {
  return store.employees.filter((e) => e.status === "active").length;
}

export function getDemoWeekShifts(weekStart: Date): ShiftWithPosition[] {
  return clone(filterDemoWeekShifts(store.shifts, weekStart));
}

export function getDemoTodayShifts(): TodayShift[] {
  return getDemoTodayShiftsFromStore(store);
}

function getDemoTodayShiftsFromStore(dataset: DemoDataset): TodayShift[] {
  return computeDemoTodayShifts(dataset);
}

export function getDemoPendingRequestSummaries(): PendingRequestSummary[] {
  const shiftById = shiftPreviewMap();
  return store.requests
    .filter((r) => r.status === "pending")
    .map((r) => ({
      id: r.id,
      type: r.type,
      employeeName: getEmployeeFullName(r.employees),
      summary: formatRequestDetails(r, shiftById),
    }));
}

export function getDemoRequestListItems(): RequestListItem[] {
  const shiftById = shiftPreviewMap();
  return clone(store.requests.map((r) => toRequestListItem(r, shiftById)));
}

export function getDemoMyRequests(employeeId: string): RequestListItem[] {
  const shiftById = shiftPreviewMap();
  return clone(
    store.requests
      .filter((r) => r.employee_id === employeeId)
      .map((r) => toRequestListItem(r, shiftById)),
  );
}

export function getDemoPendingRequestCount(): number {
  return store.requests.filter((r) => r.status === "pending").length;
}

export function updateDemoRequestStatus(
  requestId: string,
  status: RequestStatus,
): boolean {
  const request = store.requests.find((r) => r.id === requestId);
  if (!request) return false;
  request.status = status;
  return true;
}

export function getDemoNotifications(_userId?: string): Notification[] {
  return clone(store.notifications);
}

export function getDemoUnreadNotificationCount(_userId?: string): number {
  return store.notifications.filter((n) => n.unread).length;
}

export function markDemoNotificationRead(notificationId: string): boolean {
  const item = store.notifications.find((n) => n.id === notificationId);
  if (!item) return false;
  item.unread = false;
  return true;
}

export function markAllDemoNotificationsRead(userId?: string): void {
  for (const item of store.notifications) {
    if (!userId || item.user_id === userId) {
      item.unread = false;
    }
  }
}

export function getDemoAttendanceLogs(
  filters: {
    employeeId?: string;
    type?: AttendanceLog["type"];
    dateFrom?: string;
    dateTo?: string;
  } = {},
): AttendanceLog[] {
  let logs = [...store.attendanceLogs];

  if (filters.employeeId) {
    logs = logs.filter((log) => log.employee_id === filters.employeeId);
  }
  if (filters.type) {
    logs = logs.filter((log) => log.type === filters.type);
  }
  if (filters.dateFrom) {
    logs = logs.filter((log) => log.timestamp >= `${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters.dateTo) {
    logs = logs.filter((log) => log.timestamp <= `${filters.dateTo}T23:59:59.999Z`);
  }

  return clone(logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
}

export function getDemoEmployeeOverview(
  employeeId: string,
): EmployeeOverviewData | null {
  const overview = store.employeeOverviews[employeeId];
  return overview ? clone(overview) : null;
}

export function copyDemoPreviousWeek(targetWeekStartIso: string): {
  success: boolean;
  copiedCount?: number;
  error?: string;
  code?: "already_copied" | "no_source";
} {
  const targetWeekStart = new Date(`${targetWeekStartIso}T12:00:00`);
  const previousWeekStart = addWeeks(targetWeekStart, -1);
  const previousRange = getWeekDateRange(previousWeekStart);
  const targetRange = getWeekDateRange(targetWeekStart);

  const previousWeekShifts = store.shifts.filter(
    (s) =>
      s.shift_date >= previousRange.startKey &&
      s.shift_date <= previousRange.endKey &&
      s.status !== "cancelled",
  );

  if (previousWeekShifts.length === 0) {
    return { success: false, code: "no_source", error: "No shifts found in the previous week" };
  }

  const existingTarget = store.shifts.filter(
    (s) => s.shift_date >= targetRange.startKey && s.shift_date <= targetRange.endKey,
  );

  let copiedCount = 0;
  let nextId = Date.now();

  for (const shift of previousWeekShifts) {
    const targetDate = toDateKey(
      new Date(new Date(`${shift.shift_date}T12:00:00`).getTime() + 7 * 86400000),
    );

    const duplicate = existingTarget.some(
      (existing) =>
        existing.employee_id === shift.employee_id &&
        existing.shift_date === targetDate &&
        existing.start_time === shift.start_time &&
        existing.end_time === shift.end_time,
    );

    if (duplicate) continue;

    const copied: ShiftWithPosition = {
      ...clone(shift),
      id: `demo-shift-copy-${nextId++}`,
      shift_date: targetDate,
      status: "scheduled",
    };

    store.shifts.push(copied);
    existingTarget.push(copied);
    copiedCount += 1;
  }

  if (copiedCount === 0) {
    return {
      success: false,
      code: "already_copied",
      error: "Shifts for this week have already been copied",
    };
  }

  return { success: true, copiedCount };
}

export function createDemoShifts(inputs: CreateShiftInput[]): ShiftWithPosition[] {
  const positionById = Object.fromEntries(store.positions.map((p) => [p.id, p]));
  const created: ShiftWithPosition[] = [];
  let nextId = Date.now();

  for (const input of inputs) {
    const shift: ShiftWithPosition = {
      id: `demo-shift-new-${nextId++}`,
      organization_id: DEMO_ORG_ID,
      employee_id: input.employee_id,
      shift_date: input.shift_date,
      start_time: input.start_time,
      end_time: input.end_time,
      position_id: input.position_id,
      status: input.status ?? "scheduled",
      created_at: new Date().toISOString(),
      position: input.position_id
        ? (positionById[input.position_id] ?? null)
        : null,
    };
    store.shifts.push(shift);
    created.push(clone(shift));
  }

  return created;
}

export function resetDemoStore(): void {
  refreshStore();
}
