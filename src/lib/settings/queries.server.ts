import { formatTimeFromDb } from "@/lib/shifts/utils";
import { createClient } from "@/lib/supabase/server";
import type { BusinessInfoForm, ShiftDefaultsForm } from "@/types/settings";

const ORG_SETTINGS_SELECT =
  "id, business_name, phone, email, address, default_shift_start, default_shift_end, default_position_ids, created_at";

const DEFAULT_SHIFT_START = "09:00";
const DEFAULT_SHIFT_END = "17:00";

export interface OrganizationSettingsData {
  businessInfo: BusinessInfoForm;
  shiftDefaults: ShiftDefaultsForm;
  defaultPositionIds: string[];
}

function mapOrganizationSettings(
  row: Record<string, unknown>,
): OrganizationSettingsData {
  const startRaw = row.default_shift_start;
  const endRaw = row.default_shift_end;

  return {
    businessInfo: {
      businessName: String(row.business_name ?? ""),
      phone: String(row.phone ?? ""),
      email: String(row.email ?? ""),
      address: String(row.address ?? ""),
    },
    shiftDefaults: {
      defaultStartTime: startRaw
        ? formatTimeFromDb(String(startRaw))
        : DEFAULT_SHIFT_START,
      defaultEndTime: endRaw
        ? formatTimeFromDb(String(endRaw))
        : DEFAULT_SHIFT_END,
    },
    defaultPositionIds: Array.isArray(row.default_position_ids)
      ? (row.default_position_ids as string[])
      : [],
  };
}

export async function fetchOrganizationSettings(
  organizationId: string,
): Promise<OrganizationSettingsData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(ORG_SETTINGS_SELECT)
    .eq("id", organizationId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapOrganizationSettings(data as Record<string, unknown>);
}

export { DEFAULT_SHIFT_END, DEFAULT_SHIFT_START };
