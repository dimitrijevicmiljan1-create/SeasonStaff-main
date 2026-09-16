"use client";

import { AppLink } from "@/components/ui/app-link";
import { useRef, useState, useTransition } from "react";

import { approveRequest, rejectRequest } from "@/lib/requests/actions";
import type { AppRole } from "@/types/auth";
import type { PendingRequestSummary } from "@/types/requests";
import { sectionHeaderRow, sectionTitle } from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/toast-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PendingRequestsSectionProps {
  initialRequests: PendingRequestSummary[];
  onCountChange?: (count: number) => void;
  role: AppRole;
  className?: string;
}

function getRequestLabel(type: PendingRequestSummary["type"]) {
  return type === "swap" ? "Swap" : "Time off";
}

export function PendingRequestsSection({
  initialRequests,
  onCountChange,
  role,
  className,
}: PendingRequestsSectionProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [, startTransition] = useTransition();
  const [actionId, setActionId] = useState<Map<string, "approve" | "reject">>(new Map());
  const inFlight = useRef(new Set<string>());
  const { showError } = useToast();

  const mobileLimit = 2;
  const desktopLimit = 4;
  const visibleMobile = requests.slice(0, mobileLimit);
  const visibleDesktop = requests.slice(0, desktopLimit);

  function removeRequest(id: string) {
    setRequests((prev) => {
      const next = prev.filter((r) => r.id !== id);
      onCountChange?.(next.length);
      return next;
    });
  }

  function handleApprove(id: string) {
    if (inFlight.current.has(id)) return;
    inFlight.current.add(id);
    setActionId((prev) => new Map(prev).set(id, "approve"));
    startTransition(async () => {
      try {
        const result = await approveRequest(id);
        if (result.success) removeRequest(id);
        else showError(result.error ?? "Failed to approve request");
      } catch (e) {
        console.error(e);
        showError("Failed to approve request");
      } finally {
        inFlight.current.delete(id);
        setActionId((prev) => { const next = new Map(prev); next.delete(id); return next; });
      }
    });
  }

  function handleReject(id: string) {
    if (inFlight.current.has(id)) return;
    inFlight.current.add(id);
    setActionId((prev) => new Map(prev).set(id, "reject"));
    startTransition(async () => {
      try {
        const result = await rejectRequest(id);
        if (result.success) removeRequest(id);
        else showError(result.error ?? "Failed to reject request");
      } catch (e) {
        console.error(e);
        showError("Failed to reject request");
      } finally {
        inFlight.current.delete(id);
        setActionId((prev) => { const next = new Map(prev); next.delete(id); return next; });
      }
    });
  }

  if (requests.length === 0) {
    return (
      <section className={className}>
        <div className={sectionHeaderRow}>
          <h2 className={sectionTitle}>Pending Requests</h2>
        </div>
        <Card className="flex min-h-[100px] items-center justify-center px-4 py-6">
          <p className="text-sm text-text-secondary">
            No pending requests
          </p>
        </Card>
      </section>
    );
  }

  const canActOnRequests = role !== "employee";

  const renderCard = (request: PendingRequestSummary, compact: boolean) => (
    <div
      key={request.id}
      className={cn(
        "flex flex-col gap-2 p-3 lg:gap-3 lg:p-4",
        compact && "border-b border-border last:border-b-0",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="neutral">{getRequestLabel(request.type)}</Badge>
            <Badge variant="pending">Pending</Badge>
            <p className="truncate text-sm font-medium text-text-primary">
              {request.employeeName}
            </p>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-text-secondary lg:text-sm">
            {request.summary}
          </p>
        </div>
      </div>
      {canActOnRequests && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 flex-1 lg:h-8 lg:flex-none"
            disabled={actionId.has(request.id)}
            onClick={() => handleReject(request.id)}
          >
            {actionId.get(request.id) === "reject" ? "Rejecting…" : "Reject"}
          </Button>
          <Button
            size="sm"
            className="h-9 flex-1 lg:h-8 lg:flex-none"
            disabled={actionId.has(request.id)}
            onClick={() => handleApprove(request.id)}
          >
            {actionId.get(request.id) === "approve" ? "Approving…" : "Approve"}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <section className={className}>
      <div className={sectionHeaderRow}>
        <h2 className={sectionTitle}>Pending Requests</h2>
        <AppLink
          href="/requests"
          className="shrink-0 text-xs font-medium text-accent hover:text-accent-hover lg:text-sm"
        >
          View all →
        </AppLink>
      </div>

      {/* Mobile: single card, max 2 items */}
      <Card className="overflow-hidden lg:hidden">
        {visibleMobile.map((request) => renderCard(request, true))}
        {requests.length > mobileLimit && (
          <div className="border-t border-border px-3 py-2 text-center">
            <AppLink
              href="/requests"
              className="text-xs font-medium text-accent"
            >
              +{requests.length - mobileLimit} more on Requests
            </AppLink>
          </div>
        )}
      </Card>

      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-lg border border-border lg:block">
        {visibleDesktop.map((request, index) => (
          <Card
            key={request.id}
            className={cn(
              "rounded-none border-0 border-b border-border shadow-none last:border-b-0",
              index === 0 && "rounded-t-lg",
            )}
          >
            {renderCard(request, false)}
          </Card>
        ))}
        {requests.length > desktopLimit && (
          <div className="border-t border-border bg-surface px-4 py-3">
            <AppLink
              href="/requests"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              View all →
            </AppLink>
          </div>
        )}
      </div>
    </section>
  );
}
