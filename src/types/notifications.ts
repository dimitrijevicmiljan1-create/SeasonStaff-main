export type NotificationType =
  | "swap_request"
  | "time_off_request"
  | "shift_updated"
  | "shift_created"
  | "shift_assigned"
  | "shift_cancelled"
  | "swap_approved"
  | "swap_rejected"
  | "time_off_approved"
  | "time_off_rejected"
  | "attendance_reminder"
  | "attendance_confirmation";

export interface Notification {
  id: string;
  user_id: string;
  organization_id: string;
  type: NotificationType;
  title: string;
  meta: string;
  href: string;
  unread: boolean;
  created_at: string;
}
