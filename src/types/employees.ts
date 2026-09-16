export type EmployeeStatus = "active" | "inactive" | "suspended";

export type StatusFilter = "all" | EmployeeStatus | "invited";

export interface Position {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
}

export interface Employee {
  id: string;
  organization_id: string;
  profile_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  position_id: string | null;
  position?: Position | null;
  status: EmployeeStatus;
  notes: string | null;
  created_at: string;
}

export interface EmployeeInvite {
  id: string;
  organization_id: string;
  employee_id: string;
  email: string;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface EmployeeWithInvite extends Employee {
  pending_invite: boolean;
}

export interface EmployeeOverviewData {
  upcomingShifts: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    position: string;
  }[];
  workedHoursThisMonth: number;
  attendanceHistory: {
    id: string;
    date: string;
    checkIn: string;
    checkOut: string;
    hours: number;
  }[];
  requestHistory: {
    id: string;
    type: "swap" | "time_off";
    summary: string;
    status: "pending" | "approved" | "rejected";
    date: string;
  }[];
}

export interface CreateEmployeeInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position_id?: string | null;
  status?: EmployeeStatus;
  notes?: string;
}

export interface UpdateEmployeeInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string | null;
  position_id?: string | null;
  status?: EmployeeStatus;
  notes?: string | null;
}
