export type AttendanceLogType = "check_in" | "check_out";

export interface AttendanceLogEmployee {
  id: string;
  first_name: string;
  last_name: string;
}

export interface AttendanceLog {
  id: string;
  employee_id: string;
  organization_id: string;
  timestamp: string;
  type: AttendanceLogType;
  notes: string | null;
  created_at: string;
  employee?: AttendanceLogEmployee;
}

export interface AttendanceDaySummary {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: number;
}

export interface AttendanceEmployeeMonthlySummary {
  employeeId: string;
  employeeName: string;
  totalHours: number;
}

export interface AttendanceLogFilters {
  employeeId?: string;
  type?: AttendanceLogType;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateAttendanceLogInput {
  id: string;
  timestamp: string;
  notes?: string | null;
}

export interface CreateAttendanceLogInput {
  employee_id: string;
  type: AttendanceLogType;
  timestamp: string;
  notes?: string | null;
}
