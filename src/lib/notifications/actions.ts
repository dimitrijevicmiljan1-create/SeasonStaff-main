"use server";

import { isDemoMode } from "@/lib/demo/config";
import {
  getDemoRequestListItems,
  markAllDemoNotificationsRead,
  markDemoNotificationRead,
  updateDemoRequestStatus,
} from "@/lib/demo/store";
import { fetchNotificationsForUser } from "@/lib/notifications/queries.server";
import { getProfileForUser } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/notifications";

export type NotificationActionResult = {
  error?: string;
  success?: boolean;
};

export async function getMyNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { notifications: [], unreadCount: 0 };
  }

  const notifications = await fetchNotificationsForUser(user.id);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return { notifications, unreadCount };
}

export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationActionResult> {
  if (isDemoMode()) {
    if (!markDemoNotificationRead(notificationId)) {
      return { error: "Notification not found." };
    }
    return { success: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const profile = await getProfileForUser(user.id);
  if (!profile) {
    return { error: "Profile not found." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ unread: false })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .eq("organization_id", profile.organization_id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  if (isDemoMode()) {
    markAllDemoNotificationsRead();
    return { success: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const profile = await getProfileForUser(user.id);
  if (!profile) {
    return { error: "Profile not found." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ unread: false })
    .eq("user_id", user.id)
    .eq("organization_id", profile.organization_id)
    .eq("unread", true);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
