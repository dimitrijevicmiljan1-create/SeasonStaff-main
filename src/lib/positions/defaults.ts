import type { SupabaseClient } from "@supabase/supabase-js";

import type { Position } from "@/types/employees";

export const DEFAULT_POSITION_NAMES = [
  "Waiter",
  "Bartender",
  "Chef",
  "Host",
  "Runner",
] as const;

const POSITION_SELECT = "id, organization_id, name, created_at";

export async function seedDefaultPositions(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Position[]> {
  const { data: inserted, error: insertError } = await supabase
    .from("positions")
    .insert(
      DEFAULT_POSITION_NAMES.map((name) => ({
        organization_id: organizationId,
        name,
      })),
    )
    .select(POSITION_SELECT)
    .order("name");

  if (insertError) {
    if (insertError.message.includes("uq_positions_org_name")) {
      return fetchPositionsOnly(supabase, organizationId);
    }
    return [];
  }

  return (inserted ?? []) as Position[];
}

async function fetchPositionsOnly(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Position[]> {
  const { data, error } = await supabase
    .from("positions")
    .select(POSITION_SELECT)
    .eq("organization_id", organizationId)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Position[];
}

/** Returns org positions, seeding hospitality defaults when the table is empty. */
export async function fetchPositionsWithDefaults(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Position[]> {
  const positions = await fetchPositionsOnly(supabase, organizationId);
  if (positions.length > 0) {
    return positions;
  }

  return seedDefaultPositions(supabase, organizationId);
}
