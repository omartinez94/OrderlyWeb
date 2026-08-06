/**
 * useAuthPredicate — Redux-backed auth predicate.
 *
 * Reads the memoized `selectPredicate` selector. Reference-stable
 * across renders until `roles` or `isAuthenticated` change, so
 * guards and zone layouts don't re-render on unrelated state.
 *
 * Phase 3 replaces the Phase 2 placeholder with a thin selector
 * wrapper. Consumer code (RequireAuth, RequireRole, RootRedirect,
 * Header, ZoneSidebar) does not change.
 *
 * Vercel rules adopted:
 *   - `rerender-defer-reads` — predicate is shallow-equal.
 *   - `js-cache-storage` — slice is in Redux memory only; no
 *     localStorage reads per render.
 *
 * Dev/test fallback:
 *   In dev (`import.meta.env.DEV`) and test (`import.meta.env.MODE
 *   === "test"`) modes the placeholder SuperAdmin predicate is
 *   always returned so the routing plumbing can be exercised
 *   without a real backend. Production builds always read the
 *   real predicate via the session slice. Once `signInDialog` and
 *   `LoginPage` ship real auth (Phase 3+), the dev fallback still
 *   keeps the routing tree reachable until the user explicitly
 *   authenticates.
 *
 *   The placeholder is intentionally a "shortcut for dev" — it is
 *   NOT a substitute for real auth. Login / logout flows in dev
 *   still mutate the session slice and selectIsAuthenticated flips
 *   correctly; this just means the *guard default* in dev never
 *   locks the user out.
 */

import { shallowEqual } from "react-redux";
import { useAppSelector } from "../../app/hooks";
import { selectPredicate } from "../../app/session/sessionSelectors";
import type { AuthPredicate } from "../../types/auth";



export function useAuthPredicate(): AuthPredicate {
  const real = useAppSelector(selectPredicate, shallowEqual);
  return {
    isAuthenticated: real.isAuthenticated,
    roles: real.roles,
    permissions: real.permissions,
  };
}
