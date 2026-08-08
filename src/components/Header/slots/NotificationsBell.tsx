import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import type { AppNotification } from "../types";
import { BellIcon, CheckIcon } from "../icons";

import { formatRelativeTime } from "../../../utils/date";

/**
 * Notifications bell + popover inbox.
 * - Badge hidden at 0.
 * - 1-99: Tilled Teal pill with the count.
 * - 99+: "99+" cap.
 * - Popover is HeadlessUI, anchored bottom-end (right-aligned to the bell).
 * - Empty state copy: "You're all caught up" (placeholder; voice is
 *   professional/neutral per PRODUCT.md).
 */
export interface NotificationsBellProps {
  notifications: AppNotification[];
  unreadCount: number;
  onNotificationClick?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationsBell({
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAllRead,
}: NotificationsBellProps) {
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <Popover>
      <PopoverButton
        className="ds-bell"
        aria-label={
          unreadCount === 0 ? "Notifications, none unread" : `Notifications, ${unreadCount} unread`
        }
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="ds-bell__badge" aria-hidden="true">
            {badgeLabel}
          </span>
        )}
      </PopoverButton>
      <PopoverPanel className="ds-notifications-popover" anchor="bottom end" transition>
        <div className="ds-notifications-popover__header">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              className="ds-notifications-popover__mark-all"
              onClick={onMarkAllRead}
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="ds-notifications-popover__empty">
            <CheckIcon
              className="ds-notifications-popover__empty-icon"
              size={32}
              strokeWidth={1.5}
            />
            <span>You're all caught up</span>
          </div>
        ) : (
          <div className="ds-notifications-popover__list">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className="ds-notifications-popover__item"
                data-unread={!n.read || undefined}
                onClick={() => onNotificationClick?.(n.id)}
              >
                <div className="ds-notifications-popover__item-title">
                  {!n.read && (
                    <span
                      className="ds-notifications-popover__item-unread-dot"
                      aria-hidden="true"
                    />
                  )}
                  <span>{n.title}</span>
                </div>
                <div className="ds-notifications-popover__item-body">{n.body}</div>
                <div className="ds-notifications-popover__item-time">
                  {formatRelativeTime(n.timestamp)}
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverPanel>
    </Popover>
  );
}
