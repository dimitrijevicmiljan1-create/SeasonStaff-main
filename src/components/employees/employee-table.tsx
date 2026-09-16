"use client";

import type { EmployeeStatus, EmployeeWithInvite } from "@/types/employees";
import {
  getEmployeeFullName,
  getEmployeePositionName,
} from "@/lib/employees/utils";
import { EmployeeActionsMenu } from "@/components/employees/employee-actions-menu";
import {
  EmployeeStatusBadge,
  InvitePendingBadge,
} from "@/components/employees/employee-status-badge";

interface EmployeeTableProps {
  employees: EmployeeWithInvite[];
  onEdit: (employee: EmployeeWithInvite) => void;
  onChangeStatus: (employee: EmployeeWithInvite, status: EmployeeStatus) => void;
  onAssignPosition: (employee: EmployeeWithInvite) => void;
  onViewOverview: (employee: EmployeeWithInvite) => void;
  onResendInvite: (employee: EmployeeWithInvite) => void;
  onSendPasswordReset: (employee: EmployeeWithInvite) => void;
  onDelete: (employee: EmployeeWithInvite) => void;
}

export function EmployeeTable({
  employees,
  onEdit,
  onChangeStatus,
  onAssignPosition,
  onViewOverview,
  onResendInvite,
  onSendPasswordReset,
  onDelete,
}: EmployeeTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] lg:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-subtle/80">
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Name
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Position
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Status
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Phone
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr
              key={employee.id}
              className="border-b border-border last:border-b-0 transition-colors hover:bg-subtle/60"
            >
              <td className="px-4 py-3.5 font-medium text-text-primary">
                {getEmployeeFullName(employee)}
              </td>
              <td className="px-4 py-3.5 text-text-secondary">
                {getEmployeePositionName(employee)}
              </td>
              <td className="px-4 py-3.5">
                {employee.pending_invite ? (
                  <InvitePendingBadge />
                ) : (
                  <EmployeeStatusBadge status={employee.status} />
                )}
              </td>
              <td className="px-4 py-3.5 tabular-nums text-text-primary">
                {employee.phone ?? "—"}
              </td>
              <td className="px-4 py-3.5 text-right">
                <EmployeeActionsMenu
                  employee={employee}
                  onEdit={onEdit}
                  onChangeStatus={onChangeStatus}
                  onAssignPosition={onAssignPosition}
                  onViewOverview={onViewOverview}
                  onResendInvite={onResendInvite}
                  onSendPasswordReset={onSendPasswordReset}
                  onDelete={onDelete}
                  triggerClassName="h-8 w-8"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
