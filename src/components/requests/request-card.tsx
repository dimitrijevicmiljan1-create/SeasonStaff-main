"use client";

import {
  getRequestTypeShortLabel,
  getStatusLabel,
} from "@/lib/request-utils";
import { cn } from "@/lib/utils";
import type { RequestListItem } from "@/types/requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RequestCardProps {
  request: RequestListItem;
  showActions?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  actionLoading?: boolean;
  actionType?: "approve" | "reject";
}

const statusStyles = {
  pending: {
    card: "border-status-pending/40 bg-status-pending-bg/60 shadow-sm",
    accent: "border-l-[3px] border-l-status-pending",
  },
  approved: {
    card: "border-border bg-surface",
    accent: "border-l-[3px] border-l-status-approved",
  },
  rejected: {
    card: "border-border bg-subtle/50",
    accent: "border-l-[3px] border-l-status-rejected",
  },
} as const;

export function RequestCard({
  request,
  showActions = true,
  onApprove,
  onReject,
  actionLoading = false,
  actionType,
}: RequestCardProps) {
  const isPending = request.status === "pending";
  const styles = statusStyles[request.status];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg border shadow-[var(--shadow-card)]",
        styles.card,
        styles.accent,
      )}
    >
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="neutral">
                {getRequestTypeShortLabel(request.type)}
              </Badge>
              <Badge variant={request.status} className="shrink-0">
                {getStatusLabel(request.status)}
              </Badge>
            </div>
            <p
              className={cn(
                "truncate text-sm font-semibold text-text-primary",
                request.status === "rejected" && "text-text-secondary",
              )}
            >
              {request.employeeName}
            </p>
          </div>
          <time
            className="shrink-0 text-[10px] tabular-nums text-text-tertiary lg:text-xs"
            dateTime={request.created_at}
          >
            {request.createdDate}
          </time>
        </div>

        <p
          className={cn(
            "mt-1.5 line-clamp-2 text-xs leading-snug text-text-secondary",
            request.status === "rejected" && "text-text-tertiary",
          )}
        >
          {request.details}
        </p>

        {isPending && showActions && (
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 px-2 text-xs sm:flex-none sm:px-3"
              disabled={actionLoading}
              onClick={() => onReject(request.id)}
            >
              {actionLoading && actionType === "reject" ? "Rejecting…" : "Reject"}
            </Button>
            <Button
              size="sm"
              className="h-8 flex-1 px-2 text-xs sm:flex-none sm:px-3"
              disabled={actionLoading}
              onClick={() => onApprove(request.id)}
            >
              {actionLoading && actionType === "approve" ? "Saving…" : "Approve"}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
