"use client";

import type { Position } from "@/types/employees";
import {
  filterPillActive,
  filterPillBase,
  filterPillInactive,
} from "@/lib/page-styles";
import { cn } from "@/lib/utils";

interface EmployeePositionFilterProps {
  positions: Position[];
  value: string;
  onChange: (positionId: string) => void;
}

export function EmployeePositionFilter({
  positions,
  value,
  onChange,
}: EmployeePositionFilterProps) {
  if (positions.length === 0) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          filterPillBase,
          value === "all" ? filterPillActive : filterPillInactive,
        )}
      >
        All positions
      </button>
      {positions.map((position) => (
        <button
          key={position.id}
          type="button"
          onClick={() => onChange(position.id)}
          className={cn(
            filterPillBase,
            value === position.id ? filterPillActive : filterPillInactive,
          )}
        >
          {position.name}
        </button>
      ))}
    </div>
  );
}
