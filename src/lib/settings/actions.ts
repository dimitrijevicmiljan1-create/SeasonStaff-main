"use server";

import { revalidatePath } from "next/cache";

import { isNotFoundError, requireOrgOwner, requireOrgStaff } from "@/lib/auth/guards";
import { formatTimeForDb } from "@/lib/shifts/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import type {
  AccountProfileInput,
  OrganizationSettingsInput,
} from "@/types/settings";

export type SettingsActionResult = {
  error?: string;
  success?: boolean;
};

export async function updateOrganizationSettings(
  input: OrganizationSettingsInput,
): Promise<SettingsActionResult> {
  const ctx = await requireOrgStaff(
    "You do not have permission to update organization settings.",
  );
  if (ctx.error || !ctx.supabase || !ctx.organizationId || !ctx.role) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const positionIds = input.defaultPositionIds ?? [];
  if (positionIds.length > 0) {
    const { count, error: posError } = await ctx.supabase
      .from("positions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", ctx.organizationId)
      .in("id", positionIds);

    if (posError) {
      return { error: posError.message };
    }
    if ((count ?? 0) !== positionIds.length) {
      return { error: "One or more default positions are invalid." };
    }
  }

  const updates: Record<string, unknown> = {
    phone: input.phone.trim() || null,
    email: input.email.trim() || null,
    address: input.address.trim() || null,
    default_shift_start: formatTimeForDb(input.defaultStartTime),
    default_shift_end: formatTimeForDb(input.defaultEndTime),
    default_position_ids: positionIds,
  };

  if (ctx.role === "owner") {
    const name = input.businessName?.trim();
    if (!name) {
      return { error: "Business name is required." };
    }
    updates.business_name = name;
  }

  const { error } = await ctx.supabase
    .from("organizations")
    .update(updates)
    .eq("id", ctx.organizationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/shifts");
  return { success: true };
}

export async function updateAccountProfile(
  input: AccountProfileInput,
): Promise<SettingsActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName || !lastName) {
    return { error: "First and last name are required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: input.phone.trim() || null,
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (isNotFoundError(error)) {
    return { error: "Profile not found." };
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

export type ManagerInfo = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export async function fetchManagers(): Promise<{
  managers?: ManagerInfo[];
  error?: string;
}> {
  const ctx = await requireOrgOwner("Only owners can manage the team.");
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const { data: profiles, error } = await ctx.supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("organization_id", ctx.organizationId)
    .eq("role", "manager");

  if (error) return { error: error.message };
  if (!profiles?.length) return { managers: [] };

  const admin = createAdminClient();
  const managers: ManagerInfo[] = await Promise.all(
    profiles.map(async (p) => {
      const { data } = await admin.auth.admin.getUserById(p.id);
      return {
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        email: data.user?.email ?? "",
      };
    }),
  );

  return { managers };
}

export async function inviteManager(input: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<SettingsActionResult> {
  const ctx = await requireOrgOwner("Only owners can invite managers.");
  if (ctx.error || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!email || !firstName || !lastName) {
    return { error: "First name, last name, and email are required." };
  }

  const admin = createAdminClient();
  const siteUrl = getSiteUrl();

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm`,
    data: {
      organization_id: ctx.organizationId,
      role: "manager",
      first_name: firstName,
      last_name: lastName,
    },
  });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function removeManager(
  managerId: string,
): Promise<SettingsActionResult> {
  const ctx = await requireOrgOwner("Only owners can remove managers.");
  if (ctx.error || !ctx.supabase || !ctx.organizationId) {
    return { error: ctx.error ?? "Unauthorized." };
  }

  const { data: profile, error: profileError } = await ctx.supabase
    .from("profiles")
    .select("id, role")
    .eq("id", managerId)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "Manager not found." };
  }
  if (profile.role !== "manager") {
    return { error: "Profile is not a manager." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(managerId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}
