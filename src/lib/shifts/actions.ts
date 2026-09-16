"use server";

import { revalidatePath } from "next/cache";

import { isNotFoundError, requireOrgStaff } from "@/lib/auth/guards";
import { isDemoMode } from "@/lib/demo/config";
import { copyDemoPreviousWeek, createDemoShifts } from "@/lib/demo/store";
import {
  getProfileIdForEmployee,
  notifyUsers,
} from "@/lib/notifications/notify";
import { buildShiftNotificationMeta } from "@/lib/shifts/notification-messages";
import { formatTimeForDb, mapShiftRow, SHIFT_SELECT } from "@/lib/shifts/utils";
import { addWeeks, toDateKey } from "@/lib/week-utils";
import type { NotificationType } from "@/types/notifications";
import type {
  CreateShiftInput,
  ShiftWithPosition,
  UpdateShiftInput,
} from "@/types/shifts";

export type ShiftActionResult = {
  error?: string;
  success?: boolean;
  shift?: ShiftWithPosition;
};

export type CreateShiftsResult = {
  error?: string;
  success?: boolean;
  shifts?: ShiftWithPosition[];
  createdCount?: number;
};

export type CopyPreviousWeekResult =
  | { success: true; copiedCount: number }
  | { success: false; error: string; code?: "already_copied" | "no_source" };

function getWeekDateRange(weekStart: Date): { startKey: string; endKey: string } {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return { startKey: toDateKey(weekStart), endKey: toDateKey(weekEnd) };
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function isDuplicateShift(
  existing: {
    employee_id: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    position_id: string | null;
  },
  candidate: {
    employee_id: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    position_id: string | null;
  },
): boolean {
  return (
    existing.employee_id === candidate.employee_id &&
    existing.shift_date === candidate.shift_date &&
    existing.start_time === candidate.start_time &&
    existing.end_time === candidate.end_time &&
    existing.position_id === candidate.position_id
  );
}

async function notifyShiftEmployee(
  shift: ShiftWithPosition,
  organizationId: string,
  type: NotificationType,
  title: string,
): Promise<void> {
  const userId = await getProfileIdForEmployee(shift.employee_id);
  if (!userId) return;

  await notifyUsers([userId], organizationId, {
    type,
    title,
    meta: buildShiftNotificationMeta(
      shift.shift_date,
      shift.start_time,
      shift.end_time,
      shift.position?.name ?? null,
    ),
    href: "/shifts",
  });
}

export async function createShift(
  input: CreateShiftInput,
): Promise<ShiftActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage shifts.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const { data, error } = await ctx.supabase
    .from("shifts")
    .insert({
      organization_id: ctx.organizationId,
      employee_id: input.employee_id,
      shift_date: input.shift_date,
      start_time: formatTimeForDb(input.start_time),
      end_time: formatTimeForDb(input.end_time),
      position_id: input.position_id,
      status: input.status ?? "scheduled",
    })
    .select(SHIFT_SELECT)
    .single();

  if (error) {
    return { error: error.message };
  }

  const shift = mapShiftRow(data as Record<string, unknown>);
  await notifyShiftEmployee(
    shift,
    ctx.organizationId,
    "shift_assigned",
    "New shift assigned",
  );

  revalidatePath("/shifts");
  revalidatePath("/dashboard");
  return { success: true, shift };
}

export async function createShifts(
  inputs: CreateShiftInput[],
): Promise<CreateShiftsResult> {
  if (inputs.length === 0) {
    return { error: "No shifts to create." };
  }

  if (isDemoMode()) {
    const shifts = createDemoShifts(inputs);
    revalidatePath("/shifts");
    revalidatePath("/dashboard");
    return { success: true, shifts, createdCount: shifts.length };
  }

  const ctx = await requireOrgStaff(
    "You do not have permission to manage shifts.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const rows = inputs.map((input) => ({
    organization_id: ctx.organizationId!,
    employee_id: input.employee_id,
    shift_date: input.shift_date,
    start_time: formatTimeForDb(input.start_time),
    end_time: formatTimeForDb(input.end_time),
    position_id: input.position_id,
    status: input.status ?? "scheduled",
  }));

  const { data, error } = await ctx.supabase
    .from("shifts")
    .insert(rows)
    .select(SHIFT_SELECT);

  if (error) {
    return { error: error.message };
  }

  const shifts = (data ?? []).map((row) =>
    mapShiftRow(row as Record<string, unknown>),
  );

  for (const shift of shifts) {
    await notifyShiftEmployee(
      shift,
      ctx.organizationId,
      "shift_assigned",
      "New shift assigned",
    );
  }

  revalidatePath("/shifts");
  revalidatePath("/dashboard");
  return { success: true, shifts, createdCount: shifts.length };
}

export async function updateShift(
  shiftId: string,
  input: UpdateShiftInput,
): Promise<ShiftActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage shifts.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const updates: Record<string, unknown> = {};
  if (input.employee_id !== undefined) updates.employee_id = input.employee_id;
  if (input.shift_date !== undefined) updates.shift_date = input.shift_date;
  if (input.start_time !== undefined) {
    updates.start_time = formatTimeForDb(input.start_time);
  }
  if (input.end_time !== undefined) {
    updates.end_time = formatTimeForDb(input.end_time);
  }
  if (input.position_id !== undefined) updates.position_id = input.position_id;
  if (input.status !== undefined) updates.status = input.status;

  const { data, error } = await ctx.supabase
    .from("shifts")
    .update(updates)
    .eq("id", shiftId)
    .eq("organization_id", ctx.organizationId)
    .select(SHIFT_SELECT)
    .single();

  if (isNotFoundError(error)) {
    return { error: "Shift not found." };
  }

  if (error) {
    return { error: error.message };
  }

  const shift = mapShiftRow(data as Record<string, unknown>);
  const isCancelled = shift.status === "cancelled";
  await notifyShiftEmployee(
    shift,
    ctx.organizationId,
    isCancelled ? "shift_cancelled" : "shift_updated",
    isCancelled ? "Shift cancelled" : "Shift updated",
  );

  revalidatePath("/shifts");
  revalidatePath("/dashboard");
  return { success: true, shift };
}

export async function deleteShift(shiftId: string): Promise<ShiftActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage shifts.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const { data: deleted, error } = await ctx.supabase
    .from("shifts")
    .delete()
    .eq("id", shiftId)
    .eq("organization_id", ctx.organizationId)
    .select(SHIFT_SELECT)
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!deleted) {
    return { error: "Shift not found." };
  }

  const shift = mapShiftRow(deleted as Record<string, unknown>);
  await notifyShiftEmployee(
    shift,
    ctx.organizationId,
    "shift_cancelled",
    "Shift removed",
  );

  revalidatePath("/shifts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function copyPreviousWeekAction(
  targetWeekStartIso: string,
): Promise<CopyPreviousWeekResult> {
  if (isDemoMode()) {
    const result = copyDemoPreviousWeek(targetWeekStartIso);
    if (!result.success) {
      return {
        success: false,
        error: result.error ?? "Failed to copy week.",
        code: result.code,
      };
    }
    revalidatePath("/shifts");
    revalidatePath("/dashboard");
    return { success: true, copiedCount: result.copiedCount ?? 0 };
  }

  const ctx = await requireOrgStaff(
    "You do not have permission to manage shifts.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { success: false, error: ctx.error ?? "Unauthorized." };
  }

  const targetWeekStart = new Date(`${targetWeekStartIso}T12:00:00`);
  const previousWeekStart = addWeeks(targetWeekStart, -1);
  const previousRange = getWeekDateRange(previousWeekStart);
  const targetRange = getWeekDateRange(targetWeekStart);

  const { data: previousShifts, error: fetchError } = await ctx.supabase
    .from("shifts")
    .select(
      "employee_id, shift_date, start_time, end_time, position_id, status",
    )
    .eq("organization_id", ctx.organizationId)
    .gte("shift_date", previousRange.startKey)
    .lte("shift_date", previousRange.endKey)
    .in("status", ["scheduled", "completed"]);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!previousShifts?.length) {
    return {
      success: false,
      code: "no_source",
      error: "No shifts found in the previous week",
    };
  }

  const { data: targetShifts, error: targetError } = await ctx.supabase
    .from("shifts")
    .select("employee_id, shift_date, start_time, end_time, position_id")
    .eq("organization_id", ctx.organizationId)
    .gte("shift_date", targetRange.startKey)
    .lte("shift_date", targetRange.endKey);

  if (targetError) {
    return { success: false, error: targetError.message };
  }

  const existingTarget = targetShifts ?? [];
  const toInsert: {
    organization_id: string;
    employee_id: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    position_id: string | null;
    status: string;
  }[] = [];

  for (const shift of previousShifts) {
    const targetDate = addDaysToDateKey(shift.shift_date as string, 7);
    const candidate = {
      employee_id: shift.employee_id as string,
      shift_date: targetDate,
      start_time: shift.start_time as string,
      end_time: shift.end_time as string,
      position_id: (shift.position_id as string | null) ?? null,
    };

    const duplicate = [...existingTarget, ...toInsert].some((existing) =>
      isDuplicateShift(existing, candidate),
    );

    if (duplicate) continue;

    toInsert.push({
      organization_id: ctx.organizationId,
      ...candidate,
      status: "scheduled",
    });
  }

  if (toInsert.length === 0) {
    return {
      success: false,
      code: "already_copied",
      error: "This week has already been copied",
    };
  }

  const { error: insertError } = await ctx.supabase
    .from("shifts")
    .insert(toInsert);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath("/shifts");
  revalidatePath("/dashboard");
  return { success: true, copiedCount: toInsert.length };
}
