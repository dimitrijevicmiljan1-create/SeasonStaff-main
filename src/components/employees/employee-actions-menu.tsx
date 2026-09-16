"use client";

import Link from "next/link";
import {
  CalendarDays,
  Eye,
  KeyRound,
  Mail,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Tag,
  Trash2,
} from "lucide-react";

import type { EmployeeStatus, EmployeeWithInvite } from "@/types/employees";
import { getEmployeeFullName } from "@/lib/employees/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmployeeActionsMenuProps {
  employee: EmployeeWithInvite;
  onEdit: (employee: EmployeeWithInvite) => void;
  onChangeStatus: (employee: EmployeeWithInvite, status: EmployeeStatus) => void;
  onAssignPosition: (employee: EmployeeWithInvite) => void;
  onViewOverview: (employee: EmployeeWithInvite) => void;
  onResendInvite: (employee: EmployeeWithInvite) => void;
  onSendPasswordReset: (employee: EmployeeWithInvite) => void;
  onDelete: (employee: EmployeeWithInvite) => void;
  triggerClassName?: string;
}

export function EmployeeActionsMenu({
  employee,
  onEdit,
  onChangeStatus,
  onAssignPosition,
  onViewOverview,
  onResendInvite,
  onSendPasswordReset,
  onDelete,
  triggerClassName,
}: EmployeeActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={triggerClassName ?? "h-9 w-9 shrink-0"}
          aria-label={`Actions for ${getEmployeeFullName(employee)}`}
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onEdit(employee)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit employee
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <RefreshCw className="mr-2 h-4 w-4" />
            Change status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(["active", "inactive", "suspended"] as EmployeeStatus[]).map(
              (status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onChangeStatus(employee, status)}
                  disabled={employee.status === status}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => onAssignPosition(employee)}>
          <Tag className="mr-2 h-4 w-4" />
          Assign position
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/shifts">
            <CalendarDays className="mr-2 h-4 w-4" />
            View shifts
          </Link>
        </DropdownMenuItem>
        {employee.pending_invite && (
          <DropdownMenuItem onClick={() => onResendInvite(employee)}>
            <Mail className="mr-2 h-4 w-4" />
            Resend invitation
          </DropdownMenuItem>
        )}
        {employee.profile_id && (
          <DropdownMenuItem onClick={() => onSendPasswordReset(employee)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Send password reset
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onDelete(employee)}
          className="text-status-rejected focus:text-status-rejected"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete employee
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onViewOverview(employee)}>
          <Eye className="mr-2 h-4 w-4" />
          View overview
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
