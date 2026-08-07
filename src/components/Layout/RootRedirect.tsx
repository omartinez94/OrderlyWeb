/**
 * RootRedirect — renders nothing, navigates the root `/` to either
 * the legacy `?showcase=1` URL (preserved) or the user's default
 * zone based on the live auth predicate.
 *
 * - `?showcase=1` flag present → navigates to `/showcase` with
 *   `replace: true`.
 * - Otherwise: authenticated user → navigates to the highest-
 *   privilege zone they can access (default-zone selector).
 * - Otherwise: unauthenticated user or no matching role → stays
 *   on `/` (the marketing `HomePage` renders).
 *
 * The redirect uses `replace: true` so the root URL doesn't sit in
 * the back-button stack. The component is mounted at `/` in
 * `router.tsx`.
 *
 * Dev/test fallback: in dev (`import.meta.env.DEV`) and test
 * (`import.meta.env.MODE === "test"`) modes, the predicate defaults
 * to the SuperAdmin placeholder so the routing plumbing can be
 * exercised without a real backend. Production always reads the
 * live session slice.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { shallowEqual } from "react-redux";
import { useAppSelector } from "../../app/hooks";
import { selectRoles } from "../../app/session/sessionSelectors";
import { PATH, QUERY_PARAM } from "../../router/pathNames";
import { defaultZoneForRoles } from "../../lib/defaultZone";
import type { Role } from "../../types/auth";
import { HomePage } from "../../routes/HomePage";

export function RootRedirect(): React.ReactElement | null {
  const liveRoles = useAppSelector(selectRoles, shallowEqual);
  const navigate = useNavigate();

  const roles: readonly Role[] = liveRoles;
  const isAuthenticated = roles.length > 0;

  useEffect(() => {
    // Legacy `?showcase=1` URL → preserve by redirecting to /showcase.
    if (typeof window !== "undefined") {
      const flag = new URLSearchParams(window.location.search).get(QUERY_PARAM.SHOWCASE);
      if (flag === "1") {
        navigate(PATH.SHOWCASE, { replace: true });
        return;
      }
    }

    if (!isAuthenticated) return;
    const target = defaultZoneForRoles(roles);
    if (target) navigate(target, { replace: true });
  }, [isAuthenticated, roles, navigate]);

  if (!isAuthenticated) {
    return <HomePage />;
  }

  return null;
}
