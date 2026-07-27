import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import type { AppNotification } from '../types';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <Popover>
      <PopoverButton
        className="ds-bell"
        aria-label={
          unreadCount === 0 ? 'Notifications, none unread' : `Notifications, ${unreadCount} unread`
        }
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
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
            <svg
              className="ds-notifications-popover__empty-icon"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
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
                  {relativeTime(n.timestamp)}
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverPanel>
    </Popover>
  );
}
