import { formatTimeFromDb } from "@/lib/shifts/utils";
import { formatFullDate } from "@/lib/week-utils";

export function buildShiftNotificationMeta(
  shiftDate: string,
  startTime: string,
  endTime: string,
  positionName?: string | null,
): string {
  const dateLabel = formatFullDate(new Date(`${shiftDate}T12:00:00`));
  const start = formatTimeFromDb(startTime);
  const end = formatTimeFromDb(endTime);
  const positionPart = positionName ? ` · ${positionName}` : "";
  return `${dateLabel}, ${start}–${end}${positionPart}`;
}
