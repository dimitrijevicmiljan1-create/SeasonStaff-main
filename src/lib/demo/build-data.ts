import { addWeeks, startOfWeek, toDateKey } from "@/lib/week-utils";
import type { AttendanceLog } from "@/types/attendance";
import type { EmployeeOverviewData, EmployeeWithInvite, Position } from "@/types/employees";
import type { Notification } from "@/types/notifications";
import type { RequestWithEmployee } from "@/types/requests";
import type { ShiftWithPosition, TodayShift } from "@/types/shifts";

import {
  DEMO_EMPLOYEE_IDS,
  DEMO_MANAGER_USER_ID,
  DEMO_ORG_ID,
  DEMO_POSITION_IDS,
} from "./constants";

const CREATED_AT = "2026-05-01T08:00:00.000Z";

function dayOffset(weekStart: Date, offset: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + offset);
  return toDateKey(d);
}

function isoAt(dateKey: string, time: string): string {
  return `${dateKey}T${time}:00.000Z`;
}

export interface DemoDataset {
  positions: Position[];
  employees: EmployeeWithInvite[];
  shifts: ShiftWithPosition[];
  requests: RequestWithEmployee[];
  notifications: Notification[];
  attendanceLogs: AttendanceLog[];
  employeeOverviews: Record<string, EmployeeOverviewData>;
}

export function buildDemoDataset(): DemoDataset {
  const weekStart = startOfWeek(new Date());
  const prevWeekStart = addWeeks(weekStart, -1);
  const today = toDateKey(new Date());

  const positions: Position[] = [
    { id: DEMO_POSITION_IDS.waiter, organization_id: DEMO_ORG_ID, name: "Waiter", created_at: CREATED_AT },
    { id: DEMO_POSITION_IDS.bartender, organization_id: DEMO_ORG_ID, name: "Bartender", created_at: CREATED_AT },
    { id: DEMO_POSITION_IDS.chef, organization_id: DEMO_ORG_ID, name: "Chef", created_at: CREATED_AT },
    { id: DEMO_POSITION_IDS.host, organization_id: DEMO_ORG_ID, name: "Host", created_at: CREATED_AT },
    { id: DEMO_POSITION_IDS.runner, organization_id: DEMO_ORG_ID, name: "Runner", created_at: CREATED_AT },
  ];

  const positionById = Object.fromEntries(positions.map((p) => [p.id, p]));

  const employees: EmployeeWithInvite[] = [
    {
      id: DEMO_EMPLOYEE_IDS.ana,
      organization_id: DEMO_ORG_ID,
      profile_id: "demo-profile-ana",
      first_name: "Ana",
      last_name: "Petrović",
      email: "ana.petrovic@seasonstaff.demo",
      phone: "+381 63 111 0001",
      position_id: DEMO_POSITION_IDS.waiter,
      position: positionById[DEMO_POSITION_IDS.waiter],
      status: "active",
      notes: null,
      created_at: CREATED_AT,
      pending_invite: false,
    },
    {
      id: DEMO_EMPLOYEE_IDS.marko,
      organization_id: DEMO_ORG_ID,
      profile_id: "demo-profile-marko",
      first_name: "Marko",
      last_name: "Jovanović",
      email: "marko.jovanovic@seasonstaff.demo",
      phone: "+381 64 222 0002",
      position_id: DEMO_POSITION_IDS.bartender,
      position: positionById[DEMO_POSITION_IDS.bartender],
      status: "active",
      notes: null,
      created_at: CREATED_AT,
      pending_invite: false,
    },
    {
      id: DEMO_EMPLOYEE_IDS.luka,
      organization_id: DEMO_ORG_ID,
      profile_id: "demo-profile-luka",
      first_name: "Luka",
      last_name: "Nikolić",
      email: "luka.nikolic@seasonstaff.demo",
      phone: "+381 65 333 0003",
      position_id: DEMO_POSITION_IDS.chef,
      position: positionById[DEMO_POSITION_IDS.chef],
      status: "active",
      notes: null,
      created_at: CREATED_AT,
      pending_invite: false,
    },
    {
      id: DEMO_EMPLOYEE_IDS.sara,
      organization_id: DEMO_ORG_ID,
      profile_id: "demo-profile-sara",
      first_name: "Sara",
      last_name: "Ilić",
      email: "sara.ilic@seasonstaff.demo",
      phone: "+381 66 444 0004",
      position_id: DEMO_POSITION_IDS.host,
      position: positionById[DEMO_POSITION_IDS.host],
      status: "active",
      notes: null,
      created_at: CREATED_AT,
      pending_invite: false,
    },
    {
      id: DEMO_EMPLOYEE_IDS.nikola,
      organization_id: DEMO_ORG_ID,
      profile_id: null,
      first_name: "Nikola",
      last_name: "Savić",
      email: "nikola.savic@seasonstaff.demo",
      phone: "+381 67 555 0005",
      position_id: DEMO_POSITION_IDS.runner,
      position: positionById[DEMO_POSITION_IDS.runner],
      status: "active",
      notes: null,
      created_at: CREATED_AT,
      pending_invite: true,
    },
  ];

  type ShiftSpec = {
    id: string;
    employeeId: string;
    dayOffset: number;
    weekStart: Date;
    start: string;
    end: string;
    positionId: string;
    status: ShiftWithPosition["status"];
  };

  const shiftSpecs: ShiftSpec[] = [
    { id: "demo-shift-1", employeeId: DEMO_EMPLOYEE_IDS.ana, dayOffset: 0, weekStart, start: "08:00", end: "14:00", positionId: DEMO_POSITION_IDS.waiter, status: "completed" },
    { id: "demo-shift-2", employeeId: DEMO_EMPLOYEE_IDS.marko, dayOffset: 0, weekStart, start: "10:00", end: "18:00", positionId: DEMO_POSITION_IDS.bartender, status: "completed" },
    { id: "demo-shift-3", employeeId: DEMO_EMPLOYEE_IDS.luka, dayOffset: 1, weekStart, start: "07:00", end: "15:00", positionId: DEMO_POSITION_IDS.chef, status: "completed" },
    { id: "demo-shift-4", employeeId: DEMO_EMPLOYEE_IDS.sara, dayOffset: 1, weekStart, start: "12:00", end: "20:00", positionId: DEMO_POSITION_IDS.host, status: "scheduled" },
    { id: "demo-shift-5", employeeId: DEMO_EMPLOYEE_IDS.nikola, dayOffset: 2, weekStart, start: "11:00", end: "17:00", positionId: DEMO_POSITION_IDS.runner, status: "scheduled" },
    { id: "demo-shift-6", employeeId: DEMO_EMPLOYEE_IDS.ana, dayOffset: 2, weekStart, start: "16:00", end: "22:00", positionId: DEMO_POSITION_IDS.waiter, status: "scheduled" },
    { id: "demo-shift-7", employeeId: DEMO_EMPLOYEE_IDS.marko, dayOffset: 3, weekStart, start: "14:00", end: "22:00", positionId: DEMO_POSITION_IDS.bartender, status: "scheduled" },
    { id: "demo-shift-8", employeeId: DEMO_EMPLOYEE_IDS.luka, dayOffset: 4, weekStart, start: "08:00", end: "16:00", positionId: DEMO_POSITION_IDS.chef, status: "scheduled" },
    { id: "demo-shift-9", employeeId: DEMO_EMPLOYEE_IDS.sara, dayOffset: 4, weekStart, start: "17:00", end: "23:00", positionId: DEMO_POSITION_IDS.host, status: "scheduled" },
    { id: "demo-shift-10", employeeId: DEMO_EMPLOYEE_IDS.nikola, dayOffset: 5, weekStart, start: "10:00", end: "16:00", positionId: DEMO_POSITION_IDS.runner, status: "scheduled" },
    { id: "demo-shift-11", employeeId: DEMO_EMPLOYEE_IDS.ana, dayOffset: 5, weekStart, start: "18:00", end: "23:00", positionId: DEMO_POSITION_IDS.waiter, status: "scheduled" },
    { id: "demo-shift-12", employeeId: DEMO_EMPLOYEE_IDS.marko, dayOffset: 6, weekStart, start: "09:00", end: "15:00", positionId: DEMO_POSITION_IDS.bartender, status: "scheduled" },
    { id: "demo-shift-13", employeeId: DEMO_EMPLOYEE_IDS.luka, dayOffset: 6, weekStart, start: "12:00", end: "20:00", positionId: DEMO_POSITION_IDS.chef, status: "cancelled" },
    { id: "demo-shift-14", employeeId: DEMO_EMPLOYEE_IDS.sara, dayOffset: 3, weekStart, start: "10:00", end: "16:00", positionId: DEMO_POSITION_IDS.host, status: "scheduled" },
    { id: "demo-shift-15", employeeId: DEMO_EMPLOYEE_IDS.ana, dayOffset: 4, weekStart, start: "09:00", end: "13:00", positionId: DEMO_POSITION_IDS.waiter, status: "scheduled" },
    // Previous week (for copy-week demo)
    { id: "demo-shift-prev-1", employeeId: DEMO_EMPLOYEE_IDS.marko, dayOffset: 1, weekStart: prevWeekStart, start: "10:00", end: "18:00", positionId: DEMO_POSITION_IDS.bartender, status: "completed" },
    { id: "demo-shift-prev-2", employeeId: DEMO_EMPLOYEE_IDS.ana, dayOffset: 3, weekStart: prevWeekStart, start: "08:00", end: "14:00", positionId: DEMO_POSITION_IDS.waiter, status: "completed" },
    { id: "demo-shift-prev-3", employeeId: DEMO_EMPLOYEE_IDS.luka, dayOffset: 5, weekStart: prevWeekStart, start: "07:00", end: "15:00", positionId: DEMO_POSITION_IDS.chef, status: "completed" },
  ];

  const shifts: ShiftWithPosition[] = shiftSpecs.map((spec) => ({
    id: spec.id,
    organization_id: DEMO_ORG_ID,
    employee_id: spec.employeeId,
    shift_date: dayOffset(spec.weekStart, spec.dayOffset),
    start_time: spec.start,
    end_time: spec.end,
    position_id: spec.positionId,
    status: spec.status,
    created_at: CREATED_AT,
    position: positionById[spec.positionId]
      ? { id: spec.positionId, name: positionById[spec.positionId].name }
      : null,
  }));

  const requests: RequestWithEmployee[] = [
    {
      id: "demo-req-1",
      employee_id: DEMO_EMPLOYEE_IDS.sara,
      organization_id: DEMO_ORG_ID,
      type: "time_off",
      status: "pending",
      metadata: { date: dayOffset(weekStart, 6), note: "Family event in the afternoon" },
      created_at: "2026-06-02T09:15:00.000Z",
      employees: { first_name: "Sara", last_name: "Ilić" },
    },
    {
      id: "demo-req-2",
      employee_id: DEMO_EMPLOYEE_IDS.marko,
      organization_id: DEMO_ORG_ID,
      type: "swap",
      status: "pending",
      metadata: { shift_id: "demo-shift-7", note: "Need to swap Friday evening shift" },
      created_at: "2026-06-02T11:40:00.000Z",
      employees: { first_name: "Marko", last_name: "Jovanović" },
    },
    {
      id: "demo-req-3",
      employee_id: DEMO_EMPLOYEE_IDS.ana,
      organization_id: DEMO_ORG_ID,
      type: "time_off",
      status: "approved",
      metadata: { date: dayOffset(weekStart, 4), note: "Doctor appointment" },
      created_at: "2026-05-28T14:20:00.000Z",
      employees: { first_name: "Ana", last_name: "Petrović" },
    },
    {
      id: "demo-req-4",
      employee_id: DEMO_EMPLOYEE_IDS.nikola,
      organization_id: DEMO_ORG_ID,
      type: "swap",
      status: "rejected",
      metadata: { shift_id: "demo-shift-5", note: "Could not find coverage" },
      created_at: "2026-05-27T16:05:00.000Z",
      employees: { first_name: "Nikola", last_name: "Savić" },
    },
    {
      id: "demo-req-5",
      employee_id: DEMO_EMPLOYEE_IDS.luka,
      organization_id: DEMO_ORG_ID,
      type: "time_off",
      status: "pending",
      metadata: { date: dayOffset(weekStart, 3), note: "Personal day" },
      created_at: "2026-06-01T08:30:00.000Z",
      employees: { first_name: "Luka", last_name: "Nikolić" },
    },
  ];

  const attendanceLogs: AttendanceLog[] = [
    { id: "demo-att-1", employee_id: DEMO_EMPLOYEE_IDS.ana, organization_id: DEMO_ORG_ID, timestamp: isoAt(today, "08:55"), type: "check_in", notes: null, created_at: isoAt(today, "08:55"), employee: { id: DEMO_EMPLOYEE_IDS.ana, first_name: "Ana", last_name: "Petrović" } },
    { id: "demo-att-2", employee_id: DEMO_EMPLOYEE_IDS.marko, organization_id: DEMO_ORG_ID, timestamp: isoAt(today, "07:58"), type: "check_in", notes: null, created_at: isoAt(today, "07:58"), employee: { id: DEMO_EMPLOYEE_IDS.marko, first_name: "Marko", last_name: "Jovanović" } },
    { id: "demo-att-3", employee_id: DEMO_EMPLOYEE_IDS.marko, organization_id: DEMO_ORG_ID, timestamp: isoAt(today, "14:02"), type: "check_out", notes: null, created_at: isoAt(today, "14:02"), employee: { id: DEMO_EMPLOYEE_IDS.marko, first_name: "Marko", last_name: "Jovanović" } },
    { id: "demo-att-4", employee_id: DEMO_EMPLOYEE_IDS.luka, organization_id: DEMO_ORG_ID, timestamp: isoAt(today, "09:02"), type: "check_in", notes: null, created_at: isoAt(today, "09:02"), employee: { id: DEMO_EMPLOYEE_IDS.luka, first_name: "Luka", last_name: "Nikolić" } },
    { id: "demo-att-5", employee_id: DEMO_EMPLOYEE_IDS.sara, organization_id: DEMO_ORG_ID, timestamp: isoAt(dayOffset(weekStart, 1), "11:58"), type: "check_in", notes: null, created_at: isoAt(dayOffset(weekStart, 1), "11:58"), employee: { id: DEMO_EMPLOYEE_IDS.sara, first_name: "Sara", last_name: "Ilić" } },
    { id: "demo-att-6", employee_id: DEMO_EMPLOYEE_IDS.sara, organization_id: DEMO_ORG_ID, timestamp: isoAt(dayOffset(weekStart, 1), "19:55"), type: "check_out", notes: null, created_at: isoAt(dayOffset(weekStart, 1), "19:55"), employee: { id: DEMO_EMPLOYEE_IDS.sara, first_name: "Sara", last_name: "Ilić" } },
    { id: "demo-att-7", employee_id: DEMO_EMPLOYEE_IDS.ana, organization_id: DEMO_ORG_ID, timestamp: isoAt(dayOffset(weekStart, 0), "08:50"), type: "check_in", notes: null, created_at: isoAt(dayOffset(weekStart, 0), "08:50"), employee: { id: DEMO_EMPLOYEE_IDS.ana, first_name: "Ana", last_name: "Petrović" } },
    { id: "demo-att-8", employee_id: DEMO_EMPLOYEE_IDS.ana, organization_id: DEMO_ORG_ID, timestamp: isoAt(dayOffset(weekStart, 0), "14:05"), type: "check_out", notes: null, created_at: isoAt(dayOffset(weekStart, 0), "14:05"), employee: { id: DEMO_EMPLOYEE_IDS.ana, first_name: "Ana", last_name: "Petrović" } },
  ];

  const notifications: Notification[] = [
    {
      id: "demo-notif-1",
      user_id: DEMO_MANAGER_USER_ID,
      organization_id: DEMO_ORG_ID,
      type: "shift_assigned",
      title: "New shift assigned",
      meta: "Ana Petrović · Fri 18:00–23:00 (Waiter)",
      href: "/shifts",
      unread: true,
      created_at: "2026-06-02T07:30:00.000Z",
    },
    {
      id: "demo-notif-2",
      user_id: DEMO_MANAGER_USER_ID,
      organization_id: DEMO_ORG_ID,
      type: "time_off_approved",
      title: "Request approved",
      meta: "Ana Petrović · time off approved for Thu",
      href: "/requests",
      unread: true,
      created_at: "2026-06-01T15:10:00.000Z",
    },
    {
      id: "demo-notif-3",
      user_id: DEMO_MANAGER_USER_ID,
      organization_id: DEMO_ORG_ID,
      type: "shift_updated",
      title: "Shift updated",
      meta: "Marko Jovanović · Thu 14:00–22:00 moved to Bartender",
      href: "/shifts",
      unread: false,
      created_at: "2026-05-31T18:45:00.000Z",
    },
    {
      id: "demo-notif-4",
      user_id: DEMO_MANAGER_USER_ID,
      organization_id: DEMO_ORG_ID,
      type: "attendance_reminder",
      title: "Attendance reminder",
      meta: "3 employees have not checked in for today's opening shift",
      href: "/attendance",
      unread: true,
      created_at: "2026-06-02T08:00:00.000Z",
    },
    {
      id: "demo-notif-5",
      user_id: DEMO_MANAGER_USER_ID,
      organization_id: DEMO_ORG_ID,
      type: "swap_request",
      title: "New swap request",
      meta: "Marko Jovanović requested a shift swap",
      href: "/requests",
      unread: false,
      created_at: "2026-06-02T11:42:00.000Z",
    },
  ];

  const employeeOverviews: Record<string, EmployeeOverviewData> = {
    [DEMO_EMPLOYEE_IDS.ana]: {
      upcomingShifts: [
        { id: "demo-shift-6", date: dayOffset(weekStart, 2), startTime: "16:00", endTime: "22:00", position: "Waiter" },
        { id: "demo-shift-11", date: dayOffset(weekStart, 5), startTime: "18:00", endTime: "23:00", position: "Waiter" },
      ],
      workedHoursThisMonth: 42.5,
      attendanceHistory: [
        { id: dayOffset(weekStart, 0), date: dayOffset(weekStart, 0), checkIn: "08:50", checkOut: "14:05", hours: 5.25 },
        { id: dayOffset(weekStart, -2), date: dayOffset(weekStart, -2), checkIn: "09:00", checkOut: "15:10", hours: 6.17 },
      ],
      requestHistory: [
        { id: "demo-req-3", type: "time_off", summary: "Time off · Thu", status: "approved", date: "2026-05-28" },
      ],
    },
    [DEMO_EMPLOYEE_IDS.marko]: {
      upcomingShifts: [
        { id: "demo-shift-7", date: dayOffset(weekStart, 3), startTime: "14:00", endTime: "22:00", position: "Bartender" },
        { id: "demo-shift-12", date: dayOffset(weekStart, 6), startTime: "09:00", endTime: "15:00", position: "Bartender" },
      ],
      workedHoursThisMonth: 38,
      attendanceHistory: [
        { id: today, date: today, checkIn: "07:58", checkOut: "14:02", hours: 6.07 },
      ],
      requestHistory: [
        { id: "demo-req-2", type: "swap", summary: "Shift swap · Friday evening", status: "pending", date: "2026-06-02" },
      ],
    },
    [DEMO_EMPLOYEE_IDS.luka]: {
      upcomingShifts: [
        { id: "demo-shift-8", date: dayOffset(weekStart, 4), startTime: "08:00", endTime: "16:00", position: "Chef" },
      ],
      workedHoursThisMonth: 36.5,
      attendanceHistory: [
        { id: today, date: today, checkIn: "09:02", checkOut: "—", hours: 0 },
        { id: dayOffset(weekStart, 1), date: dayOffset(weekStart, 1), checkIn: "06:55", checkOut: "15:05", hours: 8.17 },
      ],
      requestHistory: [
        { id: "demo-req-5", type: "time_off", summary: "Time off · Wed", status: "pending", date: "2026-06-01" },
      ],
    },
    [DEMO_EMPLOYEE_IDS.sara]: {
      upcomingShifts: [
        { id: "demo-shift-4", date: dayOffset(weekStart, 1), startTime: "12:00", endTime: "20:00", position: "Host" },
        { id: "demo-shift-9", date: dayOffset(weekStart, 4), startTime: "17:00", endTime: "23:00", position: "Host" },
      ],
      workedHoursThisMonth: 40,
      attendanceHistory: [
        { id: dayOffset(weekStart, 1), date: dayOffset(weekStart, 1), checkIn: "11:58", checkOut: "19:55", hours: 7.95 },
      ],
      requestHistory: [
        { id: "demo-req-1", type: "time_off", summary: "Time off · Sun", status: "pending", date: "2026-06-02" },
      ],
    },
    [DEMO_EMPLOYEE_IDS.nikola]: {
      upcomingShifts: [
        { id: "demo-shift-5", date: dayOffset(weekStart, 2), startTime: "11:00", endTime: "17:00", position: "Runner" },
        { id: "demo-shift-10", date: dayOffset(weekStart, 5), startTime: "10:00", endTime: "16:00", position: "Runner" },
      ],
      workedHoursThisMonth: 24,
      attendanceHistory: [
        { id: dayOffset(weekStart, -1), date: dayOffset(weekStart, -1), checkIn: "10:05", checkOut: "16:00", hours: 5.92 },
      ],
      requestHistory: [
        { id: "demo-req-4", type: "swap", summary: "Shift swap · coverage issue", status: "rejected", date: "2026-05-27" },
      ],
    },
  };

  return {
    positions,
    employees,
    shifts,
    requests,
    notifications,
    attendanceLogs,
    employeeOverviews,
  };
}

export function getDemoTodayShifts(dataset: DemoDataset): TodayShift[] {
  const today = toDateKey(new Date());
  const checkedIn = new Set(
    dataset.attendanceLogs
      .filter((log) => log.timestamp.startsWith(today) && log.type === "check_in")
      .map((log) => log.employee_id),
  );

  const employeeById = Object.fromEntries(
    dataset.employees.map((e) => [e.id, e]),
  );

  return dataset.shifts
    .filter((s) => s.shift_date === today && s.status !== "cancelled")
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .map((shift) => {
      const emp = employeeById[shift.employee_id];
      return {
        id: shift.id,
        employeeId: shift.employee_id,
        startTime: shift.start_time,
        endTime: shift.end_time,
        employeeName: emp ? `${emp.first_name} ${emp.last_name}` : "—",
        position: shift.position?.name ?? "—",
        checkedIn: checkedIn.has(shift.employee_id),
      };
    });
}

export function getWeekDateRange(weekStart: Date): { startKey: string; endKey: string } {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return { startKey: toDateKey(weekStart), endKey: toDateKey(weekEnd) };
}

export function filterDemoWeekShifts(
  shifts: ShiftWithPosition[],
  weekStart: Date,
): ShiftWithPosition[] {
  const { startKey, endKey } = getWeekDateRange(weekStart);
  return shifts.filter((s) => s.shift_date >= startKey && s.shift_date <= endKey);
}
