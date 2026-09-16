import { isDemoMode } from "@/lib/demo/config";
import { getDemoWeekShifts } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/client";
import { mapShiftRow, SHIFT_SELECT } from "@/lib/shifts/utils";
import type { ShiftWithPosition } from "@/types/shifts";
import { toDateKey } from "@/lib/week-utils";

export const shiftsQueryKey = (organizationId: string, weekStartKey: string) =>
  ["shifts", organizationId, weekStartKey] as const;

function getWeekEndKey(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return toDateKey(weekEnd);
}

export async function fetchWeekShifts(
  organizationId: string,
  weekStart: Date,
): Promise<ShiftWithPosition[]> {
  if (isDemoMode()) {
    return getDemoWeekShifts(weekStart);
  }

  const supabase = createClient();
  const startKey = toDateKey(weekStart);
  const endKey = getWeekEndKey(weekStart);

  const { data, error } = await supabase
    .from("shifts")
    .select(SHIFT_SELECT)
    .eq("organization_id", organizationId)
    .gte("shift_date", startKey)
    .lte("shift_date", endKey)
    .order("shift_date")
    .order("start_time");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapShiftRow(row as Record<string, unknown>));
}
