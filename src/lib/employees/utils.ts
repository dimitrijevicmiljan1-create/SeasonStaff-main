import type {
  Employee,
  EmployeeWithInvite,
  EmployeeOverviewData,
  Position,
  StatusFilter,
} from "@/types/employees";

export function getEmployeeFullName(employee: Pick<Employee, "first_name" | "last_name">): string {
  return `${employee.first_name} ${employee.last_name}`.trim();
}

export function getEmployeePositionName(employee: EmployeeWithInvite | Employee): string {
  return employee.position?.name ?? "—";
}

export function matchesSearch(employee: EmployeeWithInvite, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const fullName = getEmployeeFullName(employee).toLowerCase();
  const positionName = employee.position?.name?.toLowerCase() ?? "";
  return (
    fullName.includes(q) ||
    (employee.phone ?? "").includes(q) ||
    employee.email.toLowerCase().includes(q) ||
    positionName.includes(q)
  );
}

export function matchesStatusFilter(
  employee: EmployeeWithInvite,
  filter: StatusFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "invited") return employee.pending_invite;
  return employee.status === filter;
}

export function matchesPositionFilter(
  employee: EmployeeWithInvite,
  positionId: string | "all",
): boolean {
  if (positionId === "all") return true;
  return employee.position_id === positionId;
}

export function getEmptyEmployeeOverview(): EmployeeOverviewData {
  return {
    upcomingShifts: [],
    workedHoursThisMonth: 0,
    attendanceHistory: [],
    requestHistory: [],
  };
}

type InviteRow = {
  id: string;
  accepted_at: string | null;
  expires_at: string;
};

type EmployeeRowInput = Omit<Employee, "position"> & {
  position?: Position | Position[] | null;
  employee_invites?: InviteRow | InviteRow[] | null;
};

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapEmployeeRow(row: EmployeeRowInput): EmployeeWithInvite {
  const now = Date.now();
  const invitesRaw = row.employee_invites;
  const invites = Array.isArray(invitesRaw)
    ? invitesRaw
    : invitesRaw
      ? [invitesRaw]
      : [];

  const pending_invite =
    row.profile_id === null &&
    invites.some(
      (inv) =>
        inv.accepted_at === null && new Date(inv.expires_at).getTime() > now,
    );

  const position = normalizeRelation(row.position);

  return {
    id: row.id,
    organization_id: row.organization_id,
    profile_id: row.profile_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    position_id: row.position_id,
    position,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    pending_invite,
  };
}
