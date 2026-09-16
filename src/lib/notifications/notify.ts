import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationType } from "@/types/notifications";

export type NotifyPayload = {
  type: NotificationType;
  title: string;
  meta: string;
  href?: string;
};

export async function notifyUsers(
  userIds: string[],
  organizationId: string,
  payload: NotifyPayload,
): Promise<void> {
  if (userIds.length === 0) return;

  const admin = createAdminClient();
  const rows = userIds.map((userId) => ({
    user_id: userId,
    organization_id: organizationId,
    type: payload.type,
    title: payload.title,
    meta: payload.meta,
    href: payload.href ?? "/requests",
    unread: true,
  }));

  const { error } = await admin.from("notifications").insert(rows);
  if (error) {
    console.error("Failed to create notifications:", error.message);
  }
}

export async function getManagerUserIds(
  organizationId: string,
): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("organization_id", organizationId)
    .in("role", ["owner", "manager"]);

  if (error || !data) {
    return [];
  }
  return data.map((row) => row.id as string);
}

export async function getProfileIdForEmployee(
  employeeId: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("employees")
    .select("profile_id")
    .eq("id", employeeId)
    .maybeSingle();

  if (!data?.profile_id) {
    return null;
  }
  return data.profile_id as string;
}
