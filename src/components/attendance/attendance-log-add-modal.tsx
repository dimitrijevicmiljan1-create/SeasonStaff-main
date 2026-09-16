"use client";

import { useEffect, useState } from "react";

import { createAttendanceLog } from "@/lib/attendance/actions";
import type { AttendanceLogType } from "@/types/attendance";
import type { EmployeeWithInvite } from "@/types/employees";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function todayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function currentHourMinute(): { hour: string; minute: string } {
  const d = new Date();
  const hour = String(d.getHours()).padStart(2, "0");
  const rounded = Math.min(Math.round(d.getMinutes() / 15) * 15, 45);
  const minute = String(rounded).padStart(2, "0");
  return { hour, minute };
}

interface AttendanceLogAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeWithInvite[];
  onSaved: () => void;
  onError: (message: string) => void;
}

export function AttendanceLogAddModal({
  open,
  onOpenChange,
  employees,
  onSaved,
  onError,
}: AttendanceLogAddModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<AttendanceLogType>("check_in");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const sortedEmployees = [...employees].sort((a, b) =>
    `${a.last_name} ${a.first_name}`.localeCompare(
      `${b.last_name} ${b.first_name}`,
    ),
  );

  useEffect(() => {
    if (!open) return;
    const { hour: h, minute: m } = currentHourMinute();
    setEmployeeId(sortedEmployees[0]?.id ?? "");
    setType("check_in");
    setDate(todayDateKey());
    setHour(h);
    setMinute(m);
    setNotes("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId || !date || !hour) return;

    setSaving(true);
    const result = await createAttendanceLog({
      employee_id: employeeId,
      type,
      timestamp: new Date(`${date}T${hour}:${minute}`).toISOString(),
      notes: notes.trim() || null,
    });
    setSaving(false);

    if (result.error) {
      onError(result.error);
      return;
    }

    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add attendance entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="add-att-employee">Employee</Label>
            <select
              id="add-att-employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              {sortedEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-6">
              {(["check_in", "check_out"] as AttendanceLogType[]).map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center gap-2 text-sm text-text-primary"
                >
                  <input
                    type="radio"
                    name="add-att-type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    className="accent-accent"
                  />
                  {t === "check_in" ? "Check in" : "Check out"}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="add-att-date">Date</Label>
              <Input
                id="add-att-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <div className="flex items-center gap-1.5">
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="h-10 flex-1 rounded-md border border-border bg-surface px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-sm font-medium text-text-secondary">:</span>
                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="h-10 flex-1 rounded-md border border-border bg-surface px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-att-notes">Notes (optional)</Label>
            <Input
              id="add-att-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !employeeId}>
              {saving ? "Saving…" : "Add entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
