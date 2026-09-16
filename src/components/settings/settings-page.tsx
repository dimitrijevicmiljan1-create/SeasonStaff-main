"use client";

import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { updateOrganizationSettings } from "@/lib/settings/actions";
import { pageContainer, pageStack } from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import { AccountSettingsSection } from "@/components/settings/account-settings-section";
import { PositionsSection } from "@/components/settings/positions-section";
import { SettingsSection } from "@/components/settings/settings-section";
import { TeamSection } from "@/components/settings/team-section";
import type { AppRole, Profile } from "@/types/auth";
import type { Position } from "@/types/employees";
import type {
  BusinessInfoForm,
  ShiftDefaultsForm,
} from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

interface SettingsPageProps {
  role: AppRole;
  initialProfile: Profile;
  initialBusinessInfo: BusinessInfoForm;
  initialShiftDefaults: ShiftDefaultsForm;
  initialDefaultPositionIds: string[];
  initialPositions: Position[];
}

export function SettingsPage({
  role,
  initialProfile,
  initialBusinessInfo,
  initialShiftDefaults,
  initialDefaultPositionIds,
  initialPositions,
}: SettingsPageProps) {
  const { refresh } = useAuth();
  const { showSuccess, showError } = useToast();
  const isOwner = role === "owner";

  const [businessInfo, setBusinessInfo] =
    useState<BusinessInfoForm>(initialBusinessInfo);
  const [shiftDefaults, setShiftDefaults] =
    useState<ShiftDefaultsForm>(initialShiftDefaults);
  const [defaultPositionIds, setDefaultPositionIds] = useState<string[]>(
    initialDefaultPositionIds,
  );
  const [saving, setSaving] = useState(false);

  const toggleDefaultPosition = useCallback((positionId: string) => {
    setDefaultPositionIds((prev) =>
      prev.includes(positionId)
        ? prev.filter((id) => id !== positionId)
        : [...prev, positionId],
    );
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await updateOrganizationSettings({
        businessName: businessInfo.businessName,
        phone: businessInfo.phone,
        email: businessInfo.email,
        address: businessInfo.address,
        defaultStartTime: shiftDefaults.defaultStartTime,
        defaultEndTime: shiftDefaults.defaultEndTime,
        defaultPositionIds,
      });
      if (result.error) {
        showError(result.error);
        return;
      }
      showSuccess("Changes saved.");
      await refresh();
    } finally {
      setSaving(false);
    }
  }, [
    businessInfo,
    defaultPositionIds,
    refresh,
    shiftDefaults,
    showError,
    showSuccess,
  ]);

  return (
    <div className={cn(pageContainer, pageStack, "pb-24 lg:pb-6")}>
      <AccountSettingsSection initialProfile={initialProfile} />

      <SettingsSection
        title="Business Information"
        description="Basic details shown on schedules and notifications."
      >
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <FormField id="business-name" label="Business Name">
            <Input
              id="business-name"
              value={businessInfo.businessName}
              disabled={!isOwner}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  businessName: event.target.value,
                }))
              }
            />
          </FormField>

          <FormField id="business-phone" label="Phone">
            <Input
              id="business-phone"
              type="tel"
              value={businessInfo.phone}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  phone: event.target.value,
                }))
              }
            />
          </FormField>

          <FormField id="business-email" label="Email">
            <Input
              id="business-email"
              type="email"
              value={businessInfo.email}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
            />
          </FormField>

          <FormField id="business-address" label="Address">
            <Input
              id="business-address"
              value={businessInfo.address}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  address: event.target.value,
                }))
              }
            />
          </FormField>
        </div>
        {!isOwner && (
          <p className="mt-3 text-xs text-text-secondary">
            Only the owner can change the business name.
          </p>
        )}
      </SettingsSection>

      <SettingsSection
        title="Shift Defaults"
        description="Default times and positions applied when creating new shifts."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          <FormField id="shift-start" label="Default Shift Start Time">
            <Input
              id="shift-start"
              type="time"
              value={shiftDefaults.defaultStartTime}
              onChange={(event) =>
                setShiftDefaults((prev) => ({
                  ...prev,
                  defaultStartTime: event.target.value,
                }))
              }
            />
          </FormField>

          <FormField id="shift-end" label="Default Shift End Time">
            <Input
              id="shift-end"
              type="time"
              value={shiftDefaults.defaultEndTime}
              onChange={(event) =>
                setShiftDefaults((prev) => ({
                  ...prev,
                  defaultEndTime: event.target.value,
                }))
              }
            />
          </FormField>
        </div>

        {initialPositions.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-text-primary">
              Default positions
            </p>
            <ul className="flex flex-wrap gap-2">
              {initialPositions.map((position) => {
                const selected = defaultPositionIds.includes(position.id);
                return (
                  <li key={position.id}>
                    <button
                      type="button"
                      onClick={() => toggleDefaultPosition(position.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        selected
                          ? "border-accent bg-accent-subtle text-accent"
                          : "border-border bg-surface text-text-secondary hover:bg-subtle",
                      )}
                    >
                      {position.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </SettingsSection>

      <PositionsSection initialPositions={initialPositions} />

      {isOwner && <TeamSection />}

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface/95 px-3 py-3 backdrop-blur-sm lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none",
        )}
      >
        <div className="pointer-events-auto mx-auto flex max-w-[1200px] items-center gap-3 lg:justify-end">
          <Button
            type="button"
            className="h-11 flex-1 lg:h-10 lg:flex-none lg:min-w-[140px]"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
