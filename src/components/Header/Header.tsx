import { RestaurantSwitcher } from './slots/RestaurantSwitcher';
import { Breadcrumb } from './slots/Breadcrumb';
import { OpsBadge } from './slots/OpsBadge';
import { NotificationsBell } from './slots/NotificationsBell';
import { UserMenu } from './slots/UserMenu';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import type {
  AppNotification,
  CurrentUser,
  Restaurant,
  Zone,
} from './types';
import './Header.css';

/**
 * App Header — the persistent top bar consumed by all three zone
 * layouts (admin, kitchen, restaurant). Anchors orientation, carries
 * the multi-restaurant switcher, surfaces live operational data on
 * the floor and kitchen, hosts the notifications bell, and gates
 * account / theme controls.
 *
 * Direction contract (locked by shape brief):
 *   THESIS   : A six-slot fixed top bar that always tells the user
 *              where they are and how loaded their floor is.
 *   OWN-WORLD: Quiet Workshop. Sage Linen ground, hairline Linen
 *              Edge bottom border, hybrid elevation, two-family
 *              typography, service hues for ops load.
 *   STORY    : Land anywhere → read restaurant + zone → see live ops
 *              on floor/kitchen → switch context in one click.
 *   VIEWPORT : [Switcher | Breadcrumb | (spacer) | OpsBadge (f/k) |
 *               Bell | Theme | User], 64px tall, fixed, full width.
 *   FORM     : Brief-locked six-slot composition.
 *
 * The Header is a controlled component. State and live data are
 * supplied by props so the wiring layer (Redux + RTK Query + SignalR)
 * can replace the mock data without touching this file.
 */

export interface HeaderProps {
  zone: Zone;
  currentRestaurantId: string;
  restaurants: Restaurant[];
  notifications: AppNotification[];
  /** In-progress order count. Required for kitchen/restaurant, ignored on admin. */
  opsCount?: number;
  user: CurrentUser;
  onRestaurantChange?: (id: string) => void;
  onNotificationClick?: (id: string) => void;
  onMarkAllRead?: () => void;
  onProfile?: () => void;
  onLogout?: () => void;
}

export function Header({
  zone,
  currentRestaurantId,
  restaurants,
  notifications,
  opsCount,
  user,
  onRestaurantChange,
  onNotificationClick,
  onMarkAllRead,
  onProfile,
  onLogout,
}: HeaderProps) {
  const currentRestaurant = restaurants.find((r) => r.id === currentRestaurantId);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const showOpsBadge = zone !== 'admin' && opsCount != null && opsCount > 0;

  return (
    <header className="ds-header" role="banner">
      <div className="ds-header__left">
        <RestaurantSwitcher
          restaurants={restaurants}
          currentRestaurantId={currentRestaurantId}
          onChange={onRestaurantChange}
        />
        <Breadcrumb
          zone={zone}
          restaurantName={currentRestaurant?.name}
        />
      </div>

      <div className="ds-header__right">
        {showOpsBadge && (
          <OpsBadge count={opsCount as number} zone={zone} />
        )}
        <NotificationsBell
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationClick={onNotificationClick}
          onMarkAllRead={onMarkAllRead}
        />
        <ThemeToggle />
        <UserMenu
          user={user}
          onProfile={onProfile}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
