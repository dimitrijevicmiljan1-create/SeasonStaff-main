import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Bell,
  CalendarOff,
  CalendarPlus,
  CalendarX,
  Clock,
  Pencil,
} from "lucide-react";

import type { NotificationType } from "@/types/notifications";

export function getNotificationHref(type: NotificationType): string {
  switch (type) {
    case "shift_updated":
    case "shift_created":
    case "shift_assigned":
    case "shift_cancelled":
      return "/shifts";
    case "attendance_reminder":
    case "attendance_confirmation":
      return "/attendance";
    default:
      return "/requests";
  }
}

export function getNotificationIcon(type: NotificationType): LucideIcon {
  switch (type) {
    case "swap_request":
    case "swap_approved":
    case "swap_rejected":
      return ArrowLeftRight;
    case "time_off_request":
    case "time_off_approved":
    case "time_off_rejected":
      return CalendarOff;
    case "shift_updated":
      return Pencil;
    case "shift_created":
    case "shift_assigned":
      return CalendarPlus;
    case "shift_cancelled":
      return CalendarX;
    case "attendance_reminder":
    case "attendance_confirmation":
      return Clock;
    default:
      return Bell;
  }
}

export function getNotificationIconStyles(type: NotificationType): {
  container: string;
  icon: string;
} {
  switch (type) {
    case "swap_request":
    case "time_off_request":
      return {
        container: "bg-accent-subtle",
        icon: "text-accent",
      };
    case "swap_approved":
    case "time_off_approved":
      return {
        container: "bg-status-approved-bg",
        icon: "text-status-approved",
      };
    case "swap_rejected":
    case "time_off_rejected":
      return {
        container: "bg-status-rejected-bg",
        icon: "text-status-rejected",
      };
    case "shift_updated":
    case "shift_created":
    case "shift_assigned":
      return {
        container: "bg-accent-subtle",
        icon: "text-accent",
      };
    case "shift_cancelled":
      return {
        container: "bg-status-pending-bg",
        icon: "text-status-pending",
      };
    case "attendance_reminder":
    case "attendance_confirmation":
      return {
        container: "bg-status-approved-bg",
        icon: "text-status-approved",
      };
    default:
      return {
        container: "bg-subtle",
        icon: "text-text-secondary",
      };
  }
}

export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case "swap_request":
      return "Swap request";
    case "time_off_request":
      return "Time off request";
    case "shift_updated":
      return "Shift updated";
    case "shift_created":
    case "shift_assigned":
      return "New shift";
    case "shift_cancelled":
      return "Shift cancelled";
    case "swap_approved":
      return "Swap approved";
    case "swap_rejected":
      return "Swap rejected";
    case "time_off_approved":
      return "Time off approved";
    case "time_off_rejected":
      return "Time off rejected";
    case "attendance_reminder":
      return "Attendance reminder";
    case "attendance_confirmation":
      return "Attendance";
    default:
      return "Notification";
  }
}
