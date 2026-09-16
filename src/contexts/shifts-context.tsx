"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";
import { LIST_QUERY_STALE_MS, keepPreviousData } from "@/lib/query/options";
import { copyPreviousWeekAction } from "@/lib/shifts/actions";
import { fetchWeekShifts, shiftsQueryKey } from "@/lib/shifts/queries";
import { startOfWeek, toDateKey } from "@/lib/week-utils";
import type { ShiftWithPosition } from "@/types/shifts";

export type CopyPreviousWeekOutcome =
  | { success: true; copiedCount: number }
  | { success: false; error: string; code?: "already_copied" | "no_source" };

interface ShiftsContextValue {
  shifts: ShiftWithPosition[];
  isLoading: boolean;
  weekStart: Date;
  setWeekStart: Dispatch<SetStateAction<Date>>;
  organizationId: string | undefined;
  invalidateWeek: () => void;
  copyPreviousWeek: () => Promise<CopyPreviousWeekOutcome>;
}

const ShiftsContext = createContext<ShiftsContextValue | null>(null);

export function ShiftsProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const organizationId = profile?.organization_id;
  const queryClient = useQueryClient();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const weekStartKey = toDateKey(weekStart);

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: shiftsQueryKey(organizationId ?? "", weekStartKey),
    queryFn: () => fetchWeekShifts(organizationId!, weekStart),
    enabled: Boolean(organizationId),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const invalidateWeek = useCallback(() => {
    if (!organizationId) return;
    void queryClient.invalidateQueries({
      queryKey: shiftsQueryKey(organizationId, weekStartKey),
    });
  }, [organizationId, queryClient, weekStartKey]);

  const copyPreviousWeek = useCallback(async (): Promise<CopyPreviousWeekOutcome> => {
    const result = await copyPreviousWeekAction(weekStartKey);

    if (!result.success) {
      return { success: false, error: result.error, code: result.code };
    }

    invalidateWeek();
    return { success: true, copiedCount: result.copiedCount };
  }, [invalidateWeek, weekStartKey]);

  const value = useMemo(
    () => ({
      shifts,
      isLoading,
      weekStart,
      setWeekStart,
      organizationId,
      invalidateWeek,
      copyPreviousWeek,
    }),
    [
      shifts,
      isLoading,
      weekStart,
      organizationId,
      invalidateWeek,
      copyPreviousWeek,
    ],
  );

  return (
    <ShiftsContext.Provider value={value}>{children}</ShiftsContext.Provider>
  );
}

export function useShifts(): ShiftsContextValue {
  const context = useContext(ShiftsContext);
  if (!context) {
    throw new Error("useShifts must be used within a ShiftsProvider");
  }
  return context;
}
