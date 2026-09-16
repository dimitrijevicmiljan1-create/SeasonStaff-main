"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  createPosition,
  deletePosition,
  updatePosition,
} from "@/lib/positions/actions";
import { positionsQueryKey } from "@/lib/positions/queries";
import type { Position } from "@/types/employees";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SettingsSection } from "@/components/settings/settings-section";

interface PositionsSectionProps {
  initialPositions: Position[];
}

export function PositionsSection({ initialPositions }: PositionsSectionProps) {
  const { profile } = useAuth();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const organizationId = profile?.organization_id;

  const [positions, setPositions] = useState(initialPositions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const invalidatePositions = useCallback(async () => {
    if (!organizationId) return;
    await queryClient.invalidateQueries({
      queryKey: positionsQueryKey(organizationId),
    });
  }, [organizationId, queryClient]);

  const startEdit = useCallback((position: Position) => {
    setIsAdding(false);
    setNewName("");
    setEditingId(position.id);
    setEditingName(position.name);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingName("");
  }, []);

  const saveEdit = useCallback(async () => {
    const trimmed = editingName.trim();
    if (!trimmed || !editingId) return;

    setSaving(true);
    try {
      const result = await updatePosition(editingId, trimmed);
      if (result.error) {
        showError(result.error);
        return;
      }
      setPositions((prev) =>
        prev.map((position) =>
          position.id === editingId ? { ...position, name: trimmed } : position,
        ),
      );
      showSuccess("Position updated.");
      await invalidatePositions();
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }, [
    editingId,
    editingName,
    cancelEdit,
    showError,
    showSuccess,
    invalidatePositions,
  ]);

  const deletePositionHandler = useCallback(
    async (id: string) => {
      setSaving(true);
      try {
        const result = await deletePosition(id);
        if (result.error) {
          showError(result.error);
          return;
        }
        setPositions((prev) => prev.filter((position) => position.id !== id));
        if (editingId === id) cancelEdit();
        showSuccess("Position deleted.");
        await invalidatePositions();
      } finally {
        setSaving(false);
      }
    },
    [editingId, cancelEdit, showError, showSuccess, invalidatePositions],
  );

  const startAdd = useCallback(() => {
    cancelEdit();
    setIsAdding(true);
    setNewName("");
  }, [cancelEdit]);

  const cancelAdd = useCallback(() => {
    setIsAdding(false);
    setNewName("");
  }, []);

  const saveAdd = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const result = await createPosition(trimmed);
      if (result.error) {
        showError(result.error);
        return;
      }
      if (result.positionId) {
        setPositions((prev) => [
          ...prev,
          {
            id: result.positionId!,
            organization_id: organizationId ?? "",
            name: trimmed,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      showSuccess("Position added.");
      await invalidatePositions();
      cancelAdd();
    } finally {
      setSaving(false);
    }
  }, [
    newName,
    cancelAdd,
    organizationId,
    showError,
    showSuccess,
    invalidatePositions,
  ]);

  return (
    <SettingsSection
      title="Positions"
      description="Roles used when scheduling shifts."
    >
      {positions.length === 0 && !isAdding ? (
        <Card className="flex min-h-[120px] flex-col items-center justify-center gap-3 border-dashed bg-subtle/50 px-4 py-8">
          <p className="text-sm text-text-secondary">No positions yet</p>
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={startAdd}
            disabled={saving}
          >
            <Plus className="h-4 w-4" />
            Add Position
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <ul className="divide-y divide-border rounded-lg border border-border">
            {positions.map((position) => {
              const isEditing = editingId === position.id;

              return (
                <li
                  key={position.id}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between lg:p-4"
                >
                  {isEditing ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        aria-label="Edit position name"
                        className="sm:max-w-xs"
                        autoFocus
                        disabled={saving}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void saveEdit();
                          if (event.key === "Escape") cancelEdit();
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 flex-1 sm:flex-none"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 flex-1 sm:flex-none"
                          onClick={() => void saveEdit()}
                          disabled={!editingName.trim() || saving}
                        >
                          Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-text-primary">
                        {position.name}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 flex-1 sm:flex-none"
                          onClick={() => startEdit(position)}
                          disabled={saving}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-9 flex-1 text-status-rejected sm:flex-none",
                            "hover:bg-status-rejected-bg hover:text-status-rejected",
                          )}
                          onClick={() => void deletePositionHandler(position.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {isAdding ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-subtle/50 p-3 lg:p-4">
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Position name"
                aria-label="New position name"
                autoFocus
                disabled={saving}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void saveAdd();
                  if (event.key === "Escape") cancelAdd();
                }}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 sm:flex-none"
                  onClick={cancelAdd}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-10 flex-1 sm:flex-none"
                  onClick={() => void saveAdd()}
                  disabled={!newName.trim() || saving}
                >
                  Add Position
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full sm:w-auto"
              onClick={startAdd}
              disabled={saving}
            >
              <Plus className="h-4 w-4" />
              Add Position
            </Button>
          )}
        </div>
      )}
    </SettingsSection>
  );
}
