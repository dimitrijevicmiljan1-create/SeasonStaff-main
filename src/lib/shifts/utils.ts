import type { BoardEmployee, Shift, ShiftWithPosition } from "@/types/shifts";
import type { EmployeeWithInvite } from "@/types/employees";
import { getEmployeeFullName, getEmployeePositionName } from "@/lib/employees/utils";

export const SHIFT_SELECT = `
  id,
  organization_id,
  employee_id,
  shift_date,
  start_time,
  end_time,
  position_id,
  status,
  created_at,
  position:positions(id, name)
`;

/** Normalize PostgreSQL time (HH:MM:SS) to HH:MM for UI. */
export function formatTimeFromDb(time: string): string {
  return time.length >= 5 ? time.slice(0, 5) : time;
}

/** Normalize UI time (HH:MM) to HH:MM:SS for PostgreSQL. */
export function formatTimeForDb(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

export function mapShiftRow(row: Record<string, unknown>): ShiftWithPosition {
  const position = row.position as { id: string; name: string } | null | undefined;

  return {
    id: row.id as string,
    organization_id: row.organization_id as string,
    employee_id: row.employee_id as string,
    shift_date: row.shift_date as string,
    start_time: formatTimeFromDb(row.start_time as string),
    end_time: formatTimeFromDb(row.end_time as string),
    position_id: (row.position_id as string | null) ?? null,
    status: row.status as Shift["status"],
    created_at: row.created_at as string,
    position: position ?? null,
  };
}

export function getPositionName(shift: ShiftWithPosition): string {
  return shift.position?.name ?? "—";
}

export function toBoardEmployees(employees: EmployeeWithInvite[]): BoardEmployee[] {
  return employees
    .filter((e) => e.status === "active")
    .map((employee) => ({
      id: employee.id,
      name: getEmployeeFullName(employee),
      positionId: employee.position_id ?? null,
      positionName: getEmployeePositionName(employee),
    }));
}
