"use client";

import { useEffect, useState } from "react";

import { updateAttendanceLog } from "@/lib/attendance/actions";
import type { AttendanceLog } from "@/types/attendance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toDatetimeLocalValue(timestamp: string): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${hours}:${minutes}`;
}

interface AttendanceLogEditModalProps {
  log: AttendanceLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  onError: (message: string) => void;
}

export function AttendanceLogEditModal({
  log,
  open,
  onOpenChange,
  onSaved,
  onError,
}: AttendanceLogEditModalProps) {
  const [timestamp, setTimestamp] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!log) return;
    setTimestamp(toDatetimeLocalValue(log.timestamp));
    setNotes(log.notes ?? "");
  }, [log]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!log) return;

    setSaving(true);
    const result = await updateAttendanceLog({
      id: log.id,
      timestamp: new Date(timestamp).toISOString(),
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
          <DialogTitle>Edit attendance log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="attendance-timestamp">Timestamp</Label>
            <Input
              id="attendance-timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendance-notes">Notes (optional)</Label>
            <Input
              id="attendance-notes"
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
