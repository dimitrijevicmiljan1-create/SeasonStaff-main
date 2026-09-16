"use client";

import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { updatePassword } from "@/lib/auth/actions";
import { updateAccountProfile } from "@/lib/settings/actions";
import type { AccountProfileInput } from "@/types/settings";
import type { Profile } from "@/types/auth";
import { SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AccountSettingsSectionProps {
  initialProfile: Profile;
}

export function AccountSettingsSection({
  initialProfile,
}: AccountSettingsSectionProps) {
  const { refresh } = useAuth();
  const { showSuccess, showError } = useToast();
  const [firstName, setFirstName] = useState(initialProfile.first_name ?? "");
  const [lastName, setLastName] = useState(initialProfile.last_name ?? "");
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = useCallback(async () => {
    setSavingProfile(true);
    try {
      const input: AccountProfileInput = {
        firstName,
        lastName,
        phone,
      };
      const result = await updateAccountProfile(input);
      if (result.error) {
        showError(result.error);
        return;
      }
      showSuccess("Account updated.");
      await refresh();
    } finally {
      setSavingProfile(false);
    }
  }, [firstName, lastName, phone, refresh, showError, showSuccess]);

  const savePassword = useCallback(async () => {
    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const result = await updatePassword(password);
      if (result.error) {
        showError(result.error);
        return;
      }
      showSuccess("Password updated.");
      setPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } finally {
      setSavingPassword(false);
    }
  }, [confirmPassword, password, showError, showSuccess]);

  return (
    <SettingsSection
      title="Account Settings"
      description="Your personal account details and password."
    >
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <div className="space-y-2">
          <Label htmlFor="account-first-name">First Name</Label>
          <Input
            id="account-first-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-last-name">Last Name</Label>
          <Input
            id="account-last-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="account-phone">Phone</Label>
          <Input
            id="account-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={savingProfile}
          onClick={() => void saveProfile()}
        >
          {savingProfile ? "Saving…" : "Save account"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowPasswordForm((prev) => !prev)}
        >
          {showPasswordForm ? "Cancel password change" : "Change password"}
        </Button>
      </div>

      {showPasswordForm && (
        <div className="mt-4 grid max-w-md gap-4 rounded-lg border border-border bg-subtle/30 p-4">
          <div className="space-y-2">
            <Label htmlFor="account-password">New password</Label>
            <Input
              id="account-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-confirm-password">Confirm password</Label>
            <Input
              id="account-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={savingPassword}
            onClick={() => void savePassword()}
          >
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </div>
      )}
    </SettingsSection>
  );
}
