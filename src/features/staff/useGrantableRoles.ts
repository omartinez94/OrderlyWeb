/**
 * useGrantableRoles — memoized selector over the current actor's
 * roles that returns the set of roles they are allowed to grant
 * to other staff members.
 *
 * Rule table (per `docs/website-spec.md` §4.3 and the
 * staff-management plan §6.2):
 *
 *   - SuperAdmin       → can grant every role, including itself.
 *   - RestaurantAdmin  → can grant Manager / KitchenManager /
 *                          KitchenStaff / Waiter / Cashier / Host.
 *                          Cannot grant SuperAdmin or another
 *                          RestaurantAdmin (no privilege escalation).
 *   - Manager and below → no grant authority. The selector returns
 *                          an empty list; the form disables the
 *                          section.
 *
 * The selector is **UX-only**. The Identity Service is the source
 * of truth — every mutation re-checks authorization independently.
 * A 403 surfaces inline if the client somehow sends an
 * ungrantable role.
 */

import { createSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "../../app/hooks";

const NON_SUPERADMIN_GRANTABLE: readonly Role[] = [
  "Manager",
  "KitchenManager",
  "KitchenStaff",
  "Waiter",
  "Cashier",
  "Host",
];

const ALL_ROLES = [
  "SuperAdmin",
  "RestaurantAdmin",
  "Manager",
  "KitchenManager",
  "KitchenStaff",
  "Waiter",
  "Cashier",
  "Host",
] as const;

import type { Role } from "../../types/auth";

const grantableRolesSelector = createSelector(
  [(state: { session: { roles: readonly Role[] } }) => state.session.roles],
  (actorRoles): readonly Role[] => {
    if (actorRoles.includes("SuperAdmin")) return ALL_ROLES;
    if (actorRoles.includes("RestaurantAdmin")) return NON_SUPERADMIN_GRANTABLE;
    return [];
  },
);

export function useGrantableRoles(): readonly Role[] {
  return useAppSelector(grantableRolesSelector);
}
