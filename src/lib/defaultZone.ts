/**
 * Default-zone resolution — the canonical role-to-zone mapping that
 * powers the root `/` redirect and the `RequireRole` zone shorthand.
 *
 * Source of truth: `docs/website-spec.md` §4.1 (root redirect rules)
 * and §4.3 (role access matrix).
 *
 * The mapping is intentionally deterministic: the highest-privilege
 * zone the user can access wins. The order of the role checks
 * matters — the first match wins. This is also documented in
 * `routing-foundation.md` §10.4.
 */

import type { Role } from "../types/auth";
import { PATH } from "../router/pathNames";

/**
 * The three top-level zones, in privilege order (highest first).
 * Used by both the default-zone redirect and the `RequireRole`
 * zone shorthand so the *order* of resolution is consistent.
 */
export const ZONE_ACCESS: Record<"admin" | "kitchen" | "restaurant", readonly Role[]> = {
  admin: ["SuperAdmin", "RestaurantAdmin", "Manager"],
  kitchen: ["KitchenManager", "KitchenStaff"],
  restaurant: [
    "Manager",
    "Waiter",
    "Cashier",
    "Host",
    "RestaurantAdmin",
    "KitchenManager",
    "SuperAdmin",
  ],
};

/**
 * Pick the canonical default zone for a set of roles.
 *
 * Resolution order:
 *   1. SuperAdmin → `/site/admin`
 *   2. KitchenManager / KitchenStaff → `/site/kitchen`
 *   3. Manager / RestaurantAdmin / Waiter / Cashier / Host → `/site/restaurant`
 *   4. No matching role → `null` (caller stays on `/`).
 *
 * The function is pure: it does not consult any store or runtime
 * state. Inputs are explicit.
 */
export function defaultZoneForRoles(roles: readonly Role[]): string | null {
  if (roles.includes("SuperAdmin")) return PATH.ADMIN;
  if (roles.includes("KitchenManager") || roles.includes("KitchenStaff")) return PATH.KITCHEN;
  if (
    roles.includes("Manager") ||
    roles.includes("RestaurantAdmin") ||
    roles.includes("Waiter") ||
    roles.includes("Cashier") ||
    roles.includes("Host")
  ) {
    return PATH.RESTAURANT;
  }
  return null;
}

/**
 * Whether a given role-list is allowed to access a named zone.
 * Used by `RequireRole` to resolve the `allow` shorthand.
 */
export function canAccessZone(
  zone: "admin" | "kitchen" | "restaurant",
  roles: readonly Role[],
): boolean {
  return roles.some((r) => ZONE_ACCESS[zone].includes(r));
}
