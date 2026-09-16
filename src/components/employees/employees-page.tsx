"use client";

import { useCallback, useMemo, useState } from "react";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";

import { useToast } from "@/contexts/toast-context";
import {
  changeEmployeeStatus,
  createEmployee,
  deleteEmployee,
  resendInvite,
  sendPasswordReset,
  updateEmployee,
} from "@/lib/employees/actions";
import {
  employeesQueryKey,
  fetchEmployees,
} from "@/lib/employees/queries";
import {
  matchesPositionFilter,
  matchesSearch,
  matchesStatusFilter,
} from "@/lib/employees/utils";
import type { EmployeeStatus, EmployeeWithInvite, Position, StatusFilter } from "@/types/employees";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeCard } from "@/components/employees/employee-card";
import {
  EmployeeFormModal,
  type EmployeeFormData,
} from "@/components/employees/employee-form-modal";
import { EmployeeOverviewModal } from "@/components/employees/employee-overview-modal";
import { EmployeePositionFilter } from "@/components/employees/employee-position-filter";
import { EmployeeSearch } from "@/components/employees/employee-search";
import { EmployeeStatusFilter } from "@/components/employees/employee-status-filter";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeesEmpty } from "@/components/employees/employees-empty";
import { EmployeesSkeleton } from "@/components/employees/employees-skeleton";
import { listMeta, pageContainer, pageStack } from "@/lib/page-styles";
import {
  keepPreviousData,
  LIST_QUERY_STALE_MS,
} from "@/lib/query/options";
import { cn } from "@/lib/utils";

type FormMode = "add" | "edit" | "assign-position";

export function EmployeesPage({ organizationId }: { organizationId: string }) {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [positionFilter, setPositionFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formOpenCount, setFormOpenCount] = useState(0);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [selectedEmployee, setSelectedEmployee] = useState<
    EmployeeWithInvite | undefined
  >();
  const [saving, setSaving] = useState(false);

  const [overviewOpen, setOverviewOpen] = useState(false);
  const [overviewEmployee, setOverviewEmployee] =
    useState<EmployeeWithInvite | null>(null);

  const [deleteCandidate, setDeleteCandidate] =
    useState<EmployeeWithInvite | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isDesktop = useIsDesktop();

  const { data: employees = [], isLoading, error: employeesError } = useQuery({
    queryKey: employeesQueryKey(organizationId),
    queryFn: () => fetchEmployees(organizationId),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const positions = useMemo<Position[]>(() => {
    const seen = new Set<string>();
    const result: Position[] = [];
    for (const emp of employees) {
      if (emp.position && !seen.has(emp.position.id)) {
        seen.add(emp.position.id);
        result.push(emp.position);
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const invalidateEmployees = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: employeesQueryKey(organizationId),
    });
  }, [organizationId, queryClient]);

  const filteredEmployees = useMemo(
    () =>
      employees.filter(
        (e) =>
          matchesSearch(e, search) &&
          matchesStatusFilter(e, statusFilter) &&
          matchesPositionFilter(e, positionFilter),
      ),
    [employees, search, statusFilter, positionFilter],
  );

  const hasFilters =
    search.trim().length > 0 ||
    statusFilter !== "all" ||
    positionFilter !== "all";

  const openAddModal = useCallback(() => {
    setFormMode("add");
    setSelectedEmployee(undefined);
    setFormOpenCount((c) => c + 1);
    setFormOpen(true);
  }, []);

  const openEditModal = useCallback((employee: EmployeeWithInvite) => {
    setFormMode("edit");
    setSelectedEmployee(employee);
    setFormOpenCount((c) => c + 1);
    setFormOpen(true);
  }, []);

  const openAssignPositionModal = useCallback((employee: EmployeeWithInvite) => {
    setFormMode("assign-position");
    setSelectedEmployee(employee);
    setFormOpenCount((c) => c + 1);
    setFormOpen(true);
  }, []);

  const openOverview = useCallback((employee: EmployeeWithInvite) => {
    setOverviewEmployee(employee);
    setOverviewOpen(true);
  }, []);

  const handleChangeStatus = useCallback(
    async (employee: EmployeeWithInvite, status: EmployeeStatus) => {
      const result = await changeEmployeeStatus(employee.id, status);
      if (result.error) {
        showError(result.error);
        return;
      }
      showSuccess("Status updated.");
      await invalidateEmployees();
    },
    [invalidateEmployees, showError, showSuccess],
  );

  const handleResendInvite = useCallback(
    async (employee: EmployeeWithInvite) => {
      const result = await resendInvite(employee.id);
      if (result.error) {
        showError(result.error);
        return;
      }
      showSuccess("Invitation resent.");
      await invalidateEmployees();
    },
    [invalidateEmployees, showError, showSuccess],
  );

  const handleSendPasswordReset = useCallback(
    async (employee: EmployeeWithInvite) => {
      const result = await sendPasswordReset(employee.id);
      if (result.error) {
        showError(result.error);
        return;
      }
      showSuccess("Password reset email sent.");
    },
    [showError, showSuccess],
  );

  const handleDeleteRequest = useCallback((employee: EmployeeWithInvite) => {
    setDeleteCandidate(employee);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      const result = await deleteEmployee(deleteCandidate.id);
      if (result.error) {
        showError(result.error);
        return;
      }
      setDeleteCandidate(null);
      showSuccess("Employee deleted.");
      await invalidateEmployees();
    } finally {
      setDeleting(false);
    }
  }, [deleteCandidate, invalidateEmployees, showError, showSuccess]);

  const handleSave = useCallback(
    async (data: EmployeeFormData, employeeId?: string): Promise<boolean> => {
      setSaving(true);
      try {
        const positionId = data.positionId || null;

        if (employeeId) {
          const payload =
            formMode === "assign-position"
              ? { position_id: positionId }
              : {
                  first_name: data.firstName,
                  last_name: data.lastName,
                  phone: data.phone || null,
                  position_id: positionId,
                  status: data.status,
                };

          const result = await updateEmployee(employeeId, payload);
          if (result.error) {
            showError(result.error);
            return false;
          }
          showSuccess(
            formMode === "assign-position"
              ? "Position assigned."
              : "Employee updated.",
          );
          await invalidateEmployees();
          return true;
        }

        const result = await createEmployee({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || undefined,
          position_id: positionId,
          status: data.status,
        });

        if (result.error) {
          showError(result.error);
          return false;
        }

        showSuccess("Employee added. Invitation sent.");
        await invalidateEmployees();
        return true;
      } finally {
        setSaving(false);
      }
    },
    [formMode, invalidateEmployees, showError, showSuccess],
  );

  if (isLoading) {
    return <EmployeesSkeleton />;
  }

  if (employeesError) {
    return (
      <div className={cn(pageContainer, pageStack)}>
        <p className="text-sm text-status-rejected">
          Failed to load employees. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(pageContainer, pageStack)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:gap-4">
        <EmployeeSearch value={search} onChange={setSearch} />
        <Button className="h-10 shrink-0 gap-1.5 sm:w-auto" onClick={openAddModal}>
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <EmployeeStatusFilter value={statusFilter} onChange={setStatusFilter} />
      <EmployeePositionFilter
        positions={positions}
        value={positionFilter}
        onChange={setPositionFilter}
      />

      {filteredEmployees.length === 0 ? (
        <EmployeesEmpty onAddEmployee={openAddModal} hasFilters={hasFilters} />
      ) : (
        <>
          <p className={listMeta}>
            {filteredEmployees.length} employee
            {filteredEmployees.length === 1 ? "" : "s"}
          </p>

          {/* null = SSR/hydration: render both with CSS hiding to avoid mismatch.
              Resolved: mount only the active view. */}
          {isDesktop !== true && (
            <div className={cn("flex flex-col gap-2.5", isDesktop === null && "lg:hidden")}>
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={openEditModal}
                  onChangeStatus={handleChangeStatus}
                  onAssignPosition={openAssignPositionModal}
                  onViewOverview={openOverview}
                  onResendInvite={handleResendInvite}
                  onSendPasswordReset={handleSendPasswordReset}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}

          {isDesktop !== false && (
            <EmployeeTable
              employees={filteredEmployees}
              onEdit={openEditModal}
              onChangeStatus={handleChangeStatus}
              onAssignPosition={openAssignPositionModal}
              onViewOverview={openOverview}
              onResendInvite={handleResendInvite}
              onSendPasswordReset={handleSendPasswordReset}
              onDelete={handleDeleteRequest}
            />
          )}
        </>
      )}

      <EmployeeFormModal
        key={formOpenCount}
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initial={selectedEmployee}
        positions={positions}
        saving={saving}
        onSave={handleSave}
      />

      <EmployeeOverviewModal
        employee={overviewEmployee}
        open={overviewOpen}
        onOpenChange={setOverviewOpen}
      />

      <Dialog
        open={!!deleteCandidate}
        onOpenChange={(open) => { if (!open) setDeleteCandidate(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {deleteCandidate
                ? `${deleteCandidate.first_name} ${deleteCandidate.last_name}`
                : "this employee"}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCandidate(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
