import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex h-[22px] shrink-0 items-center rounded-md border border-transparent px-2 text-[11px] font-medium leading-none",
  {
    variants: {
      variant: {
        pending: "bg-status-pending-bg text-status-pending",
        approved: "bg-status-approved-bg text-status-approved",
        rejected: "bg-status-rejected-bg text-status-rejected",
        active: "bg-status-approved-bg text-status-approved",
        inactive: "border-border/60 bg-subtle text-text-secondary",
        suspended: "bg-status-rejected-bg text-status-rejected",
        invited: "bg-accent-subtle text-accent",
        neutral: "border-border/60 bg-subtle text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
