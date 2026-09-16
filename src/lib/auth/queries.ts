import { cache } from "react";

import type { Organization, Profile } from "@/types/auth";
import { createClient } from "@/lib/supabase/server";

export const getSessionUser = cache(async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

export const getProfileForUser = cache(async function getProfileForUser(
  userId: string,
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, organization_id, role, first_name, last_name, phone, created_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Profile;
});

export const getOrganizationForProfile = cache(async function getOrganizationForProfile(
  organizationId: string,
): Promise<Organization | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(
      "id, business_name, phone, email, address, default_shift_start, default_shift_end, default_position_ids, created_at",
    )
    .eq("id", organizationId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Organization;
});

export const getAuthContext = cache(async function getAuthContext() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, profile: null, organization: null };
  }

  const profile = await getProfileForUser(user.id);
  const organization = profile
    ? await getOrganizationForProfile(profile.organization_id)
    : null;

  return { user, profile, organization };
});
