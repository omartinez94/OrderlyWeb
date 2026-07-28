/**
 * RootRedirect — renders nothing, navigates the root `/` to either
 * the legacy `?showcase=1` URL (preserved) or the user's default
 * zone based on the live auth predicate.
 *
 * - `?showcase=1` flag present → navigates to `/showcase` with
 *   `replace: true`.
 * - Otherwise: authenticated user → navigates to the highest-
 *   privilege zone they can access (`defaultZoneForRoles`).
 * - Otherwise: unauthenticated user or no matching role → stays
 *   on `/` (the marketing `HomePage` renders).
 *
 * The redirect uses `replace: true` so the root URL doesn't sit in
 * the back-button stack. The component is mounted at `/` in
 * `router.tsx`.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthPredicate } from "../RouteGuards/useAuthPredicate";
import { defaultZoneForRoles } from "../../lib/defaultZone";
import { PATH, QUERY_PARAM } from "../../router/pathNames";

export function RootRedirect(): null {
  const predicate = useAuthPredicate();
  const navigate = useNavigate();

  useEffect(() => {
    // Legacy `?showcase=1` URL → preserve by redirecting to /showcase.
    if (typeof window !== "undefined") {
      const flag = new URLSearchParams(window.location.search).get(QUERY_PARAM.SHOWCASE);
      if (flag === "1") {
        navigate(PATH.SHOWCASE, { replace: true });
        return;
      }
    }

    if (!predicate.isAuthenticated) return;
    const target = defaultZoneForRoles(predicate.roles);
    if (target) navigate(target, { replace: true });
  }, [predicate.isAuthenticated, predicate.roles, navigate]);

  return null;
}
