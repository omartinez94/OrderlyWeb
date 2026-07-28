/**
 * RequireRole — gates a route on role membership or zone shorthand.
 *
 * Two ways to use:
 *   - `<RequireRole allow="admin">…</RequireRole>` — the named zone
 *     maps to the role list in `ZONE_ACCESS` (defaultZone.ts).
 *   - `<RequireRole allow={["SuperAdmin", "Manager"]}>…</RequireRole>`
 *     — explicit role list.
 *
 * On rejection, renders `<ForbiddenPage />` rather than redirecting.
 * A forbidden response is part of the contract, not an auth failure.
 */

import { type ReactNode } from "react";
import type { Role, ZoneAllow } from "../../types/auth";
import { ForbiddenPage } from "../../routes/ForbiddenPage";
import { useAuthPredicate } from "./useAuthPredicate";
import { canAccessZone } from "../../lib/defaultZone";

export interface RequireRoleProps {
  allow: ZoneAllow | readonly Role[];
  children: ReactNode;
}

function isZoneAllow(allow: ZoneAllow | readonly Role[]): allow is ZoneAllow {
  return typeof allow === "string";
}

export function RequireRole({ allow, children }: RequireRoleProps): React.ReactNode {
  const predicate = useAuthPredicate();
  const allowed = isZoneAllow(allow)
    ? canAccessZone(allow, predicate.roles)
    : allow.some((r) => predicate.roles.includes(r));

  if (!allowed) return <ForbiddenPage />;
  return <>{children}</>;
}
