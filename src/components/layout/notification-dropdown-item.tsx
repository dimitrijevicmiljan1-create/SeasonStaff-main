import { createElement } from "react";
import Link from "next/link";

import {
  getNotificationHref,
  getNotificationIcon,
  getNotificationIconStyles,
  getNotificationTypeLabel,
} from "@/lib/notification-utils";
import { sectionEyebrow } from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notifications";

interface NotificationDropdownItemProps {
  notification: Notification;
  timeLabel?: string;
  onNavigate?: () => void;
}

export function NotificationDropdownItem({
  notification,
  timeLabel,
  onNavigate,
}: NotificationDropdownItemProps) {
  const styles = getNotificationIconStyles(notification.type);
  const href = notification.href || getNotificationHref(notification.type);

  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
        notification.unread && "bg-accent-subtle/50",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          styles.container,
        )}
        aria-hidden
      >
        {createElement(getNotificationIcon(notification.type), {
          className: cn("h-4 w-4", styles.icon),
          strokeWidth: 1.5,
        })}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={sectionEyebrow}>
            {getNotificationTypeLabel(notification.type)}
          </p>
          {timeLabel ? (
            <span className="shrink-0 text-[10px] text-text-secondary">
              {timeLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm font-medium leading-snug text-text-primary">
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
          {notification.meta}
        </p>
      </div>

      {notification.unread && (
        <span
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent"
          aria-label="Unread"
        />
      )}
    </Link>
  );
}
