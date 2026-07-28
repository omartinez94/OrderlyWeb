/**
 * useAuthPredicate — Phase 2 placeholder implementation.
 *
 * Returns a hardcoded `AuthPredicate` so the guards, zone layouts,
 * and root redirect can be exercised in tests and during dev
 * without a real auth slice. The auth plan swaps this hook for a
 * Redux-backed implementation without changing the consumer code.
 *
 * Active role:
 *   - `SuperAdmin` in development (full access to every zone).
 *   - The auth plan replaces this with a real session lookup.
 *
 * The hook is intentionally synchronous and stable: it returns
 * the same object reference on every render so consumers can put
 * it in dependency arrays without re-running effects.
 */

import { useMemo } from "react";
import type { AuthPredicate } from "../../types/auth";

const PLACEHOLDER_PREDICATE: AuthPredicate = {
  // Placeholder returns a set of roles that has access to every
  // zone so the routing plumbing can be exercised end-to-end
  // without an auth slice. The default-zone redirect picks
  // /site/admin first (highest privilege).
  isAuthenticated: true,
  roles: ["SuperAdmin", "KitchenManager", "Manager"],
  permissions: [],
};

export function useAuthPredicate(): AuthPredicate {
  return useMemo(() => PLACEHOLDER_PREDICATE, []);
}
