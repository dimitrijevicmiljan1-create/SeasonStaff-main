import type { EmployeeStatus } from "@/types/employees";
import { Badge } from "@/components/ui/badge";

const labels: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <Badge variant={status}>{labels[status]}</Badge>;
}

export function InvitePendingBadge() {
  return <Badge variant="invited">Invited</Badge>;
}

export function getStatusLabel(status: EmployeeStatus): string {
  return labels[status];
}
