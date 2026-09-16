export function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function getShiftDurationMinutes(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null || end <= start) return 0;
  return end - start;
}

export function formatWeeklyHoursLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getWeeklyHoursByEmployee(
  shifts: {
    employee_id?: string;
    employeeId?: string;
    start_time?: string;
    startTime?: string;
    end_time?: string;
    endTime?: string;
  }[],
  employeeIds: string[],
): Record<string, number> {
  const totals = Object.fromEntries(employeeIds.map((id) => [id, 0]));

  for (const shift of shifts) {
    const employeeId = shift.employee_id ?? shift.employeeId;
    const startTime = shift.start_time ?? shift.startTime;
    const endTime = shift.end_time ?? shift.endTime;
    if (!employeeId || !startTime || !endTime) continue;
    if (!(employeeId in totals)) continue;
    totals[employeeId] += getShiftDurationMinutes(startTime, endTime);
  }

  return totals;
}

export function formatShiftDuration(startTime: string, endTime: string): string | null {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null || end <= start) return null;

  const totalMinutes = end - start;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export interface ShiftFormFields {
  employeeId: string;
  date: string;
  endDate: string;
  dateMode: ShiftDateMode;
  positionId: string;
  startTime: string;
  endTime: string;
}

export type ShiftDateMode = "single" | "range";

export type ShiftFormErrors = Partial<
  Record<keyof ShiftFormFields, string>
>;

export function validateShiftForm(fields: ShiftFormFields): ShiftFormErrors {
  const errors: ShiftFormErrors = {};

  if (!fields.employeeId) {
    errors.employeeId = "Select an employee.";
  }

  if (fields.dateMode === "single") {
    if (!fields.date) {
      errors.date = "Select a date.";
    }
  } else {
    if (!fields.date) {
      errors.date = "Select a start date.";
    }
    if (!fields.endDate) {
      errors.endDate = "Select an end date.";
    }
    if (
      fields.date &&
      fields.endDate &&
      fields.endDate < fields.date
    ) {
      errors.endDate = "End date must be on or after start date.";
    }
  }

  if (!fields.positionId) {
    errors.positionId = "Select a position.";
  }

  if (!fields.startTime) {
    errors.startTime = "Enter a start time.";
  }

  if (!fields.endTime) {
    errors.endTime = "Enter an end time.";
  }

  const start = parseTimeToMinutes(fields.startTime);
  const end = parseTimeToMinutes(fields.endTime);

  if (fields.startTime && start === null) {
    errors.startTime = "Invalid start time.";
  }

  if (fields.endTime && end === null) {
    errors.endTime = "Invalid end time.";
  }

  if (start !== null && end !== null && end <= start) {
    errors.endTime = "End time must be after start time.";
  }

  return errors;
}

export function isShiftFormValid(fields: ShiftFormFields): boolean {
  return Object.keys(validateShiftForm(fields)).length === 0;
}
