"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CopyPreviousWeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isCopying?: boolean;
}

export function CopyPreviousWeekDialog({
  open,
  onOpenChange,
  onConfirm,
  isCopying = false,
}: CopyPreviousWeekDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Previous Week</DialogTitle>
          <DialogDescription>
            This will copy all shifts from the previous week, including
            employees, positions, and working hours.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCopying}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isCopying}>
            Copy Week
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
