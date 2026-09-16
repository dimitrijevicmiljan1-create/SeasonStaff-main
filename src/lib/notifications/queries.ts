export const notificationsQueryKey = (userId: string) =>
  ["notifications", userId] as const;

export const unreadNotificationsQueryKey = (userId: string) =>
  ["notifications", "unread-count", userId] as const;
