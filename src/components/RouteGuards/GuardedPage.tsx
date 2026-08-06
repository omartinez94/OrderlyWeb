/**
 * GuardedPage — a thin re-export of `RequireRole` named for the
 * route-level usage pattern. Zone layouts use this to wrap their
 * *whole* zone (a single check at the layout level) instead of
 * wrapping each leaf route inside an inline
 * `Component: () => (<RequireRole>...</RequireRole>)`.
 *
 * Why this exists:
 *   - React DevTools "inline component re-mount" warnings come from
 *     fresh closures on every render. Wrapping leaves in inline
 *     components causes the leaf to remount when guards re-evaluate.
 *   - Vercel rule `rerender-no-inline-components`.
 *
 * Usage in a zone module:
 *
 *   const zone: RouteObject = {
 *     Component: () => (
 *       <GuardedPage allow="admin">
 *         <AdminZoneLayout />
 *       </GuardedPage>
 *     ),
 *     children: [ ...leaves do not need RequireRole... ],
 *   };
 */

import type { ReactNode } from "react";
import type { Role, ZoneAllow } from "../../types/auth";
import { RequireRole } from "./RequireRole";
import { RequireAuth } from "./RequireAuth";

export interface GuardedPageProps {
  allow: ZoneAllow | readonly Role[];
  children: ReactNode;
}

export function GuardedPage({ allow, children }: GuardedPageProps): ReactNode {
  return (
    <RequireAuth>
      <RequireRole allow={allow}>{children}</RequireRole>
    </RequireAuth>
  );
}
