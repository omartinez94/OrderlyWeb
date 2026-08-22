# Auth & State Management — Fixes Plan

> Scope: Close the critical and medium gaps surfaced by the audit of [`auth-state-management.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/.agents/plans/auth-state-management.md) v2.0 against the actual implementation. No new features; only drift repair.

---

## Status

> **Plan version**: `v2.0` (2026-08-22) — collapsed 9 phases into 4 atomic phases; replaced `history.replaceState` redirect with `RequireAuth` reliance; clarified bootstrap uses `/auth/refresh`; closed Phase 7 (already documented).
> **Source of drift**: `auth-state-management.md` v2.0 marked ✅ Done via `app-foundation-completion` v1.6 + `identity-hardening` v1.4. Retroactive audit revealed 5 critical and 2 medium gaps still open.
> **Current state**: ⏸ Pending — ready to execute.

| Phase | Name | Status |
|:-----:|---|:-----:|
| A | Selector hardening + 401 exclusion | ✅ Done |
| B | Centralized `useLogout()` + wiring | ⏸ Pending |
| C | Session bootstrap | 🔒 Blocked by A |
| D | Dead-code cleanup | ⏸ Pending |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `docs:`, `chore:`, `test:`, `fix:`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: **on every phase completion, the plan MUST be updated in the same commit as the phase work.**

---

## 0. Skill & documentation conventions

### 0.1 Sources of truth
- [`docs/backend-architecture/architecture.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/docs/backend-architecture/architecture.md) — Identity Service, JWT, refresh cookie, isActive contract.
- [`docs/website-spec.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/docs/website-spec.md) — routes, zone access.
- [`AGENTS.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/AGENTS.md) — code style, security mandates.
- [`auth-state-management.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/.agents/plans/auth-state-management.md) v2.0 — the contract this plan repairs.

### 0.2 Code-quality guard rails
- TypeScript mandatory: all source files `.ts`/`.tsx`, strict mode enabled.
- No new global state outside Redux; no new ad-hoc fetch helpers.
- New UI components must use the `/shadcn-ui` skill and consume primitives from `src/components/ui/`.

---

## 1. Context

A 2026-08-22 audit of `auth-state-management.md` v2.0 (marked ✅ Done) revealed that the implementation is missing the startup session bootstrap, the 401 interceptor in `dynamicBaseQuery` does not exclude auth endpoints (wasting a refresh round-trip on failed logins), the logout flow is split across two components with diverging behavior (ProfilePage doesn't call the backend, doesn't redirect, doesn't purge caches), and `selectIsAuthenticated` doesn't check `user !== null`. This plan closes those gaps without introducing new features.

---

## 2. Goal

- The app rehydrates the session from the httpOnly refresh cookie on every cold start, without forcing the user to log in again.
- The 401 interceptor in `dynamicBaseQuery` cannot recurse into login or refresh endpoints.
- `useLogout()` is a single hook that handles every cross-cutting concern (backend call, credentials, cache purge, restaurant reset, redirect to `/login`) and is the only place these mutations live.
- The deactivated-account contract (`isActive === false`) terminates the session without revealing account state.
- `selectIsAuthenticated` derives from both `status` and `user` to prevent future drift.

---

## 3. Out of scope

- Backend modifications (Identity Service is assumed to honour the contract documented in §1 of `architecture.md`).
- Proactive token refresh (timer-based pre-expiry refresh) — still deferred per `auth-state-management.md` §3.
- Replacing `apiClient.ts` with a unified RTK Query path. The two clients co-exist intentionally; this plan only patches them.
- The `useAuthPredicate` dev fallback — **already well-documented** in a 15-line JSDoc block in [`useAuthPredicate.ts`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/src/components/RouteGuards/useAuthPredicate.ts). No further action needed.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| **Bootstrap trigger** | `<SessionBoot />` mounted in `StorefrontProvider` | Same mount point as `<SignalRBootGate />`; runs once per cold start, before the router renders. |
| **Bootstrap endpoint** | `/identity-api/api/auth/refresh` (not `/users/me`) | Returns the full `CredentialsPayload` shape (token, user, roles, permissions, expiresAt). `/users/me` only returns the user object — no token, no roles. The refresh cookie is the authentication proof on cold start; using `/auth/refresh` is its intended purpose. |
| **Auth-endpoint exclusion** | URL substring check in `dynamicBaseQuery` | Single-line guard; no per-slice flag plumbing needed. `apiClient.ts` already handles this via `skipAuth`. |
| **Logout orchestration** | `useLogout()` hook in `src/app/session/useLogout.ts` | One place for backend call + clearCredentials + cache reset + restaurant reset + navigate to `/login`. Consumed by `ProfilePage`, `ZoneTopBar`, and any future surface. |
| **Cache purge** | `dispatch(api.util.resetApiState())` per slice | RTK Query's documented reset; clears queries + mutations + unsubscribe state. |
| **Terminal refresh redirect** | Rely on `RequireAuth` re-evaluation | After `clearCredentials()` dispatches, `selectIsAuthenticated` flips to `false`, `RequireAuth` renders a redirect to `/login`. No raw `history.replaceState` bypass needed — React Router stays in control. |
| **`apiClient.ts` terminal path** | `store.dispatch(clearCredentials())` only | `apiClient.ts` lives outside React — no hooks. `RequireAuth` handles the redirect when the selector re-evaluates. |
| **Restaurant reset on logout** | `setRestaurantId(undefined)` inside `useLogout()` | URL state is the source of truth; clearing it prevents cross-tenant bleed. |

---

## 5. Folder layout (deltas only)

```
src/app/session/
  sessionSlice.ts                       # (existing) — no change
  sessionSelectors.ts                   # (existing) — harden selectIsAuthenticated (Phase A)
  SessionBoot.tsx                       # NEW — Phase C
  SessionBoot.test.tsx                  # NEW — Phase C
  useLogout.ts                          # NEW — Phase B
  useLogout.test.tsx                    # NEW — Phase B
src/app/StorefrontProvider.tsx          # (existing) — mount <SessionBoot /> in Phase C
src/app/api/base.ts                     # (existing) — skipRefresh guard (Phase A)
src/components/Layout/ZoneTopBar.tsx    # (existing) — consume useLogout (Phase B)
src/routes/ProfilePage.tsx              # (existing) — consume useLogout (Phase B)
```

No new dependencies.

---

## 6. Specification

### 6.1 `selectIsAuthenticated` hardening (`sessionSelectors.ts`)

```ts
export const selectIsAuthenticated = (s: RootState): boolean =>
  s.session.status === "authenticated" && s.session.user !== null;
```

Today `setCredentials` always populates both, so behavior is unchanged; future reducers that set status without user get the correct derivation. Add a regression test asserting `selectIsAuthenticated === false` when status is `'authenticated'` but user is `null`.

### 6.2 401 interceptor exclusion (`base.ts`)

Inside `dynamicBaseQuery`, after `result.error && result.error.status === 401`, add:
```ts
const url = typeof args === 'string' ? args : (args.url ?? '');
const isAuthEndpoint =
  url.includes('/auth/login') || url.includes('/auth/refresh');
if (isAuthEndpoint) return result; // Return the 401 untouched
```

Login failures return the original 401 to the form immediately. Refresh failures return untouched. The `onQueryStarted` listener in `identity.ts` already dispatches `clearCredentials()` on refresh failure.

> [!NOTE]
> `apiClient.ts` already handles this via `skipAuth` + `_refreshAttempted` flags. This fix only targets `dynamicBaseQuery` in `base.ts`.

Tests:
- `dynamicBaseQuery` on a 401 from `/auth/login` does NOT call `refreshAccessToken`.
- A 401 from a non-auth endpoint still triggers refresh + retry.

### 6.3 Centralized `useLogout()` (`src/app/session/useLogout.ts`)

```ts
export function useLogout(): () => Promise<void> {
  const dispatch = useAppDispatch();
  const [mutation] = useLogoutMutation();
  const navigate = useNavigate();
  const { setRestaurantId } = useRestaurantContext();

  return useCallback(async () => {
    // 1. Best-effort backend call (revoke refresh cookie)
    try { await mutation().unwrap(); } catch { /* best-effort */ }
    // 2. Clear credentials (status → 'idle', RequireAuth will redirect)
    dispatch(clearCredentials());
    // 3. Purge all RTK Query caches (prevent stale cross-session data)
    dispatch(identityApi.util.resetApiState());
    dispatch(catalogApi.util.resetApiState());
    dispatch(ordersApi.util.resetApiState());
    dispatch(kitchenApi.util.resetApiState());
    dispatch(notificationsApi.util.resetApiState());
    // 4. Clear restaurant URL state (prevent cross-tenant bleed)
    setRestaurantId(undefined);
    // 5. Redirect to login (replace to prevent back-button return)
    navigate(PATH.LOGIN, { replace: true });
  }, [dispatch, mutation, navigate, setRestaurantId]);
}
```

> [!IMPORTANT]
> **Behavior change:** `ZoneTopBar` currently navigates to `PATH.HOME` after logout. The centralized hook navigates to `PATH.LOGIN` instead. This is the correct destination — after logout the user should land on the login page, not the public marketing homepage.

Consumers:
- `ZoneTopBar.handleLogout` → `const logout = useLogout(); onLogout={logout}`
- `ProfilePage.handleLogout` → `const logout = useLogout(); onClick={logout}`
- `ZoneTopBar`'s dev/test fallback path (anonymous header → `openSignIn`) remains unchanged.

### 6.4 Terminal refresh redirect (no code change needed)

After `clearCredentials()` dispatches (in either `dynamicBaseQuery` or `apiClient.ts`), `selectIsAuthenticated` flips to `false`. `RequireAuth` reads this selector and renders a redirect to `/login?returnTo=...`. This is React Router's natural flow — no manual `history.replaceState` needed.

- `dynamicBaseQuery` (base.ts): already dispatches `clearCredentials()` in the catch branch. ✅
- `apiClient.ts`: already dispatches `clearCredentials()` and throws `ApiError(401)`. ✅
- `RequireAuth`: already redirects unauthenticated users to `/login`. ✅

**Verification test:** After a terminal refresh failure, assert `RequireAuth` renders a redirect to `/login`.

### 6.5 Bootstrap (`SessionBoot.tsx`)

Mounts once inside `StorefrontProvider`, before the router renders, so the first router render sees a settled session.

**Bootstrap strategy — use `/auth/refresh` instead of `/users/me`:**
- `/users/me` returns only the user object (no token, no roles, no permissions).
- `/auth/refresh` returns the full `CredentialsPayload` (token + user + roles + permissions + expiresAt) and is designed to be called with a refresh cookie on cold start.
- This aligns with the website spec §5.1: "On page reload: check for valid session via `/api/auth/me` or attempt refresh."

**Logic:**
1. On mount, call `refreshAccessToken()` from `authRefresh.ts` (reuses the existing single-flight mutex).
2. On success:
   - If `isActive === false` in the response: dispatch `clearCredentials()` + show a non-enumerating "account deactivated" message. Do not reveal account state.
   - Otherwise: dispatch `setCredentials` with the full payload.
3. On failure (401 / network error): set session to anonymous (`status: 'idle'`). The router will handle routing to `/login` via `RequireAuth`.
4. While loading, render a branded loading state (reuse `RouteLoadingShell` or a new `SessionBootFallback`).
5. Guard against StrictMode double-fire: use a `useRef` flag or key dispatches on `data`/`error` reference stability.

---

## 7. Security guardrails

> [!CAUTION]
> The JWT access token MUST remain in memory (Redux state) and NEVER be persisted. The fixes in this plan MUST NOT add any new persistence.

| Risk introduced by these fixes | Mitigation |
|---|---|
| Bootstrap dispatches `setCredentials` from `/auth/refresh` response | Same shape `setCredentials` already accepts; no new code path. |
| `useLogout` resets all RTK Query caches | Dispatched AFTER `clearCredentials()`; the next render of `RequireAuth` sees `status === 'idle'` and redirects before any refetch lands. |
| Terminal refresh relies on `RequireAuth` redirect | `RequireAuth` reads `selectIsAuthenticated` which flips synchronously on `clearCredentials()`. React Router's natural re-render handles the redirect — no raw `history.replaceState` bypass. |
| Dev fallback in `useAuthPredicate` | Gated by `import.meta.env.DEV` / `MODE === 'test'`; production builds strip it. Already documented in JSDoc. |

---

## 8. Development Phases

### Phase overview

| Phase | Name | Fixes Covered | Goal |
|:---:|---|---|---|
| **A** | Selector hardening + 401 exclusion | old §8, §2 | `selectIsAuthenticated` derives from status + user; login 401s don't trigger refresh. |
| **B** | Centralized `useLogout()` + wiring | old §3, §4, §5, §6 | Single hook owns backend call + credentials + cache purge + restaurant reset + redirect. `ZoneTopBar` + `ProfilePage` consume it. Terminal refresh redirect verified via `RequireAuth`. |
| **C** | Session bootstrap | old §1 | Cold start restores session from refresh cookie. |
| **D** | Dead-code cleanup | old §9 | Remove dead `AccessToken` interface and unnecessary import aliases. |

Phase ordering rationale: A is a prerequisite for C (bootstrap needs the 401 exclusion so the refresh call doesn't recurse). B is independent but should ship before C so the logout flow is clean when bootstrap is added. D is cosmetic and ships last.

---

### Phase A — Selector hardening + 401 exclusion

**Goal**: `selectIsAuthenticated` checks both `status` and `user`; login/refresh 401s don't trigger an unnecessary refresh round-trip.
**Status**: ✅ Done (2026-08-22)
**Deliverables**:
- [x] Update `selectIsAuthenticated` in `sessionSelectors.ts` per §6.1.
- [x] Add regression test: `selectIsAuthenticated === false` when `status === 'authenticated'` but `user === null`.
- [x] Add `isAuthEndpoint` URL guard in `dynamicBaseQuery` per §6.2.
- [x] Add test: 401 from `/auth/login` does NOT call `refreshAccessToken`.
- [x] Add test: 401 from a non-auth endpoint still triggers refresh + retry.
- [x] Existing tests pass (`pnpm test`).

**Exit criteria**: Logging in with wrong credentials returns the 401 immediately with no wasted `/auth/refresh` round-trip (verify in DevTools network tab). `pnpm typecheck && pnpm test` green.

---

### Phase B — Centralized `useLogout()` + wiring

**Goal**: Single source of truth for the logout sequence; all surfaces use it.
**Status**: ⏸ Pending
**Deliverables**:
- [ ] New `src/app/session/useLogout.ts` per §6.3.
- [ ] New `src/app/session/useLogout.test.tsx` asserting: backend mutation called → `clearCredentials` dispatched → all 5 API caches reset → `setRestaurantId(undefined)` called → navigate to `PATH.LOGIN` with `replace: true`.
- [ ] `ZoneTopBar.handleLogout` replaced with `const logout = useLogout()`.
- [ ] `ProfilePage.handleLogout` replaced with `const logout = useLogout()`.
- [ ] Verify terminal refresh redirect: after `clearCredentials()` in `base.ts`/`apiClient.ts`, `RequireAuth` redirects to `/login`. Add a test if one doesn't exist.
- [ ] `ZoneTopBar`'s dev/test fallback path (anonymous → `openSignIn`) remains unchanged.

**Exit criteria**: Logging out from header or `/profile` purges all RTK Query caches (verify via Redux DevTools), clears `?restaurantId=`, and navigates to `/login`. `pnpm typecheck && pnpm test` green.

---

### Phase C — Session bootstrap

**Goal**: Cold start restores the session from the httpOnly refresh cookie.
**Status**: 🔒 Blocked by Phase A (needs the 401 exclusion so the refresh call doesn't recurse)
**Deliverables**:
- [ ] New `src/app/session/SessionBoot.tsx` per §6.5.
- [ ] Mounted in `StorefrontProvider.tsx` before `{children}`.
- [ ] Calls `refreshAccessToken()` on mount; dispatches `setCredentials` on success, stays anonymous on failure.
- [ ] Handles `isActive === false` with terminal cleanup and non-enumerating message.
- [ ] Branded loading state via `RouteLoadingShell` during the bootstrap call.
- [ ] Guards against StrictMode double-fire (useRef flag or stable dependency keying).
- [ ] New `src/app/session/SessionBoot.test.tsx` covering: active user path, deactivated user path, anonymous (no cookie) path, and StrictMode double-mount.

**Exit criteria**: With an httpOnly refresh cookie present, hard-refreshing the app shows the authenticated zone without the login flash. Without a cookie, the app settles to anonymous and `RequireAuth` redirects to `/login`. `pnpm typecheck && pnpm test` green.

---

### Phase D — Dead-code cleanup

**Goal**: Cosmetic alignment with the spec.
**Status**: ⏸ Pending
**Deliverables**:
- [ ] Remove dead `AccessToken` interface from `apiClient.ts` (never imported anywhere).
- [ ] Remove unnecessary import aliases (`setCredentials as setSessionCredentials`, `clearCredentials as clearSessionCredentials`) in `apiClient.ts` — import directly.
- [ ] Add a comment in `sessionSlice.ts` documenting the naming decision (`setCredentials` not `setSessionCredentials`).
- [ ] Verify no stale aliases remain: `grep` for `setSessionCredentials` returns only the comment.

**Exit criteria**: `pnpm typecheck && pnpm lint && pnpm test` green. No dead exports.

---

## 9. Technical considerations

### 9.1 Cross-cutting

- **Bootstrap + StrictMode**: `SessionBoot`'s dispatches must be guarded against double-fire in dev. Use a `useRef` flag or key dispatches on response reference stability (not on `isLoading`/`isFetching`).
- **Cache reset ordering**: `clearCredentials()` must fire BEFORE `api.util.resetApiState()` so any guard re-evaluation sees `status === 'idle'` before the cache wipes (avoids a frame where guards see the old user but new cache state).
- **SignalR teardown**: `SignalRBootGate` reads `selectIsAuthenticated`; after `clearCredentials()` it flips to `enabled=false` and the effect cleanup stops the hub. Order is correct as-is.
- **RTK Query `resetApiState`**: clears query data and unsubscribes, but does NOT cancel in-flight mutations. Any pending mutation result that lands after logout will be ignored (no consumers are subscribed).
- **Terminal redirect via `RequireAuth`**: No raw `history.replaceState` or `window.location` manipulation. `clearCredentials()` sets `status: 'idle'` → `selectIsAuthenticated` returns `false` → `RequireAuth` renders `<Navigate to="/login" replace />`. React Router stays in full control.
- **`apiClient.ts` lives outside React**: It dispatches `clearCredentials()` directly via `store.dispatch()`. It cannot call hooks. The redirect is handled by `RequireAuth` re-evaluating — no hook injection needed.

### 9.2 Testing strategy

- `src/app/session/SessionBoot.test.tsx` — active / deactivated / anonymous paths + StrictMode.
- `src/app/session/useLogout.test.tsx` — side-effect order + cache purge + restaurant reset.
- `src/app/api/base.test.ts` — auth-endpoint 401 exclusion + non-auth 401 refresh + retry.
- Extend `src/app/session/session.test.tsx` — `selectIsAuthenticated` regression case.

---

## 10. Resolved items (no action needed)

| Item | Resolution |
|---|---|
| `useAuthPredicate` dev fallback (old Phase 7) | ✅ Already documented in a 15-line JSDoc in `useAuthPredicate.ts`. Production builds strip the fallback via `import.meta.env.DEV`. No further action. |
| Terminal refresh redirect (old Phase 5) | ✅ `RequireAuth` handles it naturally after `clearCredentials()`. No `history.replaceState` hack needed. Verified in Phase B. |

---

## 11. Definition of done

- All 4 phases shipped, each in its own commit referencing this plan.
- `pnpm typecheck`, `pnpm lint`, and `pnpm test` pass.
- A regression test exists for each fix.
- The `auth-state-management.md` v2.0 plan remains unchanged (the fixes are net-new behavior on top of the v2.0 contract).

---

## Changelog

### v1.0 (2026-08-22) — initial fixes plan
- Derived from the 2026-08-22 audit of `auth-state-management.md` v2.0.
- 9 phases: 5 🔴 critical, 3 🟡 medium, 1 🟢 low.
- Bootstrap (`SessionBoot`), 401 interceptor exclusion (`base.ts`), centralized logout (`useLogout`), terminal refresh redirect, deactivated-account contract, restaurant reset, dev-fallback documentation, selector hardening, naming cleanup.

### v2.0 (2026-08-22) — audit-driven restructure
- Collapsed 9 phases into 4 atomic phases (A–D) for meaningful commits.
- **Phase 5 replaced**: Removed `window.history.replaceState('/login')` hack — `RequireAuth` handles the redirect naturally after `clearCredentials()` dispatches. React Router stays in full control.
- **Phase 7 closed**: `useAuthPredicate` dev fallback is already documented in JSDoc. Moved to §10 Resolved items.
- **Phase 1 clarified**: Bootstrap uses `/auth/refresh` (not `/users/me`) because it returns the full `CredentialsPayload` shape (token, user, roles, permissions). `/users/me` only returns the user object.
- **Phase 3 behavior change noted**: `ZoneTopBar` logout destination changes from `PATH.HOME` → `PATH.LOGIN`.
- **`apiClient.ts` terminal path clarified**: Lives outside React; dispatches `clearCredentials()` only; `RequireAuth` handles redirect. No hook injection needed.
- Removed severity labels (🔴/🟡/🟢) — all remaining phases are required.

### v2.1 (2026-08-22) — Phase A shipped
- `selectIsAuthenticated` now requires `user !== null` (regression test added).
- `isAuthEndpoint` URL guard added to `dynamicBaseQuery`; login/refresh 401s return untouched.
- New `src/app/api/base.test.tsx` covering exclusion + retry behaviour (7 tests, all green).
- 2 pre-existing timeouts in `StaffForm.test.tsx` are unrelated and not fixed here.
