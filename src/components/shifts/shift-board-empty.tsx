import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ShiftBoardEmptyProps {
  onCreateShift: () => void;
  hasEmployees: boolean;
}

export function ShiftBoardEmpty({
  onCreateShift,
  hasEmployees,
}: ShiftBoardEmptyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface">
        <CalendarPlus className="h-6 w-6 text-text-secondary" strokeWidth={1.5} />
      </div>
      <h2 className="text-base font-semibold text-text-primary">
        {hasEmployees ? "No shifts scheduled" : "No employees yet"}
      </h2>
      <p className="mt-2 max-w-xs text-sm text-text-secondary">
        {hasEmployees
          ? "Start building this week by adding shifts to the board."
          : "Add employees first, then create your weekly schedule."}
      </p>
      <Button className="mt-6" onClick={onCreateShift}>
        {hasEmployees ? "Create Shift" : "Add Employee"}
      </Button>
    </div>
  );
}
