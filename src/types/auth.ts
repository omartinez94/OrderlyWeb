/**
 * Auth contracts — the eight staff roles, the permission shape, and
 * the predicate the guards consume.
 *
 * The auth plan (`.agents/plans/authentication-and-profile/auth-state-foundation.md`)
 * swaps the placeholder `useAuthPredicate` for a Redux-backed
 * implementation without changing the consumer code. The shape here
 * is the contract.
 */

export type Role =
  | "SuperAdmin"
  | "RestaurantAdmin"
  | "Manager"
  | "KitchenManager"
  | "KitchenStaff"
  | "Waiter"
  | "Cashier"
  | "Host";

export type Permission =
  | "brands:view"
  | "brands:create"
  | "brands:edit"
  | "brands:archive"
  | "restaurants:create"
  | "restaurants:edit"
  | "restaurants:archive"
  | "users:view_all"
  | "users:create"
  | "users:edit"
  | "users:assign_roles"
  | "users:assign_restaurants"
  | "roles:view"
  | "audit:view"
  | "settings:view"
  | "settings:edit";

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SuperAdmin: [
    "brands:view",
    "brands:create",
    "brands:edit",
    "brands:archive",
    "restaurants:create",
    "restaurants:edit",
    "restaurants:archive",
    "users:view_all",
    "users:create",
    "users:edit",
    "users:assign_roles",
    "users:assign_restaurants",
    "roles:view",
    "audit:view",
    "settings:view",
    "settings:edit",
  ],
  RestaurantAdmin: [
    "brands:view",
    "brands:edit",
    "restaurants:create",
    "restaurants:edit",
    "users:view_all",
    "users:create",
    "users:edit",
    "users:assign_roles",
    "users:assign_restaurants",
    "roles:view",
    "audit:view",
    "settings:view",
  ],
  Manager: ["brands:view", "users:view_all", "audit:view"],
  KitchenManager: [],
  KitchenStaff: [],
  Waiter: [],
  Cashier: [],
  Host: [],
};

export interface AuthPredicate {
  isAuthenticated: boolean;
  roles: readonly Role[];
  permissions: readonly Permission[];
}

/**
 * Shorthand for `RequireRole` — instead of listing roles, name the
 * zone. Resolution is delegated to `defaultZone.ts` so guards and the
 * root redirect agree on the access matrix.
 */
export type ZoneAllow = "admin" | "kitchen" | "restaurant";
