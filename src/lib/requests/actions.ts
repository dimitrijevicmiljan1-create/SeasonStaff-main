"use server";

import { revalidatePath } from "next/cache";

import { isNotFoundError, requireOrgMember, requireOrgStaff } from "@/lib/auth/guards";
import { isDemoMode } from "@/lib/demo/config";
import { getDemoRequestListItems, updateDemoRequestStatus } from "@/lib/demo/store";
import { getEmployeeFullName } from "@/lib/employees/utils";
import {
  loadShiftPreviewsForRequests,
  mapRequestRow,
  REQUEST_SELECT,
  toRequestListItem,
} from "@/lib/requests/utils";
import {
  getManagerUserIds,
  getProfileIdForEmployee,
  notifyUsers,
} from "@/lib/notifications/notify";
import { formatTimeFromDb } from "@/lib/shifts/utils";
import { formatFullDate, toDateKey } from "@/lib/week-utils";
import type { NotificationType } from "@/types/notifications";
import type {
  CreateRequestInput,
  RequestListItem,
  RequestType,
} from "@/types/requests";

export type RequestActionResult = {
  error?: string;
  success?: boolean;
  request?: RequestListItem;
};

function requestCreatedNotificationType(type: RequestType): NotificationType {
  return type === "swap" ? "swap_request" : "time_off_request";
}

function requestResolvedNotificationType(
  type: RequestType,
  approved: boolean,
): NotificationType {
  if (type === "swap") {
    return approved ? "swap_approved" : "swap_rejected";
  }
  return approved ? "time_off_approved" : "time_off_rejected";
}

export async function createRequest(
  input: CreateRequestInput,
): Promise<RequestActionResult> {
  const ctx = await requireOrgMember(
    "Only employees can submit requests.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId || !ctx.employeeId) {
    return { error: ctx.error ?? "Unauthorized." };
  }
  if (ctx.role !== "employee") {
    return { error: "Only employees can submit requests." };
  }

  let metadata: Record<string, unknown>;

  if (input.type === "swap") {
    if (!input.shift_id?.trim()) {
      return { error: "Please select a shift." };
    }

    const { data: shift, error: shiftError } = await ctx.supabase
      .from("shifts")
      .select("id, employee_id, shift_date")
      .eq("id", input.shift_id)
      .eq("employee_id", ctx.employeeId)
      .maybeSingle();

    if (shiftError || !shift) {
      return { error: "Selected shift was not found." };
    }

    const today = toDateKey(new Date());
    if (String(shift.shift_date) < today) {
      return { error: "You can only request swaps for upcoming shifts." };
    }

    metadata = {
      shift_id: input.shift_id,
      ...(input.note?.trim() ? { note: input.note.trim() } : {}),
    };
  } else {
    if (!input.date?.trim()) {
      return { error: "Please select a date." };
    }

    const today = toDateKey(new Date());
    if (input.date < today) {
      return { error: "You can only request time off for future dates." };
    }

    metadata = {
      date: input.date,
      ...(input.note?.trim() ? { note: input.note.trim() } : {}),
    };
  }

  const { data, error } = await ctx.supabase
    .from("requests")
    .insert({
      employee_id: ctx.employeeId,
      organization_id: ctx.organizationId,
      type: input.type,
      status: "pending",
      metadata,
    })
    .select(REQUEST_SELECT)
    .single();

  if (error) {
    return { error: error.message };
  }

  const mapped = mapRequestRow(data as Record<string, unknown>);
  const shiftById = await loadShiftPreviewsForRequests(ctx.supabase, [mapped]);
  const listItem = toRequestListItem(mapped, shiftById);

  const employeeName = getEmployeeFullName(mapped.employees);
  const managerIds = await getManagerUserIds(ctx.organizationId);
  await notifyUsers(managerIds, ctx.organizationId, {
    type: requestCreatedNotificationType(input.type),
    title:
      input.type === "swap"
        ? `Swap request from ${employeeName}`
        : `Time off request from ${employeeName}`,
    meta: listItem.details,
  });

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  return { success: true, request: listItem };
}

export async function approveRequest(
  requestId: string,
): Promise<RequestActionResult> {
  return updateRequestStatus(requestId, "approved");
}

export async function rejectRequest(
  requestId: string,
): Promise<RequestActionResult> {
  return updateRequestStatus(requestId, "rejected");
}

async function updateRequestStatus(
  requestId: string,
  status: "approved" | "rejected",
): Promise<RequestActionResult> {
  if (isDemoMode()) {
    const existing = getDemoRequestListItems().find((r) => r.id === requestId);
    if (!existing) {
      return { error: "Request not found." };
    }
    if (existing.status !== "pending") {
      return { error: "This request has already been reviewed." };
    }
    updateDemoRequestStatus(requestId, status);
    const updated = getDemoRequestListItems().find((r) => r.id === requestId);
    revalidatePath("/requests");
    revalidatePath("/dashboard");
    return { success: true, request: updated };
  }

  const ctx = await requireOrgStaff(
    "You do not have permission to manage requests.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const { data: existing, error: fetchError } = await ctx.supabase
    .from("requests")
    .select("id, status, type, employee_id, organization_id")
    .eq("id", requestId)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Request not found." };
  }
  if (existing.status !== "pending") {
    return { error: "This request has already been reviewed." };
  }

  const { data, error } = await ctx.supabase
    .from("requests")
    .update({ status })
    .eq("id", requestId)
    .select(REQUEST_SELECT)
    .single();

  if (error) {
    if (isNotFoundError(error)) {
      return { error: "Request not found." };
    }
    return { error: error.message };
  }

  const mapped = mapRequestRow(data as Record<string, unknown>);
  const shiftById = await loadShiftPreviewsForRequests(ctx.supabase, [mapped]);
  const listItem = toRequestListItem(mapped, shiftById);

  const employeeUserId = await getProfileIdForEmployee(
    String(existing.employee_id),
  );
  if (employeeUserId) {
    const approved = status === "approved";
    await notifyUsers([employeeUserId], ctx.organizationId, {
      type: requestResolvedNotificationType(
        existing.type as RequestType,
        approved,
      ),
      title: approved ? "Request approved" : "Request rejected",
      meta: listItem.details,
    });
  }

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  return { success: true, request: listItem };
}

export interface EmployeeShiftOption {
  id: string;
  label: string;
  shift_date: string;
}

export async function getEmployeeUpcomingShifts(): Promise<{
  error?: string;
  shifts?: EmployeeShiftOption[];
}> {
  const ctx = await requireOrgMember();
  if (ctx.error || !ctx.supabase || !ctx.employeeId) {
    return { error: ctx.error ?? "Unauthorized." };
  }
  if (ctx.role !== "employee") {
    return { shifts: [] };
  }

  const today = toDateKey(new Date());
  const { data, error } = await ctx.supabase
    .from("shifts")
    .select(
      "id, shift_date, start_time, end_time, positions ( name )",
    )
    .eq("employee_id", ctx.employeeId)
    .gte("shift_date", today)
    .order("shift_date")
    .order("start_time");

  if (error) {
    return { error: error.message };
  }

  const shifts: EmployeeShiftOption[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const positionsRaw = r.positions;
    const positionName =
      positionsRaw && typeof positionsRaw === "object"
        ? String((positionsRaw as { name: string }).name)
        : "";
    const dateLabel = formatFullDate(
      new Date(String(r.shift_date) + "T12:00:00"),
    );
    const start = formatTimeFromDb(String(r.start_time));
    const end = formatTimeFromDb(String(r.end_time));
    const positionPart = positionName ? ` · ${positionName}` : "";
    return {
      id: String(r.id),
      shift_date: String(r.shift_date),
      label: `${dateLabel} ${start}–${end}${positionPart}`,
    };
  });

  return { shifts };
}
