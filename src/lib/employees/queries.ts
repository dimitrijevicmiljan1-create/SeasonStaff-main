import { isDemoMode } from "@/lib/demo/config";
import { getDemoEmployees } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/client";
import { getEmployeeOverview } from "@/lib/employees/actions";
import { mapEmployeeRow } from "@/lib/employees/utils";
import type { EmployeeOverviewData, EmployeeWithInvite } from "@/types/employees";

const EMPLOYEE_SELECT = `
  id,
  organization_id,
  profile_id,
  first_name,
  last_name,
  email,
  phone,
  position_id,
  status,
  notes,
  created_at,
  position:positions(id, organization_id, name, created_at),
  employee_invites(id, accepted_at, expires_at)
`;

export async function fetchEmployees(
  organizationId: string,
): Promise<EmployeeWithInvite[]> {
  if (isDemoMode()) {
    return getDemoEmployees();
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("organization_id", organizationId)
    .order("last_name")
    .order("first_name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapEmployeeRow(row));
}

export async function fetchEmployeeById(
  employeeId: string,
): Promise<EmployeeWithInvite | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapEmployeeRow(data);
}

export const employeesQueryKey = (organizationId: string) =>
  ["employees", organizationId] as const;

export const employeeIdByProfileQueryKey = (profileId: string) =>
  ["employee-id-by-profile", profileId] as const;

export async function fetchEmployeeIdByProfileId(
  profileId: string,
): Promise<string | null> {
  if (isDemoMode()) {
    const match = getDemoEmployees().find((e) => e.profile_id === profileId);
    return match?.id ?? null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export function employeeOverviewQueryKey(employeeId: string) {
  return ["employee-overview", employeeId] as const;
}

export async function fetchEmployeeOverviewForModal(
  employeeId: string,
): Promise<EmployeeOverviewData> {
  const result = await getEmployeeOverview(employeeId);
  if (result.error || !result.overview) {
    throw new Error(result.error ?? "Failed to load employee overview.");
  }
  return result.overview;
}
