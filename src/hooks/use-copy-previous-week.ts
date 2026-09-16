"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";
import type { CopyPreviousWeekOutcome } from "@/contexts/shifts-context";
import { copyPreviousWeekAction } from "@/lib/shifts/actions";
import { shiftsQueryKey } from "@/lib/shifts/queries";
import { startOfWeek, toDateKey } from "@/lib/week-utils";

export function useCopyPreviousWeek() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const organizationId = profile?.organization_id;

  return useCallback(async (): Promise<CopyPreviousWeekOutcome> => {
    const weekStartKey = toDateKey(startOfWeek(new Date()));
    const result = await copyPreviousWeekAction(weekStartKey);

    if (!result.success) {
      return { success: false, error: result.error, code: result.code };
    }

    if (organizationId) {
      void queryClient.invalidateQueries({
        queryKey: shiftsQueryKey(organizationId, weekStartKey),
      });
    }

    return { success: true, copiedCount: result.copiedCount };
  }, [organizationId, queryClient]);
}
