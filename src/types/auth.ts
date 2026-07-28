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

export type Permission = string;

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
