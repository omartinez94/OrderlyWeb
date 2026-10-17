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
  ADMIN_BRANDS: "/site/admin/brands",
  ADMIN_BRAND_NEW: "/site/admin/brands/new",
  ADMIN_BRAND_DETAIL: "/site/admin/brands/:id",
  ADMIN_BRAND_RESTAURANTS: "/site/admin/brands/:id/restaurants",
  ADMIN_BRAND_STAFF: "/site/admin/brands/:id/staff",
  ADMIN_BRAND_SETTINGS: "/site/admin/brands/:id/settings",
  ADMIN_BRAND_AUDIT: "/site/admin/brands/:id/audit",
  ADMIN_RESTAURANTS: "/site/admin/restaurants",
  ADMIN_RESTAURANT_NEW: "/site/admin/restaurants/new",
  ADMIN_RESTAURANT_DETAIL: "/site/admin/restaurants/:id",
  ADMIN_RESTAURANT_STAFF: "/site/admin/restaurants/:id/staff",
  ADMIN_RESTAURANT_SETTINGS: "/site/admin/restaurants/:id/settings",
  ADMIN_RESTAURANT_AUDIT: "/site/admin/restaurants/:id/audit",
  ADMIN_USERS: "/site/admin/users",
  ADMIN_AUDIT: "/site/admin/audit",
  ADMIN_ROLES: "/site/admin/roles",
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
  BRAND_ID: "brandId",
  ROLE: "role",
  QUERY: "q",
  STATUS: "status",
  ORDER_TYPE: "orderType",
  PAGE: "page",
  PAGE_SIZE: "pageSize",
  TABLE_ID: "tableId",
  GUEST_COUNT: "guestCount",
  /** Legacy alias preserved for the showcase + dev surfaces. */
  SHOWCASE: "showcase",
} as const;
