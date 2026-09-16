"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ArrowLeftRight, CalendarOff } from "lucide-react";

import {
  createRequest,
  getEmployeeUpcomingShifts,
  type EmployeeShiftOption,
} from "@/lib/requests/actions";
import { cn } from "@/lib/utils";
import type { CreateRequestInput, RequestType } from "@/types/requests";
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

interface CreateRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const selectClassName =
  "flex w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type Step = "type" | "form";

export function CreateRequestModal({
  open,
  onOpenChange,
  onCreated,
}: CreateRequestModalProps) {
  const [step, setStep] = useState<Step>("type");
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [shiftId, setShiftId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<EmployeeShiftOption[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [isPending, startTransition] = useTransition();

  const reset = useCallback(() => {
    setStep("type");
    setRequestType(null);
    setShiftId("");
    setDate("");
    setNote("");
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    setLoadingShifts(true);
    void getEmployeeUpcomingShifts().then((result) => {
      setLoadingShifts(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.shifts) {
        setShifts(result.shifts);
        if (result.shifts.length > 0) {
          setShiftId(result.shifts[0].id);
        }
      }
    });
  }, [open, reset]);

  const handleSelectType = (type: RequestType) => {
    setRequestType(type);
    setStep("form");
    setError(null);
  };

  const handleSubmit = () => {
    if (!requestType) return;

    let input: CreateRequestInput;
    if (requestType === "swap") {
      if (!shiftId) {
        setError("Please select a shift.");
        return;
      }
      input = { type: "swap", shift_id: shiftId, note: note || undefined };
    } else {
      if (!date) {
        setError("Please select a date.");
        return;
      }
      input = { type: "time_off", date, note: note || undefined };
    }

    setError(null);
    startTransition(async () => {
      const result = await createRequest(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      onCreated();
      onOpenChange(false);
      reset();
    });
  };

  const title =
    step === "type"
      ? "New request"
      : requestType === "swap"
        ? "Shift swap"
        : "Time off";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription className="text-xs">
            {step === "type"
              ? "Choose the type of request you want to submit."
              : "Your manager will review and respond."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-4">
          {step === "type" ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelectType("swap")}
                className="flex min-h-[56px] items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors hover:bg-subtle"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                  <ArrowLeftRight className="size-5 text-accent" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-text-primary">
                    Shift swap
                  </span>
                  <span className="block text-xs text-text-secondary">
                    Request to change an assigned shift
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectType("time_off")}
                className="flex min-h-[56px] items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors hover:bg-subtle"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                  <CalendarOff className="size-5 text-accent" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-text-primary">
                    Time off
                  </span>
                  <span className="block text-xs text-text-secondary">
                    Request a day off
                  </span>
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {requestType === "swap" ? (
                <div className="space-y-2">
                  <Label htmlFor="request-shift">Shift</Label>
                  {loadingShifts ? (
                    <p className="text-sm text-text-secondary">Loading shifts…</p>
                  ) : shifts.length === 0 ? (
                    <p className="text-sm text-text-secondary">
                      No upcoming shifts to swap.
                    </p>
                  ) : (
                    <select
                      id="request-shift"
                      className={cn(selectClassName, "h-10")}
                      value={shiftId}
                      onChange={(e) => setShiftId(e.target.value)}
                    >
                      {shifts.map((shift) => (
                        <option key={shift.id} value={shift.id}>
                          {shift.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="request-date">Date</Label>
                  <Input
                    id="request-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="request-note">
                  Note <span className="text-text-tertiary">(optional)</span>
                </Label>
                <textarea
                  id="request-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a short note for your manager"
                  className={cn(
                    selectClassName,
                    "min-h-[80px] resize-none py-2",
                  )}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {step === "form" && (
          <DialogFooter className="flex-row gap-2 border-t border-border px-4 py-3 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 flex-1 sm:flex-none"
              onClick={() => {
                setStep("type");
                setError(null);
              }}
              disabled={isPending}
            >
              Back
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-10 flex-1 sm:flex-none"
              disabled={
                isPending ||
                (requestType === "swap" && shifts.length === 0 && !loadingShifts)
              }
              onClick={handleSubmit}
            >
              {isPending ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
