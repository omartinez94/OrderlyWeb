# Auth & State Management — Implementation Plan

> Scope: Scaffolding the frontend authentication state (Redux), secure token storage, silent auto-refresh mechanism, authorization (403) handling, and role-based route guards.

---

## Status

> **Plan version**: `v2.0` (2026-08-22) — major bump: retroactive audit revealed all phases were already delivered by sibling plans; plan restructured to reflect shipped state.
> **Current state**: ✅ Done — all phases shipped via [app-foundation-completion](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/.agents/plans/app-foundation-completion/app-foundation-completion.md) (v1.6) and [identity-hardening](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/.agents/plans/identity-hardening.md) (v1.4).

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Redux Store & Auth Slice | ✅ Done |
| 2 | API Client & Single-Flight Refresh | ✅ Done |
| 3 | Auth Hooks & Route Guards | ✅ Done |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `docs:`, `chore:`, `test:`, `fix:`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: **on every phase completion, the plan MUST be updated in the same commit as the phase work.**

---

## 0. Skill & documentation conventions

### 0.1 Skill mandate
> **All implementation work on this plan MUST follow the `AGENTS.md` rules for architecture and state management.** New UI components must use the `/shadcn-ui` skill and consume primitives from `src/components/ui/`.

### 0.2 Sources of truth
- [`docs/backend-architecture/architecture.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/docs/backend-architecture/architecture.md) — Identity Service, JWT, RBAC, gateway, and security model.
- [`docs/website-spec.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/docs/website-spec.md) — routes, zone access, auth behavior, navigation.
- [`AGENTS.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/AGENTS.md) — code style, security, and architecture mandates.

### 0.3 Code-quality guard rails
- TypeScript mandatory: all source files `.ts`/`.tsx`, strict mode enabled.
- Redux Toolkit slices + RTK Query for all server state.
- React 19 functional components only.
- No direct `localStorage` access for JWT access tokens.
- `isAuthenticated` is **derived** from `status === 'authenticated' && user !== null` — never a separately mutable boolean.

---

## 1. Context

With the backend Identity service now operational, the OrderlyWeb frontend needs a robust mechanism to manage the current user's session state. This includes securely storing the access token in memory (never in `localStorage`), managing the user's profile and active restaurant context, and seamlessly refreshing short-lived access tokens via `httpOnly` cookies without interrupting user workflows.

---

## 2. Goal

- Implement a session slice to hold user details, active restaurant, roles, permissions, and the JWT access token in memory.
- Implement an API client interceptor (`fetchBaseQuery` wrapper) that automatically catches 401s for silent, single-flight token refresh, and handles 403s (Forbidden) via route-level forbidden page or inline mutation errors.
- Provide purpose-specific hooks for components to query user state, permissions, and active context.
- Scaffold role-based route guards for the three distinct zones (Admin, Kitchen, Restaurant).

---

## 3. Out of scope

- Backend modifications to the Identity service (assumed working as per contract).
- Complex offline caching of user data.
- Proactive token refresh (timer-based pre-expiry refresh) — deferred to post-MVP.
- Self-service profile editing — no backend contract exists.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| **State Container** | Redux Toolkit (`sessionSlice`) | Project standard for global and server state. |
| **Token Storage** | Redux Memory | Mandated by `AGENTS.md` to prevent XSS theft; `httpOnly` cookie handles refresh. |
| **API Client** | RTK Query with custom `fetchBaseQuery` | Seamless integration with Redux and easy interception logic. |
| **Refresh Strategy** | Single-flight Promise Mutex | Prevents concurrent 401s from triggering multiple token refresh network calls simultaneously. |
| **Auth State Shape** | `SessionStatus` enum (`idle`, `authenticating`, `authenticated`, `expired`) | Derived `isAuthenticated` prevents boolean drift. |
| **Route Guards** | Three-layer: `RequireAuth` → `RequireRole` → `GuardedPage` | Separates authentication check from authorization check from layout wrapping. |
| **403 Handling** | Route-level → `ForbiddenPage`; Mutation-level → inline error | No global toast hijack; context-appropriate feedback. |

---

## 5. Folder layout (actual)

```
src/
  app/
    store.ts                          # configureStore with session + 5 API slices
    hooks.ts                          # Typed useAppDispatch / useAppSelector
    api/
      base.ts                         # dynamicBaseQuery with 401 refresh via authRefresh
      identity.ts                     # RTK Query: login, refresh, logout, me, restaurants, staff
      catalog.ts                      # Restaurants, tables, menu
      orders.ts                       # Order CRUD + status mutations
      kitchen.ts                      # KDS aggregation
      notifications.ts                # Notifications list + mark-as-read
    session/
      sessionSlice.ts                 # Session state, actions, selectors
      sessionSelectors.ts             # Memoized selectors: selectPredicate, selectUser, selectRoles, etc.
      headerSelectors.ts              # Accessible restaurants, notifications selectors
  lib/
    apiClient.ts                      # apiFetch wrapper with auth header injection + 401 retry
    authRefresh.ts                    # Single-flight refresh Promise mutex
    env.ts                            # Typed VITE_* accessor
    safeReturnPath.ts                 # Open-redirect defense for returnTo
    defaultZone.ts                    # Role → default zone priority resolution
  components/
    RouteGuards/
      RequireAuth.tsx                 # Redirects unauthenticated → /login?returnTo=...
      RequireRole.tsx                 # Zone-level role access check → ForbiddenPage
      RequirePermission.tsx           # Component-level permission gate
      GuardedPage.tsx                 # Layout wrapper composing RequireAuth + RequireRole
      useAuthPredicate.ts             # Thin selector wrapper: { isAuthenticated, roles, permissions }
    RestaurantContext/
      useRestaurantContext.ts         # Active restaurant, URL sync, cache invalidation
  types/
    auth.ts                           # Role (8), Permission (16+), AuthPredicate, ZoneAllow
  routes/
    LoginPage.tsx                     # Staff login with error handling
    ProfilePage.tsx                   # Read-only user profile
    ForbiddenPage.tsx                 # 403 Access Denied page
```

---

## 6. Specification

### 6.1 Redux Session Slice (`sessionSlice.ts`)

*   **`SessionState` interface** — `{ status: SessionStatus, accessToken: string | null, user: SessionUser | null, roles: Role[], permissions: Permission[], expiresAt: number | null }`.
*   **`SessionStatus`** — `'idle' | 'authenticating' | 'authenticated' | 'expired'`.
*   **`SessionUser`** — `{ id: string, name: string, email: string, initials: string }`.
*   **`setSessionCredentials` action** — Dispatched after successful login or refresh. Updates token, user, roles, permissions, and expiresAt.
*   **`clearCredentials` action** — Clears state entirely. Used by logout, terminal refresh failure, and deactivated-account detection.
*   **`setStatus` action** — Transitions the `SessionStatus` for bootstrap flow.
*   **Derived `isAuthenticated`** — Via `selectIsAuthenticated` selector: `status === 'authenticated' && user !== null`. Never a separately mutable boolean.

### 6.2 API Interceptor (`apiClient.ts` + `authRefresh.ts` + `base.ts`)

*   **`apiFetch<T>`** — Thin wrapper around `fetch` that injects `Authorization: Bearer` from Redux state and `Accept-Language` for i18n.
*   **`dynamicBaseQuery`** — Wraps RTK Query's `fetchBaseQuery` in `base.ts`.
*   **Single-flight 401 refresh** (`authRefresh.ts`):
    1. Execute the original request.
    2. Return immediately unless it fails with 401.
    3. Never start re-auth for login, refresh, or terminal identity requests (prevents infinite recursion).
    4. If no refresh is in flight, start exactly one `POST /identity-api/api/auth/refresh` (with `credentials: 'include'`).
    5. Concurrent failed requests await the same refresh promise.
    6. On success, dispatch `setSessionCredentials` with the new token and retry each original request once.
    7. On terminal refresh failure, dispatch `clearCredentials` and redirect to `/login`.
*   **403 Forbidden handling**:
    - Route-level 403 → `RequireRole` renders `<ForbiddenPage />`.
    - Mutation-level 403 (e.g., `STAFF_GRANT_FORBIDDEN`) → inline error in the calling component. No global toast hijack.

### 6.3 Auth Hooks & Selectors

*   **`useAuthPredicate()`** — Returns `{ isAuthenticated, roles, permissions }` via `useAppSelector(selectPredicate, shallowEqual)`. Stable references when no auth change.
*   **`selectUser`** — User object for UI display.
*   **`selectRoles`** / **`selectPermissions`** — For role/permission checks.
*   **`selectDefaultZone`** — Uses `defaultZoneForRoles(roles)` with explicit priority order.
*   **`useRestaurantContext()`** — Active restaurant ID, URL `?restaurantId=` sync, accessible restaurant list, cache invalidation on switch.
*   **`RequirePermission`** / **`usePermission()`** — Granular permission checks for UI element rendering.

### 6.4 Startup session bootstrap

1. Set session status to `'idle'`.
2. Execute `GET /identity-api/api/auth/me` with `credentials: 'include'`.
3. On 200, normalize the user; terminate if `isActive === false`; otherwise populate session state.
4. On 401, execute the single-flight refresh.
5. On refresh success, store the token and retry the current-user request.
6. On terminal failure, mark session `'idle'` (anonymous).
7. Render a branded loading state while checking to prevent login/content flashes.

### 6.5 Return path & role-default navigation

*   **`safeReturnPath`** — Validates `returnTo` against same-origin rules. Rejects `//`, `/\`, protocol-relative paths, and `:` before first `/`.
*   **Role-default zone priority** (`defaultZoneForRoles`):
    - `SuperAdmin` → `/site/admin`
    - `RestaurantAdmin` → `/site/admin`
    - `KitchenManager` → `/site/kitchen`
    - `KitchenStaff` → `/site/kitchen`
    - `Manager` → `/site/restaurant`
    - `Waiter` → `/site/restaurant`
    - `Cashier` → `/site/restaurant`
    - `Host` → `/site/restaurant`
*   No recognized role → forbidden/no-access state.

### 6.6 Centralized logout

1. Optimistically dispatch `clearCredentials()`.
2. Reset active restaurant state.
3. Purge the RTK Query cache.
4. Best-effort `POST /identity-api/api/auth/logout` (network errors ignored).
5. Replace-navigate to `/login`.

---

## 8. Security guardrails

> [!CAUTION]
> The JWT access token MUST remain in memory (Redux state) and NEVER be persisted to `localStorage` or `sessionStorage`. Never log tokens or include them in error/reporting payloads.

| Risk | Mitigation |
|---|---|
| XSS Token Theft | Access token kept strictly in Redux memory. Refresh token is `httpOnly`. |
| Race Conditions on Refresh | Single-flight Promise mutex in `authRefresh.ts`; concurrent 401s share one refresh roundtrip. |
| Infinite Refresh Recursion | Login/refresh/terminal requests excluded from the 401 interceptor. |
| Open Redirect via `returnTo` | `safeReturnPath` rejects schemes, protocol-relative paths, backslashes, and unknown routes. |
| Frontend Role Bypass | Guards are UX only; backend authorization remains authoritative on every request. |
| Cross-tenant Stale Cache | Purge on logout; invalidate all restaurant-scoped tags on restaurant switch. |
| CSRF against Cookie Endpoints | Backend `SameSite`/CSRF controls verified; frontend does not assume headers alone solve it. |
| Deactivated Account | `isActive === false` on login/refresh/bootstrap triggers terminal cleanup with non-enumerating message. |

---

## 9. Development Phases

### Phase overview

| Phase | Name | Goal | Delivered by |
|:---:|---|---|---|
| **1** | Redux Store & Auth Slice | Scaffold the base Redux store, type definitions, and session slice. | `app-foundation-completion` Phase 2–3 |
| **2** | API Client & Single-Flight Refresh | Build the API client with mutex logic for 401 refresh and 403 handling. | `app-foundation-completion` Phase 2 + `identity-hardening` Phase 2 |
| **3** | Auth Hooks & Route Guards | Create auth hooks and route guards for zone access enforcement. | `app-foundation-completion` Phase 3–4 + `identity-hardening` Phase 1 |

### Phase 1 — Redux Store & Auth Slice

**Goal**: Setup the global state container and auth state structure.
**Status**: ✅ Done (shipped by `app-foundation-completion` Phase 2–3, 2026-07-28)
**Deliverables**:
- [x] Create `src/app/store.ts` and `src/app/hooks.ts`.
- [x] Create `src/app/session/sessionSlice.ts` (named `session`, not `auth`; lives in `app/session/` not `features/auth/`).
- [x] Define types: `SessionStatus`, `SessionUser`, `SessionState`, `CredentialsPayload` in `sessionSlice.ts`; `Role`, `Permission`, `AuthPredicate`, `ZoneAllow` in `src/types/auth.ts`.
- [x] Export `setSessionCredentials`, `clearCredentials`, and `setStatus` actions.
- [x] Create memoized selectors in `src/app/session/sessionSelectors.ts`.

**Exit criteria**: `pnpm typecheck` passes; Redux DevTools show the session slice initialized. ✅

### Phase 2 — API Client & Single-Flight Refresh

**Goal**: Seamlessly handle 401s, token rotation, and 403 authorization errors.
**Status**: ✅ Done (shipped by `app-foundation-completion` Phase 2 + `identity-hardening` Phase 2, 2026-07-28 / 2026-08-04)
**Deliverables**:
- [x] Create `src/lib/apiClient.ts` — `apiFetch` wrapper with auth header injection.
- [x] Create `src/lib/authRefresh.ts` — single-flight Promise mutex for `/identity-api/api/auth/refresh`.
- [x] Create `src/app/api/base.ts` — `dynamicBaseQuery` wrapping `fetchBaseQuery` with 401 retry via shared `refreshAccessToken`.
- [x] Implement 403 Forbidden handling: route-level via `RequireRole` → `ForbiddenPage`; mutation-level via inline component errors.
- [x] Wire RTK Query API slices (`identity`, `catalog`, `orders`, `kitchen`, `notifications`) into the store.

**Exit criteria**: Simulated 401 requests trigger a single refresh call and subsequent retry; 403 renders forbidden page. ✅

### Phase 3 — Auth Hooks & Route Guards

**Goal**: Protect the application routes based on user state and roles.
**Status**: ✅ Done (shipped by `app-foundation-completion` Phase 3 + `identity-hardening` Phase 1, 2026-07-28 / 2026-08-04)
**Deliverables**:
- [x] Create `src/components/RouteGuards/useAuthPredicate.ts` — thin `selectPredicate` wrapper with `shallowEqual`.
- [x] Create `src/components/RouteGuards/RequireAuth.tsx` — redirects unauthenticated users to `/login?returnTo=...`.
- [x] Create `src/components/RouteGuards/RequireRole.tsx` — zone-level role access check.
- [x] Create `src/components/RouteGuards/RequirePermission.tsx` — granular permission gate.
- [x] Create `src/components/RouteGuards/GuardedPage.tsx` — layout wrapper composing RequireAuth + RequireRole.
- [x] Implement `defaultZoneForRoles` in `src/lib/defaultZone.ts` with explicit role priority order.
- [x] Implement `safeReturnPath` in `src/lib/safeReturnPath.ts` for open-redirect defense.
- [x] Implement restaurant context with URL sync in `src/components/RestaurantContext/useRestaurantContext.ts`.

**Exit criteria**: Navigating to `/site/admin` without the Admin role renders `ForbiddenPage`; unauthenticated users redirect to `/login`. ✅

---

## 10. Technical considerations

### 10.1 Cross-cutting

- **Auth is app infrastructure, not a feature.** Session state lives in `src/app/session/`, not `src/features/auth/`. This is intentional — every zone depends on it.
- **No monolithic `useAuth()` hook.** A single hook returning everything (`user`, `token`, `roles`, `restaurants`, `hasRole()`, etc.) would cause unnecessary re-renders. Purpose-specific hooks (`useAuthPredicate`, `selectUser`, `usePermission`, `useRestaurantContext`) keep subscriptions narrow.
- **Reactive refresh is MVP-only.** Proactive refresh 30–60 seconds before `expiresAt` is deferred until realtime/high-volume screens (KDS, live orders) land.
- **Frontend guards are UX only.** Backend authorization remains authoritative. Every protected request must still enforce authorization server-side.

---

## Changelog

### v1.0 (2026-08-22) — initial draft
- Created plan outlining Auth & State Management based on `AGENTS.md` guidelines.
- Defined Redux slice, API interceptor mutex, and Auth hooks architecture.

### v1.1 (2026-08-22) — added 403 handling
- Added 403 Forbidden interceptor logic to Goals, §6.2, and Phase 2 deliverables.

### v2.0 (2026-08-22) — retroactive audit, all phases marked done
- Retroactive audit revealed all 3 phases were already delivered by sibling plans:
  - `app-foundation-completion` (v1.6, ✅ all 5 phases) — store, API client, session slice, header wiring.
  - `identity-hardening` (v1.4, ✅ all 4 phases) — route guard hardening, refresh dedup, profile page.
- Corrected folder layout to match actual implementation (`src/app/session/` not `src/features/auth/`).
- Corrected component names (`GuardedPage` + `RequireAuth` + `RequireRole`, not `ProtectedRoute`).
- Expanded `AuthState` → `SessionState` with `SessionStatus`, `expiresAt`, `permissions`, `user.initials`.
- Replaced monolithic `useAuth()` with purpose-specific hooks to prevent over-subscription.
- Added missing specs: session bootstrap (§6.4), return path defense (§6.5), centralized logout (§6.6), deactivated-account handling.
- Expanded security guardrails: infinite recursion guard, CSRF, open redirect, token logging, cross-tenant cache.
- Added §10 technical considerations: auth-as-infrastructure, no monolithic hook, reactive-only refresh.
- All deliverables checked `[x]`; all phases marked ✅ Done with dates and source plan references.
