import { UserPlus } from "lucide-react";

import { emptyStateBox } from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmployeesEmptyProps {
  onAddEmployee: () => void;
  hasFilters: boolean;
}

export function EmployeesEmpty({
  onAddEmployee,
  hasFilters,
}: EmployeesEmptyProps) {
  return (
    <div className={cn(emptyStateBox)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-subtle">
        <UserPlus className="h-6 w-6 text-text-secondary" strokeWidth={1.5} />
      </div>
      <h2 className="text-base font-semibold tracking-tight text-text-primary">
        {hasFilters ? "No employees found" : "No employees yet"}
      </h2>
      <p className="mt-2 max-w-xs text-sm text-text-secondary">
        {hasFilters
          ? "Try adjusting your search or filter."
          : "Add your first team member to start scheduling."}
      </p>
      {!hasFilters && (
        <Button className="mt-5" onClick={onAddEmployee}>
          Add Employee
        </Button>
      )}
    </div>
  );
}
