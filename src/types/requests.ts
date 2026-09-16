export type RequestType = "swap" | "time_off";

export type RequestStatus = "pending" | "approved" | "rejected";

export type RequestFilter = "all" | RequestStatus;

export interface SwapRequestMetadata {
  shift_id: string;
  note?: string;
}

export interface TimeOffRequestMetadata {
  date: string;
  note?: string;
}

export type RequestMetadata = SwapRequestMetadata | TimeOffRequestMetadata;

export interface Request {
  id: string;
  employee_id: string;
  organization_id: string;
  type: RequestType;
  status: RequestStatus;
  metadata: RequestMetadata;
  created_at: string;
}

export interface RequestEmployeeJoin {
  first_name: string;
  last_name: string;
}

export interface RequestWithEmployee extends Request {
  employees: RequestEmployeeJoin;
}

export interface RequestListItem extends Request {
  employeeName: string;
  details: string;
  createdDate: string;
}

export interface CreateSwapRequestInput {
  type: "swap";
  shift_id: string;
  note?: string;
}

export interface CreateTimeOffRequestInput {
  type: "time_off";
  date: string;
  note?: string;
}

export type CreateRequestInput =
  | CreateSwapRequestInput
  | CreateTimeOffRequestInput;

export interface PendingRequestSummary {
  id: string;
  type: RequestType;
  employeeName: string;
  summary: string;
}
