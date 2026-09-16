"use client";

import type { StatusFilter } from "@/types/employees";
import {
  filterPillActive,
  filterPillBase,
  filterPillInactive,
} from "@/lib/page-styles";
import { cn } from "@/lib/utils";

const filters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "invited", label: "Invited" },
];

interface EmployeeStatusFilterProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

export function EmployeeStatusFilter({
  value,
  onChange,
}: EmployeeStatusFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {filters.map((filter) => {
        const active = value === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={cn(
              filterPillBase,
              active ? filterPillActive : filterPillInactive,
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
