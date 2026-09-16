"use server";

import { revalidatePath } from "next/cache";

import { isNotFoundError, requireOrgStaff } from "@/lib/auth/guards";
import { fetchEmployeeOverview } from "@/lib/employees/queries.server";
import type { EmployeeOverviewData } from "@/types/employees";
import { getOrganizationSubscription } from "@/lib/billing/queries";
import { isUnlimitedEmployeeLimit } from "@/lib/billing/plan-definitions";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import type {
  CreateEmployeeInput,
  EmployeeStatus,
  UpdateEmployeeInput,
} from "@/types/employees";

export type EmployeeActionResult = {
  error?: string;
  success?: boolean;
  employeeId?: string;
};

function formatEmployeeError(message: string): string {
  if (message.includes("uq_employees_org_email")) {
    return "An employee with this email already exists in your organization.";
  }
  if (message.includes("uq_positions_org_name")) {
    return "A position with this name already exists.";
  }
  return message;
}

async function sendEmployeeInvite(
  email: string,
  organizationId: string,
  employeeId: string,
  firstName: string,
  lastName: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const siteUrl = getSiteUrl();

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm`,
    data: {
      organization_id: organizationId,
      employee_id: employeeId,
      role: "employee",
      first_name: firstName,
      last_name: lastName,
    },
  });

  if (error) {
    return error.message;
  }

  return null;
}

async function expirePendingInvites(
  supabase: NonNullable<Awaited<ReturnType<typeof requireOrgStaff>>["supabase"]>,
  employeeId: string,
  organizationId: string,
): Promise<string | null> {
  const { error } = await supabase
    .from("employee_invites")
    .update({ expires_at: new Date().toISOString() })
    .eq("employee_id", employeeId)
    .eq("organization_id", organizationId)
    .is("accepted_at", null);

  if (error) {
    return error.message;
  }

  return null;
}

async function insertInviteRow(
  supabase: NonNullable<Awaited<ReturnType<typeof requireOrgStaff>>["supabase"]>,
  organizationId: string,
  employeeId: string,
  email: string,
): Promise<string | null> {
  const { error } = await supabase.from("employee_invites").insert({
    organization_id: organizationId,
    employee_id: employeeId,
    email,
  });

  if (error) {
    return formatEmployeeError(error.message);
  }

  return null;
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<EmployeeActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage employees.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const email = input.email.trim().toLowerCase();
  const firstName = input.first_name.trim();
  const lastName = input.last_name.trim();

  if (!firstName || !lastName || !email) {
    return { error: "First name, last name, and email are required." };
  }

  const { count: activeCount, error: countError } = await ctx.supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", ctx.organizationId)
    .eq("status", "active");

  if (countError) {
    return { error: countError.message };
  }

  const subscription = await getOrganizationSubscription(ctx.organizationId);
  const limit = subscription?.employee_limit;

  if (
    limit !== undefined &&
    limit !== null &&
    !isUnlimitedEmployeeLimit(limit) &&
    (activeCount ?? 0) >= limit
  ) {
    return {
      error:
        "Dostigli ste maksimalan broj zaposlenih za trenutni paket.",
    };
  }

  const { data: employee, error: insertError } = await ctx.supabase
    .from("employees")
    .insert({
      organization_id: ctx.organizationId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: input.phone?.trim() || null,
      position_id: input.position_id || null,
      status: input.status ?? "active",
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (insertError || !employee) {
    return {
      error: formatEmployeeError(
        insertError?.message ?? "Failed to create employee.",
      ),
    };
  }

  const emailError = await sendEmployeeInvite(
    email,
    ctx.organizationId,
    employee.id,
    firstName,
    lastName,
  );

  if (emailError) {
    await ctx.supabase.from("employees").delete().eq("id", employee.id);
    return { error: `Failed to send invitation: ${emailError}` };
  }

  const inviteRowError = await insertInviteRow(
    ctx.supabase,
    ctx.organizationId,
    employee.id,
    email,
  );

  if (inviteRowError) {
    return {
      error: `Employee created but invite record failed: ${inviteRowError}. Use resend invitation.`,
      employeeId: employee.id,
    };
  }

  revalidatePath("/employees");
  return { success: true, employeeId: employee.id };
}

export async function updateEmployee(
  employeeId: string,
  input: UpdateEmployeeInput,
): Promise<EmployeeActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage employees.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const updates: Record<string, unknown> = {};

  if (input.first_name !== undefined) updates.first_name = input.first_name.trim();
  if (input.last_name !== undefined) updates.last_name = input.last_name.trim();
  if (input.email !== undefined) updates.email = input.email.trim().toLowerCase();
  if (input.phone !== undefined) updates.phone = input.phone?.trim() || null;
  if (input.position_id !== undefined) updates.position_id = input.position_id;
  if (input.status !== undefined) updates.status = input.status;
  if (input.notes !== undefined) updates.notes = input.notes?.trim() || null;

  const { error } = await ctx.supabase
    .from("employees")
    .update(updates)
    .eq("id", employeeId)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();

  if (isNotFoundError(error)) {
    return { error: "Employee not found." };
  }

  if (error) {
    return { error: formatEmployeeError(error.message) };
  }

  revalidatePath("/employees");
  return { success: true, employeeId };
}

export async function changeEmployeeStatus(
  employeeId: string,
  status: EmployeeStatus,
): Promise<EmployeeActionResult> {
  return updateEmployee(employeeId, { status });
}

export async function resendInvite(employeeId: string): Promise<EmployeeActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage employees.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const { data: employee, error: fetchError } = await ctx.supabase
    .from("employees")
    .select("id, email, first_name, last_name, profile_id")
    .eq("id", employeeId)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (fetchError || !employee) {
    return { error: fetchError?.message ?? "Employee not found." };
  }

  if (employee.profile_id) {
    return { error: "This employee has already activated their account." };
  }

  const admin = createAdminClient();
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === employee.email);
  if (existing) {
    await admin.auth.admin.deleteUser(existing.id);
    await ctx.supabase
      .from("employees")
      .update({ profile_id: null })
      .eq("id", employee.id);
  }

  const expireError = await expirePendingInvites(
    ctx.supabase,
    employee.id,
    ctx.organizationId,
  );

  if (expireError) {
    return { error: formatEmployeeError(expireError) };
  }

  const emailError = await sendEmployeeInvite(
    employee.email,
    ctx.organizationId,
    employee.id,
    employee.first_name,
    employee.last_name,
  );

  if (emailError) {
    return { error: `Failed to send invitation: ${emailError}` };
  }

  const inviteRowError = await insertInviteRow(
    ctx.supabase,
    ctx.organizationId,
    employee.id,
    employee.email,
  );

  if (inviteRowError) {
    return { error: inviteRowError };
  }

  revalidatePath("/employees");
  return { success: true, employeeId };
}

export async function deleteEmployee(
  employeeId: string,
): Promise<EmployeeActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage employees.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const { data: employee, error: fetchError } = await ctx.supabase
    .from("employees")
    .select("id, email, profile_id")
    .eq("id", employeeId)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (fetchError || !employee) {
    return { error: fetchError?.message ?? "Employee not found." };
  }

  if (employee.profile_id) {
    const admin = createAdminClient();
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(
      employee.profile_id,
    );
    if (deleteUserError) {
      return { error: deleteUserError.message };
    }
  }

  const { error: deleteInvitesError } = await ctx.supabase
    .from("employee_invites")
    .delete()
    .eq("employee_id", employeeId);

  if (deleteInvitesError) {
    return { error: deleteInvitesError.message };
  }

  const { error: deleteError } = await ctx.supabase
    .from("employees")
    .delete()
    .eq("id", employeeId)
    .eq("organization_id", ctx.organizationId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/employees");
  return { success: true, employeeId };
}

export async function sendPasswordReset(
  employeeId: string,
): Promise<EmployeeActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to manage employees.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const { data: employee, error: fetchError } = await ctx.supabase
    .from("employees")
    .select("id, email, profile_id")
    .eq("id", employeeId)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (fetchError || !employee) {
    return { error: fetchError?.message ?? "Employee not found." };
  }

  if (!employee.profile_id) {
    return { error: "This employee has not activated their account yet." };
  }

  const admin = createAdminClient();
  const siteUrl = getSiteUrl();
  const { error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: employee.email,
    options: { redirectTo: `${siteUrl}/auth/confirm` },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getEmployeeOverview(
  employeeId: string,
): Promise<{ error?: string; overview?: EmployeeOverviewData }> {
  const ctx = await requireOrgStaff(
    "You do not have permission to view employee details.",
  );
  if (ctx.error || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  try {
    const overview = await fetchEmployeeOverview(
      employeeId,
      ctx.organizationId,
    );
    return { overview };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load employee overview.";
    return { error: message };
  }
}
