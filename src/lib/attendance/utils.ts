import type {
  AttendanceDaySummary,
  AttendanceLog,
  AttendanceLogType,
} from "@/types/attendance";

export const ATTENDANCE_LOG_SELECT = `
  id,
  employee_id,
  organization_id,
  timestamp,
  type,
  notes,
  created_at,
  employee:employees(id, first_name, last_name)
`;

type AttendanceLogRowInput = Omit<AttendanceLog, "employee"> & {
  employee?:
    | AttendanceLog["employee"]
    | AttendanceLog["employee"][]
    | null;
};

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapAttendanceLogRow(
  row: AttendanceLogRowInput,
): AttendanceLog {
  return {
    id: row.id,
    employee_id: row.employee_id,
    organization_id: row.organization_id,
    timestamp: row.timestamp,
    type: row.type,
    notes: row.notes,
    created_at: row.created_at,
    employee: normalizeRelation(row.employee) ?? undefined,
  };
}

function toDateKeyFromTimestamp(timestamp: string): string {
  const d = new Date(timestamp);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** MVP: display times in UTC; user timezone localization is deferred. */
function formatClockTime(timestamp: string): string {
  const d = new Date(timestamp);
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function hoursBetween(start: string, end: string): number {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (endMs <= startMs) return 0;
  return (endMs - startMs) / (1000 * 60 * 60);
}

export function buildAttendanceDaySummaries(
  logs: Pick<AttendanceLog, "id" | "timestamp" | "type">[],
): AttendanceDaySummary[] {
  const byDate = new Map<string, { checkIns: string[]; checkOuts: string[] }>();

  for (const log of logs) {
    const dateKey = toDateKeyFromTimestamp(log.timestamp);
    const bucket = byDate.get(dateKey) ?? { checkIns: [], checkOuts: [] };
    if (log.type === "check_in") {
      bucket.checkIns.push(log.timestamp);
    } else {
      bucket.checkOuts.push(log.timestamp);
    }
    byDate.set(dateKey, bucket);
  }

  const summaries: AttendanceDaySummary[] = [];

  for (const [date, bucket] of byDate.entries()) {
    bucket.checkIns.sort();
    bucket.checkOuts.sort();

    const checkIn = bucket.checkIns[0] ?? null;
    const checkOut = bucket.checkOuts.find(
      (out) => !checkIn || new Date(out).getTime() > new Date(checkIn).getTime(),
    ) ?? bucket.checkOuts[0] ?? null;

    const hours =
      checkIn && checkOut ? hoursBetween(checkIn, checkOut) : 0;

    summaries.push({
      date,
      checkIn: checkIn ? formatClockTime(checkIn) : null,
      checkOut: checkOut ? formatClockTime(checkOut) : null,
      hours: Math.round(hours * 10) / 10,
    });
  }

  return summaries.sort((a, b) => b.date.localeCompare(a.date));
}

export function sumWorkedHours(summaries: AttendanceDaySummary[]): number {
  const total = summaries.reduce((acc, day) => acc + day.hours, 0);
  return Math.round(total * 10) / 10;
}

export function getMonthRange(date = new Date()): {
  dateFrom: string;
  dateTo: string;
} {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const toKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return { dateFrom: toKey(first), dateTo: toKey(last) };
}

export function formatAttendanceType(type: AttendanceLogType): string {
  return type === "check_in" ? "Check in" : "Check out";
}

export function formatAttendanceTimestamp(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
