/**
 * SessionBoot — the cold-start session rehydration.
 *
 * On mount, calls `refreshAccessToken()` (which reuses the
 * single-flight mutex in `authRefresh.ts`). The Identity Service is
 * expected to authenticate via the httpOnly refresh cookie and
 * return the full credentials payload.
 *
 * Outcomes:
 *   - `isActive === true`  → dispatch `setCredentials`. Session
 *     is restored; the router renders the protected layout.
 *   - `isActive === false` → dispatch `clearCredentials` + show a
 *     non-enumerating toast ("Your session has ended"). The router
 *     routes to `/login` via `RequireAuth`.
 *   - 401 / network error  → session stays anonymous. The router
 *     routes to `/login` on protected pages via `RequireAuth`.
 *
 * StrictMode safety: dev renders the effect twice. A `useRef` flag
 * guarantees the refresh call fires exactly once per mount.
 *
 * Mount point: `StorefrontProvider` renders this *before* the
 * router so the first protected-route render sees a settled slice.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAppDispatch } from "../hooks";
import { setCredentials, clearCredentials } from "./sessionSlice";
import { refreshAccessToken } from "../../lib/authRefresh";
import { RouteLoadingShell } from "../../components/Layout/RouteLoadingShell";
import { toast } from "../../components/ui/sonner";
import type { Role, Permission } from "../../types/auth";

export interface SessionBootProps {
  children: ReactNode;
}

export function SessionBoot({ children }: SessionBootProps): ReactNode {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    // StrictMode in dev re-invokes effects. Guard against the
    // refresh call firing twice — the second call would either be
    // a wasted round-trip (success) or recurse via the mutex.
    if (startedRef.current) return;
    startedRef.current = true;

    refreshAccessToken()
      .then((res) => {
        if (!res.user.isActive) {
          // Deactivated account. Do NOT reveal account state —
          // the same toast fires for an expired cookie. The user
          // is dropped to anonymous; RequireAuth routes to /login.
          dispatch(clearCredentials());
          toast.info("Your session has ended. Please sign in again.");
          return;
        }
        // Strip `isActive` from the slice user — it's a bootstrap
        // signal, not session state.
        const { isActive: _isActive, ...user } = res.user;
        void _isActive;
        dispatch(
          setCredentials({
            accessToken: res.accessToken,
            expiresAt: res.expiresAt,
            user,
            roles: res.roles as readonly Role[],
            permissions: res.permissions as readonly Permission[],
          }),
        );
      })
      .catch(() => {
        // Anonymous path. Slice stays at `idle` (initial state) —
        // no dispatch needed. RequireAuth redirects on the next
        // protected render.
      })
      .finally(() => setReady(true));
  }, [dispatch]);

  if (!ready) return <RouteLoadingShell />;
  return <>{children}</>;
}
