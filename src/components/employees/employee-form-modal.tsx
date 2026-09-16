"use client";

import { useState } from "react";

import type {
  EmployeeStatus,
  EmployeeWithInvite,
  Position,
} from "@/types/employees";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  positionId: string;
  status: EmployeeStatus;
}

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit" | "assign-position";
  initial?: EmployeeWithInvite;
  positions: Position[];
  positionsLoading?: boolean;
  saving?: boolean;
  onSave: (data: EmployeeFormData, employeeId?: string) => boolean | Promise<boolean>;
}

const emptyForm: EmployeeFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  positionId: "",
  status: "active",
};

function buildEmployeeForm(initial?: EmployeeWithInvite): EmployeeFormData {
  if (!initial) return emptyForm;
  return {
    firstName: initial.first_name,
    lastName: initial.last_name,
    phone: initial.phone ?? "",
    email: initial.email,
    positionId: initial.position_id ?? "",
    status: initial.status,
  };
}

export function EmployeeFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  positions,
  positionsLoading = false,
  saving = false,
  onSave,
}: EmployeeFormModalProps) {
  const [form, setForm] = useState<EmployeeFormData>(() =>
    buildEmployeeForm(initial),
  );
  const [inviteSent, setInviteSent] = useState(false);

  const isAssignPosition = mode === "assign-position";
  const title =
    mode === "add"
      ? "Add employee"
      : isAssignPosition
        ? "Assign position"
        : "Edit employee";

  const handleSave = async () => {
    if (!isAssignPosition && (!form.firstName.trim() || !form.lastName.trim())) {
      return;
    }
    const ok = await onSave(form, initial?.id);
    if (mode === "add" && ok) {
      setInviteSent(true);
      return;
    }
    if (ok) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setInviteSent(false);
    onOpenChange(false);
  };

  if (inviteSent) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invitation sent</DialogTitle>
            <DialogDescription>
              {form.firstName} {form.lastName} will receive an invitation.
              They can install the app, activate their account, and access the
              schedule.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {mode === "add" && (
            <DialogDescription>
              Add a team member and send them an app invitation.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {!isAssignPosition && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  disabled={mode === "edit"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
            </>
          )}
          <div className="grid gap-2">
            <Label htmlFor="position">Position</Label>
            <select
              id="position"
              value={form.positionId}
              disabled={positionsLoading}
              onChange={(e) =>
                setForm((f) => ({ ...f, positionId: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50"
            >
              <option value="">
                {positionsLoading ? "Loading positions…" : "No position"}
              </option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </select>
            {!positionsLoading && positions.length === 0 && (
              <p className="text-xs text-text-secondary">
                No positions available. Add positions in{" "}
                <a href="/settings" className="font-medium text-accent">
                  Settings
                </a>
                .
              </p>
            )}
          </div>
          {!isAssignPosition && (
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as EmployeeStatus,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving
              ? "Saving…"
              : mode === "add"
                ? "Add & invite"
                : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
