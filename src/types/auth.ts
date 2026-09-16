export type AppRole = "owner" | "manager" | "employee";

export interface Profile {
  id: string;
  organization_id: string;
  role: AppRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  business_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  default_shift_start: string | null;
  default_shift_end: string | null;
  default_position_ids: string[];
  created_at: string;
}

export interface AuthState {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  organization: Organization | null;
  isLoading: boolean;
}
