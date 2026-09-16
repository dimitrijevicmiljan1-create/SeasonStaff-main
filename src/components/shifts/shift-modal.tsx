"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

import {
  formatShiftDuration,
  isShiftFormValid,
  validateShiftForm,
  type ShiftDateMode,
  type ShiftFormErrors,
} from "@/lib/shift-time-utils";
import {
  filterPillActive,
  filterPillBase,
  filterPillInactive,
} from "@/lib/page-styles";
import { countDaysInRange, formatFullDate } from "@/lib/week-utils";
import type { BoardEmployee } from "@/types/shifts";
import type { Position } from "@/types/employees";
import type { ShiftDefaultsForm } from "@/types/settings";
import { cn } from "@/lib/utils";
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

export interface ShiftFormData {
  employeeId: string;
  date: string;
  endDate: string;
  dateMode: ShiftDateMode;
  startTime: string;
  endTime: string;
  positionId: string;
}

export interface OrgShiftDefaults extends ShiftDefaultsForm {
  defaultPositionIds: string[];
}

interface ShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: BoardEmployee[];
  positions: Position[];
  orgShiftDefaults: OrgShiftDefaults;
  initial?: ShiftFormData & { shiftId?: string };
  onSave: (data: ShiftFormData, shiftId?: string) => void;
  onDelete?: (shiftId: string) => void;
}

const selectClassName =
  "relative z-[1] flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary touch-action-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function buildShiftForm(
  initial: (ShiftFormData & { shiftId?: string }) | undefined,
  employees: BoardEmployee[],
  positions: Position[],
  orgShiftDefaults: OrgShiftDefaults,
): ShiftFormData {
  const employee =
    employees.find((e) => e.id === initial?.employeeId) ?? employees[0];
  const orgDefaultPositionId = orgShiftDefaults.defaultPositionIds
    .map((id) => positions.find((p) => p.id === id)?.id)
    .find(Boolean);
  const defaultPositionId =
    initial?.positionId ??
    orgDefaultPositionId ??
    positions.find((p) => p.name === employee?.positionName)?.id ??
    positions[0]?.id ??
    "";
  const date = initial?.date ?? "";

  return {
    employeeId: initial?.employeeId ?? employees[0]?.id ?? "",
    date,
    endDate: initial?.endDate ?? date,
    dateMode: initial?.dateMode ?? "single",
    startTime: initial?.startTime ?? orgShiftDefaults.defaultStartTime,
    endTime: initial?.endTime ?? orgShiftDefaults.defaultEndTime,
    positionId: defaultPositionId,
  };
}

export function ShiftModal({
  open,
  onOpenChange,
  employees,
  positions,
  orgShiftDefaults,
  initial,
  onSave,
  onDelete,
}: ShiftModalProps) {
  const [form, setForm] = useState<ShiftFormData>(() =>
    buildShiftForm(initial, employees, positions, orgShiftDefaults),
  );
  const [errors, setErrors] = useState<ShiftFormErrors>({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(buildShiftForm(initial, employees, positions, orgShiftDefaults));
      setErrors({});
      setShowErrors(false);
    }
  }, [open, initial, employees, positions, orgShiftDefaults]);

  const isEditing = Boolean(initial?.shiftId);

  const duration = useMemo(
    () => formatShiftDuration(form.startTime, form.endTime),
    [form.startTime, form.endTime],
  );

  const shiftCount = useMemo(() => {
    if (isEditing || form.dateMode === "single") {
      return form.date ? 1 : 0;
    }
    return countDaysInRange(form.date, form.endDate);
  }, [form.date, form.dateMode, form.endDate, isEditing]);

  const dateLabel = form.date
    ? formatFullDate(new Date(`${form.date}T12:00:00`))
    : null;

  const fieldError = (key: keyof ShiftFormErrors) =>
    showErrors ? errors[key] : undefined;

  const runValidation = (next: ShiftFormData) => {
    if (showErrors) {
      setErrors(validateShiftForm(next));
    }
  };

  const updateField = <K extends keyof ShiftFormData>(
    key: K,
    value: ShiftFormData[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "employeeId") {
        const employee = employees.find((e) => e.id === value);
        const position = positions.find((p) => p.name === employee?.positionName);
        if (position) {
          next.positionId = position.id;
        }
      }
      if (key === "date" && next.dateMode === "range" && !next.endDate) {
        next.endDate = String(value);
      }
      runValidation(next);
      return next;
    });
  };

  const setDateMode = (mode: ShiftDateMode) => {
    setForm((prev) => {
      const next = {
        ...prev,
        dateMode: mode,
        endDate: mode === "range" ? prev.endDate || prev.date : prev.endDate,
      };
      runValidation(next);
      return next;
    });
  };

  const handleSave = () => {
    const nextErrors = validateShiftForm(form);
    setErrors(nextErrors);
    setShowErrors(true);

    if (!isShiftFormValid(form)) return;

    onSave(form, initial?.shiftId);
    onOpenChange(false);
  };

  const invalidEndTime = Boolean(fieldError("endTime"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit shift" : "Create shift"}</DialogTitle>
          <DialogDescription>
            {isEditing && dateLabel
              ? `Update shift details for ${dateLabel}.`
              : "Assign an employee, position, date, and working hours."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="shift-employee">Employee</Label>
            <select
              id="shift-employee"
              value={form.employeeId}
              onChange={(e) => updateField("employeeId", e.target.value)}
              className={cn(
                selectClassName,
                fieldError("employeeId") && "border-status-rejected",
              )}
              aria-invalid={Boolean(fieldError("employeeId"))}
            >
              <option value="" disabled>
                Select employee
              </option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            {fieldError("employeeId") && (
              <p className="text-xs text-status-rejected">{fieldError("employeeId")}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shift-position">Position</Label>
            <select
              id="shift-position"
              value={form.positionId}
              onChange={(e) => updateField("positionId", e.target.value)}
              className={cn(
                selectClassName,
                fieldError("positionId") && "border-status-rejected",
              )}
              aria-invalid={Boolean(fieldError("positionId"))}
            >
              <option value="" disabled>
                Select position
              </option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </select>
            {fieldError("positionId") && (
              <p className="text-xs text-status-rejected">
                {fieldError("positionId")}
              </p>
            )}
            {positions.length === 0 && (
              <p className="text-xs text-text-secondary">
                No positions available. Add positions in{" "}
                <a href="/settings" className="font-medium text-accent">
                  Settings
                </a>
                .
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="grid gap-2">
              <Label>Schedule</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={cn(
                    filterPillBase,
                    "flex-1",
                    form.dateMode === "single"
                      ? filterPillActive
                      : filterPillInactive,
                  )}
                  onClick={() => setDateMode("single")}
                >
                  Single date
                </button>
                <button
                  type="button"
                  className={cn(
                    filterPillBase,
                    "flex-1",
                    form.dateMode === "range"
                      ? filterPillActive
                      : filterPillInactive,
                  )}
                  onClick={() => setDateMode("range")}
                >
                  Date range
                </button>
              </div>
            </div>
          )}

          {form.dateMode === "single" || isEditing ? (
            <div className="grid gap-2">
              <Label htmlFor="shift-date">Date</Label>
              <Input
                id="shift-date"
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                className={cn(fieldError("date") && "border-status-rejected")}
                aria-invalid={Boolean(fieldError("date"))}
              />
              {fieldError("date") && (
                <p className="text-xs text-status-rejected">{fieldError("date")}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="shift-start-date">Start date</Label>
                <Input
                  id="shift-start-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className={cn(fieldError("date") && "border-status-rejected")}
                  aria-invalid={Boolean(fieldError("date"))}
                />
                {fieldError("date") && (
                  <p className="text-xs text-status-rejected">{fieldError("date")}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shift-end-date">End date</Label>
                <Input
                  id="shift-end-date"
                  type="date"
                  value={form.endDate}
                  min={form.date || undefined}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  className={cn(fieldError("endDate") && "border-status-rejected")}
                  aria-invalid={Boolean(fieldError("endDate"))}
                />
                {fieldError("endDate") && (
                  <p className="text-xs text-status-rejected">
                    {fieldError("endDate")}
                  </p>
                )}
              </div>
            </div>
          )}

          {!isEditing && shiftCount > 0 && (
            <p className="rounded-lg border border-border bg-subtle px-3 py-2 text-xs text-text-secondary">
              <span className="font-medium text-text-primary">{shiftCount}</span>{" "}
              shift{shiftCount === 1 ? "" : "s"} will be created
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="shift-start-time">Start time</Label>
              <Input
                id="shift-start-time"
                type="time"
                value={form.startTime}
                onChange={(e) => updateField("startTime", e.target.value)}
                className={cn(fieldError("startTime") && "border-status-rejected")}
                aria-invalid={Boolean(fieldError("startTime"))}
              />
              {fieldError("startTime") && (
                <p className="text-xs text-status-rejected">{fieldError("startTime")}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shift-end-time">End time</Label>
              <Input
                id="shift-end-time"
                type="time"
                value={form.endTime}
                min={form.startTime || undefined}
                onChange={(e) => updateField("endTime", e.target.value)}
                className={cn(invalidEndTime && "border-status-rejected")}
                aria-invalid={invalidEndTime}
              />
              {fieldError("endTime") && (
                <p className="text-xs text-status-rejected">{fieldError("endTime")}</p>
              )}
            </div>
          </div>

          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
              duration
                ? "border-border bg-subtle"
                : "border-dashed border-border bg-surface",
            )}
          >
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span>Duration</span>
            </div>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                duration ? "text-text-primary" : "text-text-tertiary",
              )}
            >
              {duration ?? "—"}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isEditing && initial?.shiftId && onDelete && (
            <Button
              type="button"
              variant="destructive"
              className="sm:mr-auto"
              onClick={() => {
                onDelete(initial.shiftId!);
                onOpenChange(false);
              }}
            >
              Delete
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {isEditing
              ? "Save shift"
              : form.dateMode === "range" && shiftCount > 1
                ? `Create ${shiftCount} shifts`
                : "Save shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
