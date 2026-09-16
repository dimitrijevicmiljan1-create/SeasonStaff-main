import { isDemoMode } from "@/lib/demo/config";
import { getDemoPositions } from "@/lib/demo/store";
import { fetchPositionsWithDefaults } from "@/lib/positions/defaults";
import { createClient } from "@/lib/supabase/server";
import type { Position } from "@/types/employees";

export async function fetchPositionsServer(
  organizationId: string,
): Promise<Position[]> {
  if (isDemoMode()) {
    return getDemoPositions();
  }

  const supabase = await createClient();
  return fetchPositionsWithDefaults(supabase, organizationId);
}
