"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface EmployeeSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmployeeSearch({ value, onChange }: EmployeeSearchProps) {
  return (
    <div className="relative flex-1">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
        strokeWidth={1.5}
      />
      <Input
        type="search"
        placeholder="Search employees..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 pl-9"
        aria-label="Search employees"
      />
    </div>
  );
}
