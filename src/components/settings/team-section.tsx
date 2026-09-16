"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserPlus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  fetchManagers,
  inviteManager,
  removeManager,
  type ManagerInfo,
} from "@/lib/settings/actions";
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
import { SettingsSection } from "@/components/settings/settings-section";

function managersQueryKey(organizationId: string) {
  return ["managers", organizationId] as const;
}

export function TeamSection() {
  const { profile } = useAuth();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const organizationId = profile?.organization_id ?? "";

  const { data: managers = [], isLoading } = useQuery({
    queryKey: managersQueryKey(organizationId),
    queryFn: async () => {
      const result = await fetchManagers();
      if (result.error) throw new Error(result.error);
      return result.managers ?? [];
    },
    enabled: !!organizationId,
  });

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: managersQueryKey(organizationId),
    });
  }, [organizationId, queryClient]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const openInvite = useCallback(() => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setInviteOpen(true);
  }, []);

  const handleInvite = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setInviting(true);
      try {
        const result = await inviteManager({ firstName, lastName, email });
        if (result.error) {
          showError(result.error);
          return;
        }
        showSuccess("Manager invitation sent.");
        setInviteOpen(false);
        await invalidate();
      } finally {
        setInviting(false);
      }
    },
    [email, firstName, invalidate, lastName, showError, showSuccess],
  );

  const [removeCandidate, setRemoveCandidate] = useState<ManagerInfo | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRemove = useCallback(async () => {
    if (!removeCandidate) return;
    setRemoving(true);
    try {
      const result = await removeManager(removeCandidate.id);
      if (result.error) {
        showError(result.error);
        return;
      }
      setRemoveCandidate(null);
      showSuccess("Manager removed.");
      await invalidate();
    } finally {
      setRemoving(false);
    }
  }, [invalidate, removeCandidate, showError, showSuccess]);

  return (
    <>
      <SettingsSection
        title="Team"
        description="Managers can access scheduling, employees, and settings."
      >
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : managers.length === 0 ? (
            <p className="text-sm text-text-secondary">No managers yet.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {managers.map((manager) => (
                <li
                  key={manager.id}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between lg:p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {manager.firstName} {manager.lastName}
                    </p>
                    <p className="text-xs text-text-secondary">{manager.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 shrink-0 text-status-rejected",
                      "hover:bg-status-rejected-bg hover:text-status-rejected",
                    )}
                    onClick={() => setRemoveCandidate(manager)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full sm:w-auto"
            onClick={openInvite}
          >
            <UserPlus className="h-4 w-4" />
            Invite Manager
          </Button>
        </div>
      </SettingsSection>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite manager</DialogTitle>
            <DialogDescription>
              They&apos;ll receive an email to set up their account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="mgr-first-name">First Name</Label>
                <Input
                  id="mgr-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={inviting}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mgr-last-name">Last Name</Label>
                <Input
                  id="mgr-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={inviting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mgr-email">Email</Label>
              <Input
                id="mgr-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={inviting}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteOpen(false)}
                disabled={inviting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviting}>
                {inviting ? "Sending…" : "Send Invite"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!removeCandidate}
        onOpenChange={(open) => {
          if (!open) setRemoveCandidate(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove manager</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              {removeCandidate
                ? `${removeCandidate.firstName} ${removeCandidate.lastName}`
                : "this manager"}
              ? They will lose access to the organization.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveCandidate(null)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removing}>
              {removing ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
