/**
 * Single source of truth for path strings used by the router.
 *
 * Why a constants file:
 *   - Avoids stringly-typed routes scattered across the codebase.
 *   - One renaming find-and-replace if the URL surface changes.
 *   - Makes guards, tests, and link generators reference the same value.
 */

export const PATH = {
  HOME: "/home",
  LOGIN: "/login",
  PROFILE: "/profile",
  NOT_FOUND: "*",

  // Three zones — one path prefix per top-level zone.
  ADMIN: "/site/admin",
  KITCHEN: "/site/kitchen",
  RESTAURANT: "/site/restaurant",

  // Admin zone children.
  ADMIN_STAFF: "/site/admin/staff",
  ADMIN_STAFF_NEW: "/site/admin/staff/new",
  ADMIN_STAFF_DETAIL: "/site/admin/staff/:id",
  ADMIN_RESTAURANTS: "/site/admin/restaurants",
  ADMIN_RESTAURANT_DETAIL: "/site/admin/restaurants/:id",
  ADMIN_SETTINGS: "/site/admin/settings",

  // Kitchen zone children.
  KITCHEN_ORDER_DETAIL: "/site/kitchen/order/:id",
  KITCHEN_SETTINGS: "/site/kitchen/settings",

  // Restaurant zone children.
  RESTAURANT_ORDERS: "/site/restaurant/orders",
  RESTAURANT_ORDER_NEW: "/site/restaurant/orders/new",
  RESTAURANT_ORDER_DETAIL: "/site/restaurant/orders/:id",
  RESTAURANT_ORDER_SPLIT: "/site/restaurant/orders/:id/split-bill",
  RESTAURANT_TABLES: "/site/restaurant/tables",
  RESTAURANT_MENU: "/site/restaurant/menu",
  RESTAURANT_RESERVATIONS: "/site/restaurant/reservations",
  RESTAURANT_QUEUE: "/site/restaurant/queue",
  RESTAURANT_FEEDBACK: "/site/restaurant/feedback",
  RESTAURANT_ANALYTICS: "/site/restaurant/analytics",

  // Development surfaces.
  SHOWCASE: "/showcase",
} as const;

export type PathKey = keyof typeof PATH;

/**
 * Query param keys. The restaurant ID is the only URL state for the
 * MVP; future filters that must be shareable will land here.
 */
export const QUERY_PARAM = {
  RESTAURANT_ID: "restaurantId",
  /** Legacy alias preserved for the showcase + dev surfaces. */
  SHOWCASE: "showcase",
} as const;
