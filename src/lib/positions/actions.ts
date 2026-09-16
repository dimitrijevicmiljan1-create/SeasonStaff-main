"use server";

import { revalidatePath } from "next/cache";

import { isNotFoundError, requireOrgStaff } from "@/lib/auth/guards";

export type PositionActionResult = {
  error?: string;
  success?: boolean;
  positionId?: string;
};

function formatPositionError(message: string): string {
  if (message.includes("uq_positions_org_name")) {
    return "A position with this name already exists.";
  }
  return message;
}

export async function createPosition(name: string): Promise<PositionActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage positions.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Position name is required." };
  }

  const { data, error } = await ctx.supabase
    .from("positions")
    .insert({
      organization_id: ctx.organizationId,
      name: trimmed,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: formatPositionError(error?.message ?? "Failed to create position.") };
  }

  revalidatePath("/settings");
  revalidatePath("/employees");
  return { success: true, positionId: data.id };
}

export async function updatePosition(
  positionId: string,
  name: string,
): Promise<PositionActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage positions.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Position name is required." };
  }

  const { error } = await ctx.supabase
    .from("positions")
    .update({ name: trimmed })
    .eq("id", positionId)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();

  if (isNotFoundError(error)) {
    return { error: "Position not found." };
  }

  if (error) {
    return { error: formatPositionError(error.message) };
  }

  revalidatePath("/settings");
  revalidatePath("/employees");
  return { success: true, positionId };
}

export async function deletePosition(
  positionId: string,
): Promise<PositionActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage positions.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const { count, error: countError } = await ctx.supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("position_id", positionId)
    .eq("organization_id", ctx.organizationId);

  if (countError) {
    return { error: countError.message };
  }

  if ((count ?? 0) > 0) {
    return {
      error: "Cannot delete a position that is assigned to employees.",
    };
  }

  const { count: shiftCount, error: shiftCountError } = await ctx.supabase
    .from("shifts")
    .select("id", { count: "exact", head: true })
    .eq("position_id", positionId)
    .eq("organization_id", ctx.organizationId);

  if (shiftCountError) {
    return { error: shiftCountError.message };
  }

  if ((shiftCount ?? 0) > 0) {
    return {
      error: "Cannot delete a position that is used on shifts.",
    };
  }

  const { error } = await ctx.supabase
    .from("positions")
    .delete()
    .eq("id", positionId)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();

  if (isNotFoundError(error)) {
    return { error: "Position not found." };
  }

  if (error) {
    return { error: formatPositionError(error.message) };
  }

  revalidatePath("/settings");
  revalidatePath("/employees");
  return { success: true, positionId };
}
