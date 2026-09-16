import { isDemoMode } from "@/lib/demo/config";
import {
  getDemoMyRequests,
  getDemoRequestListItems,
} from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import {
  loadShiftPreviewsForRequests,
  mapRequestRow,
  REQUEST_SELECT,
  toRequestListItem,
} from "@/lib/requests/utils";
import type { RequestListItem } from "@/types/requests";

export async function getOrgRequests(
  organizationId: string,
): Promise<RequestListItem[]> {
  if (isDemoMode()) {
    return getDemoRequestListItems();
  }

  const supabase = await createClient();

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

export async function getMyRequests(
  employeeId: string,
): Promise<RequestListItem[]> {
  if (isDemoMode()) {
    return getDemoMyRequests(employeeId);
  }

  const supabase = await createClient();

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
