import { isDemoMode } from "@/lib/demo/config";
import {
  getDemoMyRequests,
  getDemoRequestListItems,
} from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/client";
import {
  loadShiftPreviewsForRequests,
  mapRequestRow,
  REQUEST_SELECT,
  toRequestListItem,
} from "@/lib/requests/utils";
import type { AppRole } from "@/types/auth";
import type { RequestListItem } from "@/types/requests";

export function requestsQueryKey(scope: "org" | "mine", id: string) {
  return ["requests", scope, id] as const;
}

export function pendingRequestsCountQueryKey(organizationId: string) {
  return ["requests", "pending-count", organizationId] as const;
}

export async function fetchPendingRequestsCount(
  organizationId: string,
): Promise<number> {
  if (isDemoMode()) {
    return getDemoRequestListItems().filter((r) => r.status === "pending").length;
  }

  const supabase = createClient();
  const { count, error } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "pending");

  if (error) return 0;
  return count ?? 0;
}

export async function fetchOrgRequests(
  organizationId: string,
): Promise<RequestListItem[]> {
  if (isDemoMode()) {
    return getDemoRequestListItems();
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(REQUEST_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []).map((row) =>
    mapRequestRow(row as Record<string, unknown>),
  );
  const shiftById = await loadShiftPreviewsForRequests(supabase, rows);
  return rows.map((row) => toRequestListItem(row, shiftById));
}

export async function fetchMyRequests(
  employeeId: string,
): Promise<RequestListItem[]> {
  if (isDemoMode()) {
    return getDemoMyRequests(employeeId);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(REQUEST_SELECT)
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []).map((row) =>
    mapRequestRow(row as Record<string, unknown>),
  );
  const shiftById = await loadShiftPreviewsForRequests(supabase, rows);
  return rows.map((row) => toRequestListItem(row, shiftById));
}

export async function fetchRequestsForRole(
  role: AppRole,
  organizationId: string,
  employeeId: string | null,
): Promise<RequestListItem[]> {
  if (role === "employee") {
    if (!employeeId) {
      throw new Error("Employee record not found.");
    }
    return fetchMyRequests(employeeId);
  }
  return fetchOrgRequests(organizationId);
}
