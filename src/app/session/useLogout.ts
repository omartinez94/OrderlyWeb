/**
 * useLogout — the single owner of the logout sequence.
 *
 * Every cross-cutting concern lives here, in one place:
 *
 *   1. Best-effort POST `/auth/logout` to revoke the refresh cookie.
 *   2. `clearCredentials()` — flips `status` to `idle`, clears token,
 *      user, roles, permissions. `RequireAuth` re-evaluates and
 *      renders the redirect to `/login`.
 *   3. `api.util.resetApiState()` for every RTK Query slice — purges
 *      cached queries + mutations + unsubscribe state. Prevents the
 *      next session from briefly seeing stale data.
 *   4. Clear `?restaurantId=` from the URL — prevents cross-tenant
 *      bleed.
 *   5. `navigate(PATH.LOGIN, { replace: true })` — the protected
 *      router-level redirect lands the user on the login page.
 *
 * Side-effect order matters:
 *   - `clearCredentials` runs *before* `resetApiState` so `RequireAuth`
 *     re-evaluates against `status === 'idle'` before the cache wipes,
 *     avoiding a frame where guards see the old user but new cache state.
 *   - `setRestaurantId(undefined)` runs *after* `clearCredentials` so
 *     any consumer reacting to the auth change can finish before the
 *     URL mutation lands.
 *
 * The hook is intentionally `async () => Promise<void>` (rather than
 * fire-and-forget) — UI buttons usually wire the click handler
 * directly, and `Promise<void>` keeps the option open to `await` the
 * redirect for tests or a "logging out…" disabled state.
 *
 * Why this lives in `src/app/session/` (not in `lib/`):
 *   - It touches the Redux store, the RTK Query slices, and React
 *     Router — i.e. app infrastructure, not a leaf utility.
 *   - It pairs with `SessionBoot.tsx` (the inverse bootstrap) so the
 *     session lifecycle is symmetrical and discoverable.
 */

import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../app/hooks";
import { clearCredentials } from "./sessionSlice";
import { useRestaurantContext } from "../../components/RestaurantContext/useRestaurantContext";
import { identityApi, useLogoutMutation } from "../api/identity";
import { catalogApi } from "../api/catalog";
import { ordersApi } from "../api/orders";
import { kitchenApi } from "../api/kitchen";
import { notificationsApi } from "../api/notifications";
import { PATH } from "../../router/pathNames";

export function useLogout(): () => Promise<void> {
  const dispatch = useAppDispatch();
  const [mutation] = useLogoutMutation();
  const navigate = useNavigate();
  const { setRestaurantId } = useRestaurantContext();

  return useCallback(async () => {
    // 1. Best-effort backend call (revoke refresh cookie). Network
    //    errors are intentionally swallowed — the user is leaving
    //    regardless of whether the server got the memo.
    try {
      await mutation().unwrap();
    } catch {
      // best-effort
    }

    // 2. Clear credentials. RequireAuth re-evaluates and routes
    //    to /login on the next render.
    dispatch(clearCredentials());

    // 3. Purge all RTK Query caches. Order: identity first (it's
    //    the one we just talked to), then the others.
    dispatch(identityApi.util.resetApiState());
    dispatch(catalogApi.util.resetApiState());
    dispatch(ordersApi.util.resetApiState());
    dispatch(kitchenApi.util.resetApiState());
    dispatch(notificationsApi.util.resetApiState());

    // 4. Clear the URL restaurant context.
    setRestaurantId(undefined);

    // 5. Replace-navigate to /login. React Router's `<Navigate>`
    //    inside `RequireAuth` already fires when the predicate
    //    flips, but an explicit navigate here makes the redirect
    //    idempotent and avoids a flash of the protected page if
    //    RequireAuth is mounted asynchronously.
    navigate(PATH.LOGIN, { replace: true });
  }, [dispatch, mutation, navigate, setRestaurantId]);
}
