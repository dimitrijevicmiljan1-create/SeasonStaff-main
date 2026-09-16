"use client";

import type { EmployeeStatus, EmployeeWithInvite } from "@/types/employees";
import {
  getEmployeeFullName,
  getEmployeePositionName,
} from "@/lib/employees/utils";
import { Card } from "@/components/ui/card";
import { EmployeeActionsMenu } from "@/components/employees/employee-actions-menu";
import {
  EmployeeStatusBadge,
  InvitePendingBadge,
} from "@/components/employees/employee-status-badge";

interface EmployeeCardProps {
  employee: EmployeeWithInvite;
  onEdit: (employee: EmployeeWithInvite) => void;
  onChangeStatus: (employee: EmployeeWithInvite, status: EmployeeStatus) => void;
  onAssignPosition: (employee: EmployeeWithInvite) => void;
  onViewOverview: (employee: EmployeeWithInvite) => void;
  onResendInvite: (employee: EmployeeWithInvite) => void;
  onSendPasswordReset: (employee: EmployeeWithInvite) => void;
  onDelete: (employee: EmployeeWithInvite) => void;
}

export function EmployeeCard({
  employee,
  onEdit,
  onChangeStatus,
  onAssignPosition,
  onViewOverview,
  onResendInvite,
  onSendPasswordReset,
  onDelete,
}: EmployeeCardProps) {
  return (
    <Card className="p-4 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {getEmployeeFullName(employee)}
            </h3>
            {employee.pending_invite ? (
              <InvitePendingBadge />
            ) : (
              <EmployeeStatusBadge status={employee.status} />
            )}
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {getEmployeePositionName(employee)}
          </p>
          {employee.phone && (
            <p className="mt-2 text-sm text-text-primary">{employee.phone}</p>
          )}
        </div>
        <EmployeeActionsMenu
          employee={employee}
          onEdit={onEdit}
          onChangeStatus={onChangeStatus}
          onAssignPosition={onAssignPosition}
          onViewOverview={onViewOverview}
          onResendInvite={onResendInvite}
          onSendPasswordReset={onSendPasswordReset}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
}
