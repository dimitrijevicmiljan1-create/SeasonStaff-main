"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Plus } from "lucide-react";

import { CreateRequestModal } from "@/components/requests/create-request-modal";
import { RequestCard } from "@/components/requests/request-card";
import { useAuth } from "@/contexts/auth-context";
import {
  approveRequest,
  rejectRequest,
} from "@/lib/requests/actions";
import {
  fetchRequestsForRole,
  requestsQueryKey,
} from "@/lib/requests/queries";
import {
  keepPreviousData,
  LIST_QUERY_STALE_MS,
} from "@/lib/query/options";
import {
  employeeIdByProfileQueryKey,
  fetchEmployeeIdByProfileId,
} from "@/lib/employees/queries";
import {
  filterPillActive,
  filterPillBase,
  filterPillInactive,
  listMeta,
  pageContainer,
  pageStack,
} from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/toast-context";
import type {
  RequestFilter,
  RequestListItem,
  RequestStatus,
} from "@/types/requests";
import { Button } from "@/components/ui/button";

const filters: { id: RequestFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const statusOrder: Record<RequestStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

function getEmptyMessage(filter: RequestFilter): string {
  switch (filter) {
    case "pending":
      return "No pending requests";
    case "approved":
      return "No approved requests";
    case "rejected":
      return "No rejected requests";
    default:
      return "No requests";
  }
}

function filterRequests(
  requests: RequestListItem[],
  filter: RequestFilter,
): RequestListItem[] {
  const filtered =
    filter === "all"
      ? requests
      : requests.filter((request) => request.status === filter);

  return [...filtered].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status],
  );
}

interface RequestsPageProps {}

export function RequestsPage(_props: RequestsPageProps = {}) {
  const { profile, user, isLoading: authLoading } = useAuth();
  const role = profile?.role ?? "employee";
  const organizationId = profile?.organization_id ?? "";
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<RequestFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [actionId, setActionId] = useState<Map<string, "approve" | "reject">>(new Map());
  const inFlight = useRef(new Set<string>());
  const [, startTransition] = useTransition();
  const { showError } = useToast();

  const scope = role === "employee" ? "mine" : "org";

  const { data: employeeId = null } = useQuery({
    queryKey: employeeIdByProfileQueryKey(user?.id ?? ""),
    queryFn: () => fetchEmployeeIdByProfileId(user!.id),
    enabled: role === "employee" && Boolean(user?.id),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
  });

  const scopeId = role === "employee" ? (employeeId ?? "") : organizationId;

  const { data: requests = [] } = useQuery({
    queryKey: requestsQueryKey(scope, scopeId),
    queryFn: () =>
      fetchRequestsForRole(role, organizationId, employeeId),
    enabled: Boolean(scopeId) && (role !== "employee" || employeeId !== null),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const visibleRequests = useMemo(
    () => filterRequests(requests, activeFilter),
    [requests, activeFilter],
  );

  const isStaff = role === "owner" || role === "manager";

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: requestsQueryKey(scope, scopeId),
    });
    if (organizationId) {
      void queryClient.invalidateQueries({
        queryKey: ["dashboard-pending", organizationId],
      });
    }
  }, [organizationId, queryClient, scope, scopeId]);

  const handleApprove = useCallback(
    (id: string) => {
      if (inFlight.current.has(id)) return;
      inFlight.current.add(id);
      setActionId((prev) => new Map(prev).set(id, "approve"));
      startTransition(async () => {
        try {
          const result = await approveRequest(id);
          if (result.success) invalidate();
          else showError(result.error ?? "Failed to approve request");
        } catch (e) {
          console.error(e);
          showError("Failed to approve request");
        } finally {
          inFlight.current.delete(id);
          setActionId((prev) => { const next = new Map(prev); next.delete(id); return next; });
        }
      });
    },
    [invalidate, showError],
  );

  const handleReject = useCallback(
    (id: string) => {
      if (inFlight.current.has(id)) return;
      inFlight.current.add(id);
      setActionId((prev) => new Map(prev).set(id, "reject"));
      startTransition(async () => {
        try {
          const result = await rejectRequest(id);
          if (result.success) invalidate();
          else showError(result.error ?? "Failed to reject request");
        } catch (e) {
          console.error(e);
          showError("Failed to reject request");
        } finally {
          inFlight.current.delete(id);
          setActionId((prev) => { const next = new Map(prev); next.delete(id); return next; });
        }
      });
    },
    [invalidate, showError],
  );

  if (authLoading || !organizationId) {
    return (
      <div className={cn(pageContainer, pageStack)}>
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-subtle" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(pageContainer, pageStack)}>
      {role === "employee" && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            className="h-10 gap-1.5 px-4 text-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
            New request
          </Button>
        </div>
      )}

      <div className="-mx-1 overflow-x-auto px-1">
        <div
          className="flex w-max min-w-full gap-1.5"
          role="tablist"
          aria-label="Filter requests"
        >
          {filters.map(({ id, label }) => {
            const active = activeFilter === id;
            const count =
              id === "all"
                ? requests.length
                : requests.filter((request) => request.status === id).length;
            const isPendingFilter = id === "pending";

            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveFilter(id)}
                className={cn(
                  filterPillBase,
                  active
                    ? isPendingFilter
                      ? "border-status-pending bg-status-pending-bg text-status-pending"
                      : filterPillActive
                    : filterPillInactive,
                )}
              >
                {label}
                <span
                  className={cn(
                    "tabular-nums text-[10px] opacity-80 lg:text-xs",
                    !active && "text-text-tertiary",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {visibleRequests.length > 0 && (
        <p className={listMeta}>
          {visibleRequests.length} request
          {visibleRequests.length === 1 ? "" : "s"}
        </p>
      )}

      {visibleRequests.length === 0 ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-8 text-center shadow-[var(--shadow-card)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-subtle">
            <ClipboardList className="h-5 w-5 text-text-secondary" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-text-primary">
            {getEmptyMessage(activeFilter)}
          </p>
          {activeFilter === "all" && role === "employee" && (
            <p className="text-xs text-text-secondary">
              Submit a request using the button above.
            </p>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visibleRequests.map((request) => (
            <li key={request.id}>
              <RequestCard
                request={request}
                showActions={isStaff}
                onApprove={handleApprove}
                onReject={handleReject}
                actionLoading={actionId.has(request.id)}
                actionType={actionId.get(request.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {role === "employee" && (
        <CreateRequestModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={invalidate}
        />
      )}
    </div>
  );
}
