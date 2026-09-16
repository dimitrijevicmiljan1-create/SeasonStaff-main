"use client";

import { memo, useCallback } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";

import {
  cellDroppableId,
  shiftDraggableId,
} from "@/lib/shifts/dnd";
import { getPositionName } from "@/lib/shifts/utils";
import type { ShiftWithPosition } from "@/types/shifts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ShiftCellClickHandler {
  (employeeId: string, date: string, shift?: ShiftWithPosition): void;
}

interface ShiftCellProps {
  employeeId: string;
  date: string;
  shift?: ShiftWithPosition;
  isToday?: boolean;
  onCellClick: ShiftCellClickHandler;
}

function useCellDroppable(employeeId: string, date: string) {
  const droppableId = cellDroppableId(employeeId, date);
  return useDroppable({ id: droppableId });
}

const EmptyShiftCell = memo(function EmptyShiftCell({
  employeeId,
  date,
  isToday,
  onCellClick,
}: ShiftCellProps) {
  const { setNodeRef, isOver } = useCellDroppable(employeeId, date);

  const handleClick = useCallback(() => {
    onCellClick(employeeId, date);
  }, [date, employeeId, onCellClick]);

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={handleClick}
      className={cn(
        "flex h-full min-h-[44px] w-full self-stretch border-b border-r border-border transition-colors",
        isToday ? "bg-accent-subtle/70" : "bg-app",
        isOver && "ring-2 ring-inset ring-accent",
        "items-center justify-center px-1 py-2 hover:bg-subtle active:bg-subtle",
      )}
      aria-label="Add shift"
    >
      <Plus className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
    </button>
  );
});

const FilledShiftCell = memo(function FilledShiftCell({
  employeeId,
  date,
  shift,
  isToday,
  onCellClick,
}: ShiftCellProps & { shift: ShiftWithPosition }) {
  const droppableId = cellDroppableId(employeeId, date);
  const { setNodeRef: setDropRef, isOver } = useCellDroppable(employeeId, date);

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: shiftDraggableId(shift.id),
    data: { shiftId: shift.id },
  });

  const handleClick = useCallback(() => {
    onCellClick(employeeId, date, shift);
  }, [date, employeeId, onCellClick, shift]);

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setDropRef}
      className={cn(
        "relative flex h-full min-h-[44px] w-full self-stretch border-b border-r border-border p-0 transition-colors",
        isToday ? "bg-accent-subtle/70" : "bg-app",
        isOver && "ring-2 ring-inset ring-accent",
      )}
    >
      <button
        ref={setDragRef}
        type="button"
        style={style}
        onClick={handleClick}
        className={cn(
          "flex h-full min-h-[44px] w-full touch-manipulation flex-col justify-center gap-0.5 px-2 py-2 text-left",
          isToday
            ? "bg-accent-subtle hover:bg-accent-subtle/80 active:bg-accent-subtle/80"
            : "bg-subtle hover:bg-muted active:bg-muted",
          isDragging && "z-20 opacity-60 shadow-md",
        )}
        {...listeners}
        {...attributes}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold tabular-nums text-text-primary lg:text-sm">
            {shift.start_time}–{shift.end_time}
          </span>
          {shift.status === "scheduled" && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-pending"
              title="Scheduled"
            />
          )}
          {shift.status === "completed" && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-approved lg:hidden"
              title="Done"
            />
          )}
          {shift.status === "cancelled" && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-rejected lg:hidden"
              title="Cancelled"
            />
          )}
        </div>
        <span className="truncate text-[10px] text-text-secondary lg:text-xs">
          {getPositionName(shift)}
        </span>
        {shift.status === "completed" && (
          <Badge variant="approved" className="mt-0.5 hidden w-fit lg:inline-flex">
            Done
          </Badge>
        )}
        {shift.status === "cancelled" && (
          <Badge variant="rejected" className="mt-0.5 hidden w-fit lg:inline-flex">
            Cancelled
          </Badge>
        )}
      </button>
    </div>
  );
});

export const ShiftCell = memo(function ShiftCell(props: ShiftCellProps) {
  if (!props.shift) {
    return <EmptyShiftCell {...props} />;
  }

  return <FilledShiftCell {...props} shift={props.shift} />;
});
