import { isDemoMode } from "@/lib/demo/config";
import { getDemoPositions } from "@/lib/demo/store";
import { fetchPositionsWithDefaults } from "@/lib/positions/defaults";
import { createClient } from "@/lib/supabase/client";
import type { Position } from "@/types/employees";

export async function fetchPositions(
  organizationId: string,
): Promise<Position[]> {
  if (isDemoMode()) {
    return getDemoPositions();
  }

  const supabase = createClient();
  return fetchPositionsWithDefaults(supabase, organizationId);
}

export const positionsQueryKey = (organizationId: string) =>
  ["positions", organizationId] as const;
