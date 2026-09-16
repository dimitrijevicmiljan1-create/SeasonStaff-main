"use server";

import { getPostAuthRedirect } from "@/lib/auth/constants";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { seedDefaultPositions } from "@/lib/positions/defaults";

export type AuthActionResult = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

function formatAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (message.includes("User already registered")) {
    return "An account with this email already exists.";
  }
  return message;
}

export async function signUpOwner(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = await createClient();
  const siteUrl = getSiteUrl();

  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/setup`,
    },
  });

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  return { success: true };
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  if (!data.user) {
    return { error: "Sign in failed." };
  }

  // Query using the same client that has the session — avoids a new client
  // that might not see the freshly-set session cookies within this request.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, organization_id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    return { success: true, redirectTo: "/setup" };
  }

  return { success: true, redirectTo: getPostAuthRedirect(profile.role) };
}

export async function signOut(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  return { success: true };
}

export async function sendPasswordReset(
  email: string,
): Promise<AuthActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: false },
  });

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  return { success: true };
}

export async function verifyPasswordResetOtp(
  email: string,
  token: string,
): Promise<AuthActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: "email",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(
  password: string,
): Promise<AuthActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  return { success: true };
}

export interface CreateOrganizationInput {
  business_name: string;
  org_phone?: string;
  org_email?: string;
  address?: string;
  first_name?: string;
  last_name?: string;
  profile_phone?: string;
}

export async function createOrganizationAndProfile(
  input: CreateOrganizationInput,
): Promise<AuthActionResult & { organizationId?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to complete setup." };
  }

  // Use the same client that already has the session rather than creating a
  // new one — avoids the session not being visible to a fresh client.
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return {
      success: true,
      redirectTo: getPostAuthRedirect(existingProfile.role as string),
    };
  }

  const { error } = await supabase.rpc(
    "create_organization_and_profile",
    {
      p_business_name: input.business_name.trim(),
      p_org_phone: input.org_phone?.trim() || null,
      p_org_email: input.org_email?.trim() || null,
      p_address: input.address?.trim() || null,
      p_first_name: input.first_name?.trim() || null,
      p_last_name: input.last_name?.trim() || null,
      p_profile_phone: input.profile_phone?.trim() || null,
    },
  );

  if (error) {
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.organization_id) {
    await seedDefaultPositions(supabase, profile.organization_id);
  }

  return { success: true };
}
