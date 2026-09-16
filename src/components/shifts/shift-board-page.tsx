"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DragEndEvent } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useShifts } from "@/contexts/shifts-context";
import { useToast } from "@/contexts/toast-context";
import {
  createShift,
  createShifts,
  deleteShift,
  updateShift,
} from "@/lib/shifts/actions";
import {
  parseCellDroppableId,
  parseShiftDraggableId,
} from "@/lib/shifts/dnd";
import { shiftsQueryKey } from "@/lib/shifts/queries";
import { employeesQueryKey, fetchEmployees } from "@/lib/employees/queries";
import { fetchPositions, positionsQueryKey } from "@/lib/positions/queries";
import {
  keepPreviousData,
  LIST_QUERY_STALE_MS,
} from "@/lib/query/options";
import { formatTimeFromDb, toBoardEmployees } from "@/lib/shifts/utils";
import {
  addWeeks,
  enumerateDateKeys,
  startOfWeek,
  toDateKey,
} from "@/lib/week-utils";
import type { BoardEmployee, ShiftWithPosition } from "@/types/shifts";
import type { EmployeeWithInvite, Position } from "@/types/employees";
import { Button } from "@/components/ui/button";
import { ShiftBoardEmpty } from "@/components/shifts/shift-board-empty";
import { ShiftBoardGrid } from "@/components/shifts/shift-board-grid";
import { ShiftBoardSkeleton } from "@/components/shifts/shift-board-skeleton";
import {
  ShiftModal,
  type OrgShiftDefaults,
  type ShiftFormData,
} from "@/components/shifts/shift-modal";
import { WeekNavigation } from "@/components/shifts/week-navigation";

interface ModalState {
  employeeId: string;
  date: string;
  endDate: string;
  dateMode: "single" | "range";
  shiftId?: string;
  startTime: string;
  endTime: string;
  positionId: string;
}

function resolveDefaultPositionId(
  orgShiftDefaults: OrgShiftDefaults,
  positions: Position[],
  employee?: BoardEmployee,
): string {
  const fromOrg = orgShiftDefaults.defaultPositionIds
    .map((id) => positions.find((p) => p.id === id)?.id)
    .find(Boolean);
  return (
    fromOrg ??
    positions.find((p) => p.id === employee?.positionId)?.id ??
    positions[0]?.id ??
    ""
  );
}

interface ShiftBoardPageProps {}

const DEFAULT_SHIFT_START = "09:00";
const DEFAULT_SHIFT_END = "17:00";

export function ShiftBoardPage(_props: ShiftBoardPageProps = {}) {
  const { profile, organization, isLoading: authLoading } = useAuth();
  const organizationId = profile?.organization_id ?? "";
  const { shifts, isLoading, weekStart, setWeekStart, invalidateWeek, copyPreviousWeek } =
    useShifts();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const weekStartKey = toDateKey(weekStart);

  const { data: allEmployees = [], isLoading: employeesLoading } = useQuery({
    queryKey: employeesQueryKey(organizationId),
    queryFn: () => fetchEmployees(organizationId),
    enabled: Boolean(organizationId),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const { data: positions = [], isLoading: positionsLoading } = useQuery({
    queryKey: positionsQueryKey(organizationId),
    queryFn: () => fetchPositions(organizationId),
    enabled: Boolean(organizationId),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const employees = useMemo(
    () => toBoardEmployees(allEmployees),
    [allEmployees],
  );

  const orgShiftDefaults = useMemo(
    (): OrgShiftDefaults => ({
      defaultStartTime: organization?.default_shift_start
        ? formatTimeFromDb(organization.default_shift_start)
        : DEFAULT_SHIFT_START,
      defaultEndTime: organization?.default_shift_end
        ? formatTimeFromDb(organization.default_shift_end)
        : DEFAULT_SHIFT_END,
      defaultPositionIds: organization?.default_position_ids ?? [],
    }),
    [organization],
  );

  const [copying, setCopying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const queryKey = shiftsQueryKey(organizationId, weekStartKey);

  const currentWeekStart = useMemo(() => startOfWeek(new Date()), []);
  const isCurrentWeek = weekStartKey === toDateKey(currentWeekStart);

  const weekShifts = shifts;

  const showEmptyBoard = employees.length === 0;

  const updateCache = useCallback(
    (updater: (prev: ShiftWithPosition[]) => ShiftWithPosition[]) => {
      queryClient.setQueryData<ShiftWithPosition[]>(queryKey, (prev) =>
        updater(prev ?? []),
      );
    },
    [queryClient, queryKey],
  );

  const createMutation = useMutation({
    mutationFn: createShift,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ShiftWithPosition[]>(queryKey);
      const optimistic: ShiftWithPosition = {
        id: `temp-${Date.now()}`,
        organization_id: organizationId,
        employee_id: input.employee_id,
        shift_date: input.shift_date,
        start_time: input.start_time,
        end_time: input.end_time,
        position_id: input.position_id,
        status: input.status ?? "scheduled",
        created_at: new Date().toISOString(),
        position:
          positions.find((p) => p.id === input.position_id) ?? null,
      };
      updateCache((prev) => [...prev, optimistic]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showError("Failed to create shift.");
      invalidateWeek();
    },
    onSuccess: (result) => {
      if (result.error || !result.shift) {
        invalidateWeek();
        showError(result.error ?? "Failed to create shift.");
        return;
      }
      updateCache((prev) =>
        prev.map((s) =>
          s.id.startsWith("temp-") &&
          s.employee_id === result.shift!.employee_id &&
          s.shift_date === result.shift!.shift_date
            ? result.shift!
            : s,
        ),
      );
      showSuccess("Shift created.");
    },
  });

  const createBulkMutation = useMutation({
    mutationFn: createShifts,
    onMutate: async (inputs) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ShiftWithPosition[]>(queryKey);
      const optimistic = inputs.map((input, index) => ({
        id: `temp-bulk-${Date.now()}-${index}`,
        organization_id: organizationId,
        employee_id: input.employee_id,
        shift_date: input.shift_date,
        start_time: input.start_time,
        end_time: input.end_time,
        position_id: input.position_id,
        status: input.status ?? "scheduled",
        created_at: new Date().toISOString(),
        position:
          positions.find((p) => p.id === input.position_id) ?? null,
      }));
      updateCache((prev) => [...prev, ...optimistic]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showError("Failed to create shifts.");
      invalidateWeek();
    },
    onSuccess: (result) => {
      if (result.error || !result.shifts?.length) {
        invalidateWeek();
        showError(result.error ?? "Failed to create shifts.");
        return;
      }
      const created = result.shifts;
      updateCache((prev) => {
        const withoutTemps = prev.filter((s) => !s.id.startsWith("temp-bulk-"));
        const existingIds = new Set(withoutTemps.map((s) => s.id));
        const merged = [...withoutTemps];
        for (const shift of created) {
          if (!existingIds.has(shift.id)) {
            merged.push(shift);
          }
        }
        return merged;
      });
      const count = result.createdCount ?? created.length;
      showSuccess(
        `${count} shift${count === 1 ? "" : "s"} created.`,
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      shiftId,
      input,
    }: {
      shiftId: string;
      input: Parameters<typeof updateShift>[1];
    }) => updateShift(shiftId, input),
    onMutate: async ({ shiftId, input }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ShiftWithPosition[]>(queryKey);
      updateCache((prev) =>
        prev.map((s) => {
          if (s.id !== shiftId) return s;
          const position =
            input.position_id !== undefined
              ? positions.find((p) => p.id === input.position_id) ?? null
              : s.position;
          return {
            ...s,
            employee_id: input.employee_id ?? s.employee_id,
            shift_date: input.shift_date ?? s.shift_date,
            start_time: input.start_time ?? s.start_time,
            end_time: input.end_time ?? s.end_time,
            position_id:
              input.position_id !== undefined
                ? input.position_id
                : s.position_id,
            status: input.status ?? s.status,
            position,
          };
        }),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showError("Failed to update shift.");
      invalidateWeek();
    },
    onSuccess: () => {
      showSuccess("Shift updated.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShift,
    onMutate: async (shiftId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ShiftWithPosition[]>(queryKey);
      updateCache((prev) => prev.filter((s) => s.id !== shiftId));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showError("Failed to delete shift.");
      invalidateWeek();
    },
    onSuccess: () => {
      showSuccess("Shift deleted.");
    },
  });

  const handleCopyPreviousWeek = useCallback(async () => {
    setCopying(true);
    try {
      const result = await copyPreviousWeek();
      if (result.success) {
        showSuccess(`${result.copiedCount} shift${result.copiedCount === 1 ? "" : "s"} copied from previous week`);
      } else {
        showError(result.error);
      }
    } finally {
      setCopying(false);
    }
  }, [copyPreviousWeek, showError, showSuccess]);

  const openCreateModal = useCallback(
    (employeeId?: string, date?: string) => {
      const emp = employeeId
        ? employees.find((e) => e.id === employeeId)
        : employees[0];
      const targetDate = date ?? toDateKey(new Date());
      setModalState({
        employeeId: emp?.id ?? employees[0]?.id ?? "",
        date: targetDate,
        endDate: targetDate,
        dateMode: "single",
        startTime: orgShiftDefaults.defaultStartTime,
        endTime: orgShiftDefaults.defaultEndTime,
        positionId: resolveDefaultPositionId(orgShiftDefaults, positions, emp),
      });
      setModalOpen(true);
    },
    [employees, orgShiftDefaults, positions],
  );

  const handleCellClick = useCallback(
    (employeeId: string, date: string, shift?: ShiftWithPosition) => {
      const employee = employees.find((e) => e.id === employeeId);
      if (shift) {
        setModalState({
          employeeId,
          date,
          endDate: date,
          dateMode: "single",
          shiftId: shift.id,
          startTime: shift.start_time,
          endTime: shift.end_time,
          positionId:
            shift.position_id ??
            resolveDefaultPositionId(orgShiftDefaults, positions, employee),
        });
      } else {
        setModalState({
          employeeId,
          date,
          endDate: date,
          dateMode: "single",
          startTime: orgShiftDefaults.defaultStartTime,
          endTime: orgShiftDefaults.defaultEndTime,
          positionId: resolveDefaultPositionId(
            orgShiftDefaults,
            positions,
            employee,
          ),
        });
      }
      setModalOpen(true);
    },
    [employees, orgShiftDefaults, positions],
  );

  const handleSave = useCallback(
    (data: ShiftFormData, shiftId?: string) => {
      const base = {
        employee_id: data.employeeId,
        start_time: data.startTime,
        end_time: data.endTime,
        position_id: data.positionId || null,
      };

      if (shiftId) {
        updateMutation.mutate({
          shiftId,
          input: { ...base, shift_date: data.date },
        });
        return;
      }

      if (data.dateMode === "range") {
        const dates = enumerateDateKeys(data.date, data.endDate);
        createBulkMutation.mutate(
          dates.map((shift_date) => ({ ...base, shift_date })),
        );
        return;
      }

      createMutation.mutate({ ...base, shift_date: data.date });
    },
    [createBulkMutation, createMutation, updateMutation],
  );

  const handleDelete = useCallback(
    (shiftId: string) => {
      deleteMutation.mutate(shiftId);
    },
    [deleteMutation],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const shiftId = parseShiftDraggableId(String(active.id));
      const target = parseCellDroppableId(String(over.id));
      if (!shiftId || !target) return;

      const shift = weekShifts.find((s) => s.id === shiftId);
      if (!shift) return;

      if (
        shift.employee_id === target.employeeId &&
        shift.shift_date === target.date
      ) {
        return;
      }

      updateMutation.mutate({
        shiftId,
        input: {
          employee_id: target.employeeId,
          shift_date: target.date,
        },
      });
    },
    [updateMutation],
  );

  if (
    authLoading ||
    !organizationId ||
    profile?.role === "employee" ||
    ((isLoading || employeesLoading || positionsLoading) && weekShifts.length === 0)
  ) {
    if (profile?.role === "employee") {
      return (
        <p className="px-4 py-6 text-sm text-text-secondary">
          You do not have permission to view the shift board.
        </p>
      );
    }
    return <ShiftBoardSkeleton />;
  }

  return (
    <div className="flex min-h-[calc(100dvh-3rem-3.5rem-env(safe-area-inset-bottom))] flex-col lg:min-h-[calc(100dvh-3.5rem)]">
      <WeekNavigation
        weekStart={weekStart}
        isCurrentWeek={isCurrentWeek}
        onPreviousWeek={() => setWeekStart((w) => addWeeks(w, -1))}
        onNextWeek={() => setWeekStart((w) => addWeeks(w, 1))}
        onToday={() => setWeekStart(startOfWeek(new Date()))}
      />

      <div className="flex items-center justify-between gap-2 border-b border-border bg-app px-3 py-2 lg:px-6">
        <p className="text-xs text-text-secondary lg:text-sm">
          {weekShifts.length} shift{weekShifts.length === 1 ? "" : "s"} this week
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1.5"
            onClick={handleCopyPreviousWeek}
            disabled={copying || employees.length === 0}
          >
            <Copy className="h-4 w-4" />
            Copy week
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => openCreateModal()}
            disabled={employees.length === 0}
          >
            <Plus className="h-4 w-4" />
            Create Shift
          </Button>
        </div>
      </div>

      {weekShifts.length === 0 && employees.length > 0 && (
        <div className="border-b border-border bg-accent-subtle px-3 py-2 text-center lg:px-6">
          <p className="text-xs text-text-secondary">
            No shifts this week. Tap{" "}
            <span className="font-medium text-text-primary">Add</span> on a cell
            or use Create Shift.
          </p>
        </div>
      )}

      {showEmptyBoard ? (
        <ShiftBoardEmpty
          hasEmployees={allEmployees.length > 0}
          onCreateShift={() => {
            if (allEmployees.length === 0) {
              router.push("/employees");
              return;
            }
            openCreateModal(undefined, toDateKey(new Date()));
          }}
        />
      ) : (
        <ShiftBoardGrid
          weekStart={weekStart}
          employees={employees}
          shifts={weekShifts}
          onCellClick={handleCellClick}
          onDragEnd={handleDragEnd}
        />
      )}

      <ShiftModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        employees={employees}
        positions={positions}
        orgShiftDefaults={orgShiftDefaults}
        initial={
          modalState
            ? {
                employeeId: modalState.employeeId,
                date: modalState.date,
                endDate: modalState.endDate,
                dateMode: modalState.dateMode,
                shiftId: modalState.shiftId,
                startTime: modalState.startTime,
                endTime: modalState.endTime,
                positionId: modalState.positionId,
              }
            : undefined
        }
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
