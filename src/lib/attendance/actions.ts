"use server";

import { revalidatePath } from "next/cache";

import { isNotFoundError, requireOrgOwner } from "@/lib/auth/guards";
import type {
  CreateAttendanceLogInput,
  UpdateAttendanceLogInput,
} from "@/types/attendance";

export type AttendanceActionResult = {
  error?: string;
  success?: boolean;
};

export async function createAttendanceLog(
  input: CreateAttendanceLogInput,
): Promise<AttendanceActionResult> {
  const ctx = await requireOrgOwner(
    "Only the organization owner can add attendance logs.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  if (!input.employee_id?.trim()) {
    return { error: "Employee is required." };
  }
  if (!input.timestamp?.trim()) {
    return { error: "Timestamp is required." };
  }

  const parsed = new Date(input.timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "Invalid timestamp." };
  }

  const { count, error: empError } = await ctx.supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("id", input.employee_id)
    .eq("organization_id", ctx.organizationId);

  if (empError) {
    return { error: empError.message };
  }
  if (!count) {
    return { error: "Employee not found." };
  }

  const { error } = await ctx.supabase.from("attendance_logs").insert({
    organization_id: ctx.organizationId,
    employee_id: input.employee_id,
    type: input.type,
    timestamp: parsed.toISOString(),
    notes: input.notes?.trim() ? input.notes.trim() : null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/attendance");
  revalidatePath("/employees");
  return { success: true };
}

export async function updateAttendanceLog(
  input: UpdateAttendanceLogInput,
): Promise<AttendanceActionResult> {
  const ctx = await requireOrgOwner(
    "Only the organization owner can edit attendance logs.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  if (!input.id?.trim()) {
    return { error: "Attendance log not found." };
  }
  if (!input.timestamp?.trim()) {
    return { error: "Timestamp is required." };
  }

  const parsed = new Date(input.timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "Invalid timestamp." };
  }

  const { error } = await ctx.supabase
    .from("attendance_logs")
    .update({
      timestamp: parsed.toISOString(),
      notes: input.notes?.trim() ? input.notes.trim() : null,
    })
    .eq("id", input.id)
    .eq("organization_id", ctx.organizationId);

  if (error) {
    if (isNotFoundError(error)) {
      return { error: "Attendance log not found." };
    }
    return { error: error.message };
  }

  revalidatePath("/attendance");
  revalidatePath("/employees");
  return { success: true };
}
