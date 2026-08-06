/**
 * headerSelectors — selectors consumed by the Header slot components.
 *
 * These read directly from RTK Query cache slices (notifications,
 * orders, kitchen) so the Header reacts to RTK Query cache updates
 * without subscribing to full queries. The selectors are memoized
 * via `createSelector` so the Header doesn't re-render on unrelated
 * cache changes.
 *
 * Vercel rules adopted:
 *   - `rerender-defer-reads` — Header reads derived values, not raw.
 *   - `rerender-memo` — memoize `currentRestaurant`, `unreadCount`.
 *   - `client-event-listeners` — one SignalR hub, shared across
 *     selectors (see SignalRBoot).
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { AppNotification, Restaurant, RestaurantRole } from "../../components/Header/types";
import type { Zone } from "../../components/Header/types";
import type { OrderStatus } from "../../types/order";
import { selectUser } from "./sessionSelectors";

/**
 * Selectors for notifications — RTK Query stores the response shape
 * under `state[notificationsApi.reducerPath].queries['<endpoint>']`.
 * We type-assert to the cache shape (the slice keys are endpoint
 * descriptors, not stable strings).
 */

interface QueryState {
  data?: AppNotification[];
}
interface NotificationsCache {
  queries: Record<string, QueryState | undefined>;
}

const selectNotificationsQueries = (state: RootState) =>
  (state as unknown as { notificationsApi?: NotificationsCache }).notificationsApi?.queries;

export const selectNotifications = createSelector(
  [selectNotificationsQueries],
  (queries): AppNotification[] => {
    if (!queries) return [];
    for (const q of Object.values(queries)) {
      const data = q?.data;
      if (Array.isArray(data)) return data;
    }
    return [];
  },
);

export const selectUnreadCount = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter((n) => !n.read).length,
);

/**
 * Selectors for restaurants. The Header switcher uses the
 * user-scoped list (`identityApi.userRestaurants`), distinct from
 * the global `catalogApi.getRestaurants`. Both come from the
 * Identity Service in the backend; the user-scoped one powers the
 * "what can I switch to?" menu.
 */
interface RestaurantQueryState {
  data?: Array<{ id: string; name: string; role: RestaurantRole }>;
}
interface UserRestaurantsCache {
  queries: Record<string, RestaurantQueryState | undefined>;
}

const selectIdentityQueries = (state: RootState) =>
  (state as unknown as { identityApi?: UserRestaurantsCache }).identityApi?.queries;

export const selectAccessibleRestaurants = createSelector(
  [selectIdentityQueries],
  (queries): Restaurant[] => {
    if (!queries) return [];
    for (const q of Object.values(queries)) {
      const data = q?.data;
      if (Array.isArray(data)) {
        return data.map((r) => ({ id: r.id, name: r.name, role: r.role }));
      }
    }
    return [];
  },
);

/**
 * Selectors for the ops badge count.
 *
 * `selectOpsCountForZone` reads the orders cache and counts the
 * orders in the active zone's "in progress" set:
 *   - restaurant zone: acknowledged + preparing + plating
 *   - kitchen zone:    preparing + plating + ready
 *   - admin zone:      0 (the badge is hidden by the parent)
 *
 * Without an active `restaurantId` the count is 0.
 */
interface OrdersCacheQueryState {
  data?: Array<{ restaurantId: string; status: OrderStatus }>;
}
interface OrdersCache {
  queries: Record<string, OrdersCacheQueryState | undefined>;
}

function getOrdersForRestaurant(
  state: RootState,
  restaurantId: string | undefined,
): Array<{ restaurantId: string; status: OrderStatus }> {
  if (!restaurantId) return [];
  const cache = (state as unknown as { ordersApi?: OrdersCache }).ordersApi;
  if (!cache) return [];
  for (const q of Object.values(cache.queries)) {
    const data = q?.data;
    if (Array.isArray(data)) {
      return data.filter((o) => o.restaurantId === restaurantId);
    }
  }
  return [];
}

const IN_PROGRESS_RESTAURANT: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  "acknowledged",
  "preparing",
  "plating",
]);
const IN_PROGRESS_KITCHEN: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  "preparing",
  "plating",
  "ready",
]);

export const selectOpsCountForZone = (
  state: RootState,
  zone: Zone,
  restaurantId: string | undefined,
): number => {
  const orders = getOrdersForRestaurant(state, restaurantId);
  if (zone === "kitchen") return orders.filter((o) => IN_PROGRESS_KITCHEN.has(o.status)).length;
  if (zone === "restaurant")
    return orders.filter((o) => IN_PROGRESS_RESTAURANT.has(o.status)).length;
  return 0;
};

/**
 * Re-export so Header consumers can import from one place.
 */
export { selectUser };
