import type { RequestStatus, RequestType } from "@/types/requests";

export function getRequestTypeLabel(type: RequestType): string {
  return type === "swap" ? "Shift Swap Request" : "Time Off Request";
}

export function getRequestTypeShortLabel(type: RequestType): string {
  return type === "swap" ? "Swap" : "Time off";
}

export function getStatusLabel(status: RequestStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
