import { isDemoMode } from "@/lib/demo/config";
import {
  getDemoNotifications,
  getDemoUnreadNotificationCount,
} from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/notifications";

const NOTIFICATION_SELECT =
  "id, user_id, organization_id, type, title, meta, href, unread, created_at";

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    organization_id: String(row.organization_id),
    type: row.type as Notification["type"],
    title: String(row.title),
    meta: String(row.meta ?? ""),
    href: String(row.href ?? "/requests"),
    unread: Boolean(row.unread),
    created_at: String(row.created_at),
  };
}

export async function fetchNotificationsForUser(
  userId: string,
  limit = 20,
): Promise<Notification[]> {
  if (isDemoMode()) {
    return getDemoNotifications(userId).slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row) =>
    mapNotification(row as Record<string, unknown>),
  );
}

export async function fetchUnreadNotificationCount(
  userId: string,
): Promise<number> {
  if (isDemoMode()) {
    return getDemoUnreadNotificationCount(userId);
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("unread", true);

  if (error) {
    return 0;
  }
  return count ?? 0;
}
