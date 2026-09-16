import { getProfileForUser } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/auth";

export type OrgStaffContext = {
  error: string | null;
  supabase: Awaited<ReturnType<typeof createClient>> | null;
  organizationId: string | null;
  role: AppRole | null;
};

export type OrgOwnerContext = OrgStaffContext;

export type OrgMemberContext = {
  error: string | null;
  supabase: Awaited<ReturnType<typeof createClient>> | null;
  organizationId: string | null;
  role: AppRole | null;
  userId: string | null;
  employeeId: string | null;
};

export async function requireOrgStaff(
  permissionError = "You do not have permission to perform this action.",
): Promise<OrgStaffContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated.", supabase: null, organizationId: null, role: null };
  }

  const profile = await getProfileForUser(user.id);
  if (!profile || !["owner", "manager"].includes(profile.role)) {
    return {
      error: permissionError,
      supabase: null,
      organizationId: null,
      role: null,
    };
  }

  return {
    error: null,
    supabase,
    organizationId: profile.organization_id,
    role: profile.role,
  };
}

export async function requireOrgOwner(
  permissionError = "Only the organization owner can perform this action.",
): Promise<OrgOwnerContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated.", supabase: null, organizationId: null, role: null };
  }

  const profile = await getProfileForUser(user.id);
  if (!profile || profile.role !== "owner") {
    return {
      error: permissionError,
      supabase: null,
      organizationId: null,
      role: null,
    };
  }

  return {
    error: null,
    supabase,
    organizationId: profile.organization_id,
    role: profile.role,
  };
}

export async function requireOrgMember(
  permissionError = "You do not have permission to access this page.",
): Promise<OrgMemberContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Not authenticated.",
      supabase: null,
      organizationId: null,
      role: null,
      userId: null,
      employeeId: null,
    };
  }

  const profile = await getProfileForUser(user.id);
  if (!profile) {
    return {
      error: permissionError,
      supabase: null,
      organizationId: null,
      role: null,
      userId: null,
      employeeId: null,
    };
  }

  let employeeId: string | null = null;
  if (profile.role === "employee") {
    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!employee) {
      return {
        error: "Employee profile not linked.",
        supabase: null,
        organizationId: null,
        role: null,
        userId: null,
        employeeId: null,
      };
    }
    employeeId = employee.id;
  }

  return {
    error: null,
    supabase,
    organizationId: profile.organization_id,
    role: profile.role,
    userId: user.id,
    employeeId,
  };
}

export function isNotFoundError(error: { code?: string } | null): boolean {
  return error?.code === "PGRST116";
}
