import { redirect } from "next/navigation";

import { AccountSettingsSection } from "@/components/settings/account-settings-section";
import { SettingsPage } from "@/components/settings/settings-page";
import { getAuthContext } from "@/lib/auth/queries";
import { pageContainer, pageStack } from "@/lib/page-styles";
import { fetchPositionsServer } from "@/lib/positions/queries.server";
import { fetchOrganizationSettings } from "@/lib/settings/queries.server";
import { cn } from "@/lib/utils";

export default async function SettingsRoute() {
  const { profile } = await getAuthContext();

  if (!profile) {
    redirect("/setup");
  }

  if (!["owner", "manager"].includes(profile.role)) {
    return (
      <div className={cn(pageContainer, pageStack, "pb-24 lg:pb-6")}>
        <AccountSettingsSection initialProfile={profile} />
      </div>
    );
  }

  const [initialPositions, orgSettings] = await Promise.all([
    fetchPositionsServer(profile.organization_id),
    fetchOrganizationSettings(profile.organization_id),
  ]);

  if (!orgSettings) {
    redirect("/setup");
  }

  return (
    <SettingsPage
      role={profile.role}
      initialProfile={profile}
      initialBusinessInfo={orgSettings.businessInfo}
      initialShiftDefaults={orgSettings.shiftDefaults}
      initialDefaultPositionIds={orgSettings.defaultPositionIds}
      initialPositions={initialPositions}
    />
  );
}
