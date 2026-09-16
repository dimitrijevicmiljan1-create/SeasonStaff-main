export type ShiftStatus = "scheduled" | "completed" | "cancelled";

export interface Shift {
  id: string;
  organization_id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  position_id: string | null;
  status: ShiftStatus;
  created_at: string;
}

export interface ShiftWithPosition extends Shift {
  position?: { id: string; name: string } | null;
}

export interface CreateShiftInput {
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  position_id: string | null;
  status?: ShiftStatus;
}

export interface UpdateShiftInput {
  employee_id?: string;
  shift_date?: string;
  start_time?: string;
  end_time?: string;
  position_id?: string | null;
  status?: ShiftStatus;
}

export interface BoardEmployee {
  id: string;
  name: string;
  positionId: string | null;
  positionName: string | null;
}

export interface TodayShift {
  id: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  employeeName: string;
  position: string;
  checkedIn: boolean;
}
