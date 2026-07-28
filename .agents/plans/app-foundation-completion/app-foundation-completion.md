# OrderlyWeb — App Foundation Completion — Implementation Plan

> Scope: Close the gap between the routing skeleton and a wired-up app — install the API + state layer, replace the placeholder auth predicate, wire the Header to live data, and ship the quick perf/DX wins the codebase audit surfaced. Consumers: every downstream feature module (Staff, Orders, KDS, Tables, …).

---

## Status

> **Plan version**: `v1.3` (2026-07-28) — `MINOR` increments after each phase completion; `MAJOR` is reserved for breaking restructures of the plan itself.
> **Current state**: ⏸ Not started

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Quick wins & code quality | ✅ Done |
| 2 | State & data layer | ✅ Done |
| 3 | Auth slice implementation | 🔒 Blocked |
| 4 | Header live wiring | 🔒 Blocked |
| 5 | First feature module (Staff) — sketched | 🔒 Blocked |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `docs:`, `chore:`, `test:`, `fix:`, `refactor:`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: **on every phase completion, the plan MUST be updated in the same pair of commits as the phase work** (code commit + plan commit). A phase that ships without a plan update is a phase that drifted. See [How to use this template](#how-to-use-this-template).

---

## 0. Skill & documentation conventions

### 0.1 Skill mandate
> **All implementation work on this plan MUST** consult `/vercel-react-best-practices` before shipping a component or hook (per `AGENTS.md` `rerender-*` / `rendering-*` / `bundle-*` / `js-*` rules). For new base components, also `/shadcn-ui`. For frontend-interface polish on the marketing/showcase surfaces, `/impeccable`.

### 0.2 Code-quality guard rails
- **TypeScript strict** — `tsconfig.app.json` already has `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`. No `any` outside generated DTO shims.
- **No inline `style={{}}`** — Tailwind utility class, CSS file, or documented dynamic-value exception (per `AGENTS.md` §Code style).
- **Format (oxfmt)** — 2-space indent, double quotes, 100-char width, trailing commas, LF line endings. Run `pnpm format` before committing.
- **Lint (oxlint)** — `pnpm lint` must pass before any commit.
- **Typecheck** — `pnpm typecheck` must pass before any commit.
- **Tests** — Vitest + jest-axe for components; Playwright for routing/E2E. New components must ship with colocated `*.test.tsx` covering open/closed states and the keyboard contract.

---

## 1. Context

The OrderlyWeb routing foundation (routing-foundation plan, Phase 1–3) is in place: locked design tokens, the shadcn/ui base library with axe-tested primitives, three-zone role-guarded routes, deterministic `defaultZoneForRoles` resolution, and a safe `returnTo` open-redirect defense. The routing E2E suite is green.

A full audit of the current implementation (`docs/research/audit-2026-07-28.md`, sibling to this plan) surfaced a single dominant gap: **the application has no state layer, no API client, no SignalR client, and no real auth.** Every feature page renders `<ZoneSplash />`. `useAuthPredicate` returns a hardcoded SuperAdmin so the routing plumbing can be exercised. The Header is built but consumes `MOCK_*` constants from `Header/mockData.ts`. This blocks every downstream feature module.

A second cluster of findings is code quality / performance: theme FOUC, dead code, inline route components, ad-hoc inline styles, no pre-hydration theme script, missing `.env.example`. None of these block features but each one compounds the cost of the next change.

This plan closes both clusters before the feature modules (Staff, Orders, KDS) start. The detailed feature implementations land in their own plans.

---

## 2. Goal

- **Install and wire the data layer**: Redux Toolkit + RTK Query, API client with JWT interceptor + 401 refresh, SignalR client, `.env.example`, MSW for tests.
- **Implement the auth slice** so `useAuthPredicate` returns live roles from Redux, not a placeholder.
- **Wire the Header** to live selectors; replace `MOCK_*` in `ZoneTopBar.tsx`; wire `onRestaurantChange` to `useRestaurantContext`; subscribe SignalR hubs.
- **Ship the quick wins**: pre-hydration theme script, fix the duplicate sign-in dialog, fix inline route components, hoist SVGs, switch `radix-ui` meta-package to per-package imports, remove dead code.
- **Adopt the Vercel React best practices** rules the audit flagged (Set lookups, `useMemo` for derived state, hover-preload for zone chunks, event-handler refs for stable listeners, `useTransition` for non-urgent updates).

---

## 3. Out of scope

- **Feature implementations** (Staff CRUD, Orders list/create/split-bill, KDS dashboard, Tables & Floor Plan, Reservations, Queue, Walk-in, Feedback, Analytics). Each gets its own plan.
- **Multi-restaurant cache reset details** — the invalidation strategy is per-feature, not per-foundation.
- **Push notifications on `/hubs/notifications`** — lands with the Notification Service integration feature plan.
- **Production deployment**, CI workflow changes, image optimization, analytics, error reporting.
- **Backend changes** — the Orderly Microservices sibling repo is untouched by this plan.
- **Open-redirect defense strengthening** beyond `safeReturnPath` (already in place).

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| Server state | Redux Toolkit + RTK Query | Mandated by `AGENTS.md` §Code style; gives request dedup, cache invalidation, `keepUnusedDataFor`, and the ability to share auth state in the same store. |
| Auth state | Redux slice (`session`), selectors via `useAppSelector` | Same store as server state; `useAuthPredicate` consumes a memoized selector with shallow equality. |
| API base URL | `VITE_API_BASE_URL` (default `http://localhost:6004`) | `AGENTS.md` §Backend integration — single base URL, all RTK Query hits go through the YARP gateway. |
| SignalR URL | `VITE_SIGNALR_URL` (default `http://localhost:6004/kitchen-api`) | Hub `/hubs/kitchen` is gateway-fronted; identical host keeps CORS simple. |
| HTTP client | Native `fetch` via RTK Query's `fetchBaseQuery` | No extra dependency; works in browsers and Vitest. |
| SignalR transport | `@microsoft/signalr` v8 | Official client; integrates cleanly with auto-reconnect and JSON Hub Protocol. |
| JWT storage | In-memory only (access token, in `sessionSlice`) + httpOnly refresh cookie | `AGENTS.md` §Security — never `localStorage`, never `sessionStorage`, never URL param. |
| Mock backend (dev/test) | MSW v2 | Vite-native, intercepts RTK Query in tests and Playwright. Avoids coupling tests to the real backend. |
| Form state | `react-hook-form` + `zod` (already in `package.json`) | Mandated; types flow from schema to form. |
| Logging | `console.warn` in DEV only; no Sentry | Out of MVP; foundation must not depend on a logger that isn't shipped. |
| Theme FOUC | Inline pre-hydration `<script>` in `index.html` | Vercel rule `rendering-hydration-no-flicker`. |
| Open-redirect defense | Existing `safeReturnPath` helper | Already battle-tested by `RequireAuth`. Keep it. |
| Zone module wrapper | `<GuardedPage allow="…">` primitive | Replaces per-leaf `Component: () => (<RequireRole>…</RequireRole>)` inline wrappers. |
| Icons | Module-level SVG components in `src/components/icons/` | Hoists repeated inline SVGs (per Vercel `rendering-hoist-jsx`). |

---

## 5. Folder layout

```
src/
  app/
    store.ts                    # configureStore, RootState, AppDispatch
    hooks.ts                    # useAppDispatch, useAppSelector (typed)
    api/
      base.ts                   # fetchBaseQuery with auth header + 401 refresh
      identity.ts               # RTK Query slice — login, refresh, logout, currentUser, userRestaurants, staff
      catalog.ts                # Restaurants, tables, menu (read endpoints)
      orders.ts                 # Order CRUD + status mutations + split-bill
      kitchen.ts                # KDS aggregation
      notifications.ts          # Notifications list + mark-as-read
    session/
      sessionSlice.ts           # Authenticated user, roles, permissions, access token (memory)
      sessionSelectors.ts       # selectPredicate, selectDefaultZone, …
  lib/
    apiClient.ts                # Shared fetch wrapper + unified single-flight refresh helper
    signalr.ts                  # HubConnection factory (kitchen hub) + auto-reconnect policy
    env.ts                      # Typed accessor for VITE_* variables
  hooks/
    useTheme.ts                 # Refactored — useMemo for resolvedTheme, module-level cache for storage
    useFocusTrap.ts             # Unchanged
    useReducedMotion.ts         # Unchanged
  components/
    Layout/
      RootLayout.tsx            # Mounts <StorefrontProvider> + <SignalRBoot> + unchanged chrome
      ZoneShell.tsx             # Drop the inner <Suspense> (kept at RootLayout level)
      ZoneSidebar.tsx           # Set lookup for roles
    Header/
      Header.tsx                # Unchanged shape; consumers swap mock props for live selectors
      slots/                    # Inline SVGs replaced by ./icons imports
      icons/
        index.tsx               # BellIcon, UserIcon, CheckIcon, ChevronIcon, SunIcon, MoonIcon, …
    RouteGuards/
      RequireAuth.tsx           # Unchanged shape; now sourced from Redux
      RequireRole.tsx           # Unchanged shape
      GuardedPage.tsx           # NEW — wraps a layout or page with the role check
      useAuthPredicate.ts       # Refactored to a thin selector wrapper
    SignInDialog/
      SignInDialog.tsx          # Unchanged
      SignInDialogHost.tsx      # Unchanged
      # HomePage no longer mounts its own dialog (removed in Phase 1)
    SignalRBoot/
      SignalRBoot.tsx           # NEW — subscribes to kitchen hub (/kitchen-api/hubs/kitchen) on auth
  routes/
    HomePage.tsx                # Remove local dialog; rely on SignInDialogHost
    ProfilePage.tsx             # NEW — extracted from inline component in router.tsx
    site/...                    # ZoneSplash leaves remain until Phase 5 ships Staff
  test/
    setup.ts                    # Confirm jest-dom + jest-axe matchers; add MSW server boot
    handlers/
      identity.ts               # MSW request handlers for the test suite
      orders.ts
      catalog.ts
      notifications.ts
    server.ts                   # setupServer + start/stop helpers
.env.example                    # NEW — VITE_API_BASE_URL, VITE_SIGNALR_URL, VITE_NODE_ENV
.husky/
  pre-commit                    # NEW — pnpm format && pnpm lint
index.html                      # Modified — inline pre-hydration theme script (Phase 1)
src/lib/tokens.ts               # Unchanged — design tokens stay as-is
src/router/zones/*.tsx          # Modified — use GuardedPage; nested errorElement added
```

---

## 6. Specification

### 6.1 Quick wins (Phase 1)

*   **`theme-fouc-fix`** — Add a `<script>` in `index.html` that, before `<script type="module">`, reads `localStorage["orderly-theme"]` (or `matchMedia('(prefers-color-scheme: dark)')` if unset), resolves the same way `useTheme` does, and sets `document.documentElement.setAttribute('data-theme', resolved)` synchronously. The `<script>` must be inline (no external request) and run before the module bundle paints. Pair with `useTheme.ts` refactor: `resolvedTheme = useMemo(() => resolveMode(mode), [mode])`; the effect stays only for the DOM write.
*   **`dual-signin-dialog-fix`** — Remove `useState`, `SignInDialog`, and `useDialogBridge` from `src/routes/HomePage.tsx`. Rely on `SignInDialogHost` (mounted by `RootLayout`) alone. Keep `<SignInBridgeTrigger>` — that's just an event dispatcher.
*   **`profile-route-extract`** — Move the inline `Component: () => (…)` for `PATH.PROFILE` from `src/router/router.tsx:71-86` into `src/routes/ProfilePage.tsx`. Use the same shape as `LoginPage.tsx`.
*   **`dead-code-cleanup`** — Remove `void ForbiddenPage;` in `router.tsx:103`. Remove `src/router/routes/showcaseRoute.tsx` (unused). Audit and remove any other dead exports.
*   **`zone-module-inline-component-fix`** — Introduce `<GuardedPage allow="…"><Page /></GuardedPage>` in `src/components/RouteGuards/`. Refactor `adminZone.tsx`, `kitchenZone.tsx`, `restaurantZone.tsx` to use it at the zone layout level only (one wrapper per zone, not per leaf). Move the leaf-role check inside the layout so each zone module exports a single `Component: () => <GuardedPage allow="admin"><ZoneLayout /></GuardedPage>`.
*   **`radix-ui-to-per-package`** — Replace `import { Dialog as DialogPrimitive } from "radix-ui"` (and similar in `tooltip.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `select.tsx`, `popover.tsx`, `accordion.tsx`, etc.) with per-package imports (`@radix-ui/react-dialog`, `@radix-ui/react-tooltip`, …). Update `src/components/ui/*.tsx` mechanically.
*   **`header-style-replacement`** — In `RestaurantSwitcher.tsx` and `UserMenu.tsx`, replace `style={{ backgroundColor: "var(--color-surface-elevated)" }}` with `data-[focus]:bg-surface-elevated` driven by HeadlessUI's `focus` render-prop. Same for `color: "var(--color-ink-subtle)"` in `RestaurantSwitcher.tsx:48`.
*   **`zone-sidebar-set-lookup`** — In `ZoneSidebar.tsx:26-28`, build `const roleSet = new Set(predicate.roles)` once per render, then `item.roles?.some(r => roleSet.has(r))`. O(items × item-roles) becomes O(items × avg-item-roles) with a `Set`.
*   **`use-theme-storage-cache`** — In `useTheme.ts`, replace `readStoredMode()` (which hits `localStorage` on every call) with a module-level cached read; the storage is a session-stable value.
*   **`use-dialog-bridge-ref`** — In `useDialogBridge.ts`, store the latest `open` callback in a ref so the `addEventListener` binding doesn't re-fire on every parent re-render.
*   **`header-icons-hoist`** — Move the inline `BellIcon`/`UserIcon`/`CheckIcon`/`ChevronIcon`/`SunIcon`/`MoonIcon` SVGs from `Header` slot components into a single `src/components/Header/icons/index.tsx` module. Each icon is a typed `Icon<{ size?: number; className?: string }>` component.
*   **`use-navigate-with-transition-adoption`** — Replace `useNavigate()` in `Breadcrumb.tsx` (`onBrandClick`/`onRestaurantClick`) and `RestaurantSwitcher.tsx` (`onChange` route fallback) with `useNavigateWithTransition()`. Update `AGENTS.md` to document the hook's mandate.
*   **`bread-wired-onclick`** — Wire `Breadcrumb`'s `onBrandClick` to the default-zone selector; `onRestaurantClick` navigates to the active restaurant's home zone (or no-op if undefined).
*   **`order-status-promote`** — Move `OrderStatus` from `src/components/StatusPill/StatusPill.tsx:17` to `src/types/order.ts`. Re-export from StatusPill for backward compat until consumers land.
*   **`use-restaurant-context-effect`** — Move the `toast.warning(...)` call in `useRestaurantContext.ts:58-62` inside a `useEffect` keyed on `[raw]`, so it doesn't fire during every render.
*   **`router-cast-removal`** — Once `ZoneShell`'s inner `<Suspense>` is dropped (see Phase 2), the `as Parameters<...>` cast in `router.tsx:105` may no longer be needed. Verify and remove.
*   **`pre-commit-hook`** — Per `AGENTS.md` §PR conventions, the pre-commit hook runs `pnpm format && pnpm lint`. Wire it via a `.husky/pre-commit` script.
*   **`zone-shell-suspense-removal`** — Drop the inner `<Suspense>` in `ZoneShell.tsx`. The root `<Suspense>` in `RootLayout` is sufficient; nested Suspense with the same fallback produces a fallback swap flicker when the zone chunk arrives.

### 6.2 State & data layer (Phase 2)

*   **`apiClient`** — A thin wrapper around `fetch` that:
    *   Reads the access token from the Redux store via `store.getState().session.accessToken` (singleton accessor, no `useSelector` in a non-hook context).
    *   Adds `Authorization: Bearer <token>` when present.
    *   On 401, coordinates with a unified single-flight refresh helper to prevent token-rotation race conditions with concurrent RTK Query calls; if the refresh fails, dispatches `session/logout`.
    *   Returns the `Response` (or throws on non-2xx).
    *   Used by both RTK Query's `fetchBaseQuery` (via a shared refresh mechanism) and the SignalR negotiation call.
*   **`store`** — `configureStore({ reducer: { session, [identityApi.reducerPath]: identityApi, … }, middleware: (gdm) => gdm().concat(sessionMiddleware, identityApi.middleware, …) })`. Exports `RootState`, `AppDispatch`, the store instance.
*   **`hooks`** — `export const useAppDispatch = useDispatch.withTypes<AppDispatch>()`, `export const useAppSelector = useSelector.withTypes<RootState>()`. Typed at the slice level.
*   **`sessionSlice`** — State shape: `{ status: 'idle' | 'authenticating' | 'authenticated' | 'expired', accessToken: string | null, user: { id, name, email, initials } | null, roles: Role[], permissions: Permission[], expiresAt: number | null }`. Reducers: `setCredentials`, `clearCredentials`, `setStatus`. No async thunks — RTK Query's mutation hooks handle the API calls.
*   **`sessionSelectors`** — Memoized via `createSelector`:
    *   `selectAccessToken` — `state => state.session.accessToken`
    *   `selectIsAuthenticated` — `state => state.session.status === 'authenticated'`
    *   `selectUser`, `selectRoles`, `selectPermissions`
    *   `selectPredicate` — `{ isAuthenticated, roles, permissions }` (consumed by `useAuthPredicate`)
    *   `selectDefaultZone` — uses existing `defaultZoneForRoles(roles)` from `src/lib/defaultZone.ts`
*   **`api/identity`** — Endpoints: `login`, `logout`, `refresh`, `getCurrentUser`, `getUserRestaurants`, `listStaff`, `getStaff`, `createStaff`, `updateStaff`, `deactivateStaff`. Each `login`/`refresh` calls a `transformResponse` that dispatches `setCredentials`. `logout` calls `clearCredentials`.
*   **`api/catalog`** — Endpoints: `getRestaurants`, `getRestaurant(id)`, `getTables(restaurantId)`, `getMenu(restaurantId)`.
*   **`api/orders`** — Endpoints: `getOrders(filters)`, `getOrder(id)`, `createOrder`, `updateOrderStatus`, `proposeModification`, `approveModification`, `splitBill`. Tag the cache by `restaurantId` so the restaurant switcher can invalidate.
*   **`api/kitchen`** — Endpoints: `getKitchenQueue(restaurantId)`, `bumpOrder(id)`.
*   **`api/notifications`** — Endpoints: `getNotifications`, `markRead(id)`, `markAllRead`.
*   **`signalr.ts`** — Exports `createKitchenHub()` factory. Returns a `HubConnection` with auto-reconnect (1s, 2s, 5s, 10s, 30s, then stop). The hub URL is `${env.signalrUrl}/hubs/kitchen` (e.g. `http://localhost:6004/kitchen-api/hubs/kitchen`) — `VITE_SIGNALR_URL` already includes the upstream path prefix (`/kitchen-api`), so the factory appends only `/hubs/kitchen`. Consumers subscribe to typed kitchen events (e.g. `OrderReceived`, `ItemStateChanged`, `OrderReady`); exposes `invoke` for client→server methods.
*   **`env.ts`** — Typed accessor: `export const env = { apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:6004', signalrUrl: import.meta.env.VITE_SIGNALR_URL ?? 'http://localhost:6004/kitchen-api' as const }`. The `signalrUrl` default carries the upstream path prefix (`/kitchen-api`) so hub construction is `signalrUrl + '/hubs/kitchen'` — no double-prefix. Fails fast in dev if `import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL` (warns to console).
*   **`.env.example`** — Documented values for `VITE_API_BASE_URL`, `VITE_SIGNALR_URL`, `VITE_NODE_ENV`. Per `AGENTS.md` §Security, no secrets.
*   **MSW handlers** — One file per service (`handlers/identity.ts`, `handlers/orders.ts`, …). Boot in `src/test/server.ts` for Vitest; configure Playwright via the same handlers in `e2e/mocks/`.
*   **`StorefrontProvider`** — New wrapper mounted inside `RouterProvider` in `main.tsx`: `<Provider store={store}>{children}</Provider>`. Wraps the `RootLayout` tree.
*   **`SignalRBoot`** — A component mounted under `StorefrontProvider` that, once authenticated, opens the kitchen SignalR hub and dispatches events into the RTK Query cache (via `api.util.updateQueryData` to update orders/kitchen status).

### 6.3 Auth slice (Phase 3)

*   **`sessionSlice`** — Fully wired: `setCredentials`, `clearCredentials`, `setStatus` reducers; `extraReducers` listens for `identityApi.endpoints.login.fulfilled` to call `setCredentials`.
*   **`identityApi`** — Wired to dispatch `setCredentials` on `login`/`refresh` via `onQueryStarted`. `logout` calls `clearCredentials`. `refresh` is the single source of a fresh access token.
*   **`useAuthPredicate`** — Becomes a thin wrapper over `useAppSelector(selectPredicate, shallowEqual)`. Stable references while no auth change.
*   **`RequireAuth` / `RequireRole`** — Same shape, different auth source. No consumer change.
*   **`RootRedirect`** — Replace `useAuthPredicate()` with the new selector-backed hook. Logic unchanged.
*   **`LoginPage`** — Replace the placeholder body with the real form (sourced from a `LoginForm` feature component, or reuse `SignInDialog`).
*   **`StorefrontProvider` → `onAuthChange`** *(stretch)* — A listener that, on a successful login, dismisses the dialog and triggers `useNavigateWithTransition()` to `defaultZoneForRoles(newRoles)`.

### 6.4 Header live wiring (Phase 4)

*   **`ZoneTopBar`** — Replace `MOCK_*` imports with:
    *   `const user = useAppSelector(selectUser)`
    *   `const restaurants = useAppSelector(selectAccessibleRestaurants)` (sourced from `catalogApi`'s `getRestaurants`)
    *   `const notifications = useAppSelector(state => selectNotifications(state))`
    *   `const unreadCount = useAppSelector(state => selectUnreadCount(state))`
    *   `const opsCount = useAppSelector(state => selectOpsCountForZone(state, zone, restaurantId))`
    *   `onRestaurantChange` calls `useRestaurantContext().setRestaurantId(id)` and invalidates `catalog` + `orders` RTK Query tags.
    *   `onNotificationClick` opens the notification detail (deep-link to the related order).
    *   `onMarkAllRead` calls `notificationsApi.endpoints.markAllRead.initiate()`.
    *   `onProfile` navigates to `PATH.PROFILE` via `useNavigateWithTransition`.
    *   `onLogout` dispatches `session/clearCredentials`, disconnects SignalR hubs, navigates to `PATH.HOME`.
*   **`RestaurantSwitcher`** — Replace `restaurants` with the selector output. `onChange` is the live setter. Local `useState` for query stays (controlled search input).
*   **`NotificationsBell`** — Replace `notifications` + `unreadCount` with selectors. `onNotificationClick` triggers a deep-link. `onMarkAllRead` calls the mutation.
*   **`ThemeToggle`** — Unchanged; already consumes `useTheme()`.
*   **`UserMenu`** — Replace `user` with the selector. `onLogout` flows from the store.
*   **SignalR boot** — `<SignalRBoot />` mounted inside `StorefrontProvider` subscribes to the kitchen SignalR hub once authenticated; unsubscribes on logout.
*   **Optimistic ops badge** — `opsCount` derives from the orders cache. On a `ItemStateChanged` or `OrderReceived` SignalR event, the cache updates; the badge re-renders via `useTransition` to keep input responsive.

### 6.5 Feature module — Staff (Phase 5, sketched)

The Staff module's detailed implementation plan lives in a sibling document. This plan only sketches the seam.

*   Replace `<ZoneSplash />` in `StaffListPage`, `StaffNewPage`, `StaffDetailPage` with the feature components.
*   `src/features/staff/` directory: `api.ts` (slim wrapper around `identityApi` filtered to staff endpoints), `StaffList.tsx`, `StaffForm.tsx`, `StaffDetail.tsx`, `useStaffFilters.ts`.
*   Role list, restaurant assignment, and deactivation UI wired to `identityApi`'s staff CRUD endpoints.
*   Vitest + jest-axe tests for every form.
*   Playwright spec for the create-staff-and-assign-role flow.

---

## 7. Cross-repo / integration

The frontend talks to the **Orderly Microservices** sibling repo via the YARP API Gateway on port 6004. The kitchen hub URL `/kitchen-api/hubs/kitchen` is gateway-fronted — no direct service-to-frontend connections. Per `AGENTS.md` §Security, all auth flows route through the gateway; the frontend never calls Identity Service (6007) directly. Upstream calls route through path prefixes (e.g. `/identity-api/`, `/catalog-api/`). JWT claims are documented in `docs/backend-architecture/architecture.md` and must match `src/types/auth.ts`.

This plan introduces two new runtime dependencies: `@reduxjs/toolkit` and `@microsoft/signalr`, plus one devDependency: `msw`. No backend changes are required; the Hub Protocol contract is whatever the existing gateway exposes.

---

## 8. Security guardrails

> [!CAUTION]
> The JWT access token MUST stay in Redux memory only. Never `localStorage`, never `sessionStorage`, never a Redux-persisted middleware, never an URL param. The refresh token is `httpOnly` cookie only.

| Risk | Mitigation |
|---|---|
| Open redirect via `returnTo` | Existing `safeReturnPath` helper rejects `//`, `/\`, protocol-relative, and `:` before first `/`. Phase 1 keeps it. |
| JWT in storage | `sessionSlice` keeps `accessToken` in Redux only; no `redux-persist`, no `localStorage.setItem`, no cookies set by the frontend. |
| Refresh token leakage | Refresh is `httpOnly` cookie; only the access token is exposed to JS. |
| CORS / origin spoofing | Backend's problem per `AGENTS.md` §Security; frontend trusts `VITE_API_BASE_URL` only in dev. |
| XSS via URL params | All URL-bound user input passes `encodeURIComponent`; nothing user-controlled hits the DOM as HTML. |
| MSW test leakage | MSW handlers run only in Vitest + Playwright; the app code path that initializes MSW is gated by `import.meta.env.MODE === 'test'` or the Playwright `NODE_ENV`. |
| Stale tokens after logout | `session/clearCredentials` resets both `accessToken` and `roles`; the apiClient middleware checks `accessToken === null` before adding the header. |
| `restaurantId` injection | Existing `ALLOWED` regex in `useRestaurantContext`; keep it. |
| Token rotation race | `apiClient`'s 401-refresh uses a single-flight promise so concurrent in-flight requests share one refresh roundtrip. |

---

## 9. Development Phases

### Phase overview

| Phase | Name | Tool groups delivered | Goal |
|:---:|---|---|---|
| **1** | Quick wins & code quality | Theme FOUC, dead-code, inline-component fix, sign-in dup, style→utility, Set lookup, SVG hoist, `useNavigateWithTransition` adoption | The codebase is clean and the dark-mode default doesn't flicker. |
| **2** | State & data layer | Redux Toolkit, RTK Query, apiClient, SignalR, MSW, env, `.env.example` | The app talks to the backend; tests don't hit the real network. |
| **3** | Auth slice | `sessionSlice`, identity RTK Query, `useAuthPredicate` swap | Routes use real roles; the placeholder is gone. |
| **4** | Header live wiring | Selectors, SignalR hubs, ops-badge derivation | The Header shows live data and reacts to events. |
| **5** | First feature — Staff (sketch) | Replace `<ZoneSplash />` for staff routes; detailed plan in sibling doc | A real feature page exists; the wiring is proven. |

---

### Phase 1 — Quick wins & code quality

**Goal**: The codebase is clean, no behavior changes for users, every page loads in light/dark without flicker, dead code is gone, the Header slot SVGs are reusable.

**Status**: ✅ Done (2026-07-28)

**Deliverables**:

- [x] Pre-hydration theme script in `index.html`; `useTheme` derives `resolvedTheme` via `useMemo`.
- [x] Remove duplicate sign-in dialog from `HomePage.tsx`; `SignInDialogHost` is the sole owner.
- [x] Extract `PATH.PROFILE` to `src/routes/ProfilePage.tsx`; remove `void ForbiddenPage;`; remove `src/router/routes/showcaseRoute.tsx`.
- [x] Introduce `<GuardedPage>` and refactor `adminZone.tsx`, `kitchenZone.tsx`, `restaurantZone.tsx` to use it.
- [x] Replace `radix-ui` meta-package imports with `@radix-ui/react-*` per-package imports across `src/components/ui/*.tsx`.
- [x] Replace `style={{ backgroundColor: "var(--color-…)" }}` with `data-[focus]:bg-…` in `RestaurantSwitcher.tsx`, `UserMenu.tsx`.
- [x] Convert `ZoneSidebar.tsx`'s `predicate.roles` lookup to a `Set`.
- [x] Cache `localStorage` read in `useTheme.ts` at module level.
- [x] Stabilize `useDialogBridge.ts` via a ref pattern.
- [x] Hoist slot SVGs to `src/components/Header/icons/index.tsx`.
- [x] Switch `Breadcrumb.tsx`'s brand/restaurant buttons to `useNavigateWithTransition`; wire `onBrandClick` to the default-zone selector.
- [x] Promote `OrderStatus` to `src/types/order.ts`; re-export from `StatusPill` for compat.
- [x] Move `useRestaurantContext`'s warning toast into a `useEffect`.
- [x] Drop `ZoneShell`'s inner `<Suspense>`; remove the `as Parameters<…>` cast in `router.tsx`.
- [x] Pre-commit hook stub via `.husky/pre-commit` running `pnpm format && pnpm lint`.
- [x] Document `useNavigateWithTransition` adoption in `AGENTS.md`.

**Exit criteria**: `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test:run && pnpm test:e2e` all green. Visual smoke test on `/home` in dark mode shows no FOUC. Both showcase and zone chunks load without inline-component re-mount warnings in React DevTools.

---

### Phase 2 — State & data layer

**Goal**: The app talks to the API Gateway via `fetch` with a JWT-aware client; RTK Query is wired with one slice per service; SignalR hubs are factory-created; MSW mocks the gateway in tests.

**Status**: ✅ Done (2026-07-28)

**Deliverables**:

- [x] Install `@reduxjs/toolkit`, `@microsoft/signalr`, `msw` (devDep).
- [x] `src/app/store.ts`, `src/app/hooks.ts` (typed `useAppDispatch`, `useAppSelector`).
- [x] `src/lib/apiClient.ts` with `getState`-aware auth header + single-flight 401 refresh.
- [x] `src/app/api/{base,identity,catalog,orders,kitchen,notifications}.ts` — RTK Query slices.
- [x] `src/lib/signalr.ts` — `createKitchenHub` factory with typed events.
- [x] `src/lib/env.ts` — typed `env` accessor.
- [x] `.env.example` — documents the variables.
- [x] `src/test/server.ts` + `src/test/handlers/*` — MSW setup for Vitest.
- [x] `StorefrontProvider` in `main.tsx` mounts `<Provider store={store}>` before `<RouterProvider>`.
- [x] `SignalRBoot` subscribes to `/kitchen-api/hubs/kitchen` once authenticated.
- [x] One passing end-to-end RTK Query call (e.g. `getRestaurants`) hooked to a fake MSW handler, demonstrated via `src/app/api/catalog.test.tsx` (no debug route needed — the unit test serves as the proof).
- [x] Update `AGENTS.md` §Backend integration to reflect the YARP gateway (port `6004`), the kitchen hub (`/kitchen-api/hubs/kitchen`), the upstream path prefixes (`/identity-api/`, `/catalog-api/`, …), and the Identity Service port (`6007`).

**Exit criteria**: `pnpm test:run` runs an RTK Query endpoint through MSW and asserts the response shape. `pnpm dev` boots; the catalog query fires on app start; `pnpm build` produces a bundle that includes `@microsoft/signalr` and `@reduxjs/toolkit`.

---

### Phase 3 — Auth slice

**Goal**: `useAuthPredicate` reads from Redux; `RequireAuth`/`RequireRole` use real roles; the root redirect uses `defaultZoneForRoles` against live data.

**Status**: ⏸ Pending

**Deliverables**:

- [ ] `src/app/session/sessionSlice.ts` with `setCredentials`, `clearCredentials`, `setStatus` reducers.
- [ ] `src/app/session/sessionSelectors.ts` with `selectPredicate` (memoized, shallow-equal).
- [ ] `src/app/session/sessionMiddleware.ts` listens for 401s from RTK Query and triggers `refresh` (optional; can live in apiClient).
- [ ] `identityApi.login` + `identityApi.refresh` dispatch `setCredentials` via `onQueryStarted`.
- [ ] `useAuthPredicate` becomes a thin wrapper over `useAppSelector(selectPredicate, shallowEqual)`.
- [ ] `LoginPage` placeholder replaced by the real form (sourced from the SignInDialog or a dedicated page).
- [ ] E2E test: `pnpm test:e2e` includes a "login → redirect to default zone" flow with MSW mocking the identity endpoints.

**Exit criteria**: `useAuthPredicate().isAuthenticated === true` only after a successful `login` mutation; `RequireRole allow="kitchen"` rejects a Cashier in the live predicate; the root `/` redirects to `/site/admin` when SuperAdmin logs in.

---

### Phase 4 — Header live wiring

**Goal**: The Header shows live data; restaurant switching reloads the catalog cache; notifications stream from SignalR; ops badge derives from `ordersApi`; logout clears everything.

**Status**: ⏸ Pending

**Deliverables**:

- [ ] `ZoneTopBar.tsx` consumes selectors — `user`, `restaurants`, `notifications`, `unreadCount`, `opsCount` — instead of `MOCK_*`.
- [ ] `onRestaurantChange` calls `useRestaurantContext().setRestaurantId(id)` and invalidates `catalog` + `orders` RTK Query tags.
- [ ] `onNotificationClick` deep-links to the related order (or marks read).
- [ ] `onMarkAllRead` dispatches `notificationsApi.markAllRead`.
- [ ] `onProfile` navigates to `PATH.PROFILE` via `useNavigateWithTransition`.
- [ ] `onLogout` dispatches `session/clearCredentials`, disconnects the kitchen SignalR hub, navigates to `PATH.HOME`.
- [ ] `SignalRBoot` subscribes to `/kitchen-api/hubs/kitchen` once authenticated; unsubscribes on logout.
- [ ] `OpsBadge` derives from a `selectOpsCountForZone` selector.
- [ ] MSW handlers cover `getRestaurants`, `getNotifications`, `getOrders` for the test suite.

**Exit criteria**: A Playwright spec opens `/`, logs in via the SignInDialog, switches restaurants twice, sees the restaurant name update in the Header, sees the ops badge count react to a `orderStatusChanged` mock event, and logs out to `/home`.

---

### Phase 5 — First feature module (Staff) — sketched

**Goal**: The Staff routes render real feature components; the foundation is proven end-to-end.

**Status**: ⏸ Pending

**Deliverables**:

- [ ] Replace `<ZoneSplash />` in `StaffListPage`, `StaffNewPage`, `StaffDetailPage`.
- [ ] `src/features/staff/` with `api.ts`, `StaffList.tsx`, `StaffForm.tsx`, `StaffDetail.tsx`, `useStaffFilters.ts`.
- [ ] Vitest + jest-axe tests for every form.
- [ ] Playwright spec for the create-and-assign-role flow.

**Exit criteria**: A SuperAdmin can navigate to `/site/admin/staff`, list staff, click "New", fill the form, submit, and see the new row appear.

> **Detailed implementation** lives in a sibling plan doc (`staff-management.md`) once this foundation lands. Phase 5 here is just enough to prove the wiring.

---

## 10. Technical considerations

> Surfaced from a full-codebase audit (2026-07-28) reviewed against `/vercel-react-best-practices`. Each item points at a concrete risk and (where useful) the rule that applies. Phase 1 should adopt the cross-cutting items before any feature code is written — they are far cheaper to retrofit then.

### 10.1 Cross-cutting — adopt before any feature code

> **Phase 1 adoption (2026-07-28):** items marked `[P1 ✅]` are implemented in Phase 1. Items without the marker remain pending until the phase that introduces the corresponding code.

- **`rerender-derived-state-no-effect`** — `[P1 ✅]` `useTheme.ts`'s `resolvedTheme` is derived in an effect today. Refactor to `useMemo`. Effect stays for the DOM write only.
- **`rendering-hydration-no-flicker`** — `[P1 ✅]` Inline pre-hydration `<script>` in `index.html`. Dark-mode-first users no longer see a flash.
- **`rerender-no-inline-components`** — `[P1 ✅]` Zone modules wrap each leaf in an inline `Component: () => (<RequireRole>...</RequireRole>)`. Replace with a single `<GuardedPage>` wrapper at the zone-layout level.
- **`bundle-barrel-imports`** — `[P1 ✅]` `radix-ui` meta-package → `@radix-ui/react-*` per-package imports across `src/components/ui/*.tsx`.
- **`js-set-map-lookups`** — `[P1 ✅]` `ZoneSidebar.tsx`'s `roles.some(...)` → `Set` lookup.
- **`rendering-hoist-jsx`** — `[P1 ✅]` Slot SVGs in `Header/slots/*` → `src/components/Header/icons/index.tsx`.
- **`rerender-transitions`** — `[P1 ✅]` `useNavigateWithTransition` adoption in `Breadcrumb`, `RestaurantSwitcher`. Documented in `AGENTS.md`.
- **`advanced-event-handler-refs`** — `[P1 ✅]` `useDialogBridge` listener stable across `open` changes.

### 10.2 Phase 2 — data layer adoption

- **`client-swr-dedup`** — `[P2 ✅]` RTK Query handles dedup automatically. Set `keepUnusedDataFor` per endpoint; the orders endpoint uses `0` (SignalR keeps it fresh), the catalog uses `60` seconds.
- **`bundle-defer-third-party`** — `[P2 ✅]` `@microsoft/signalr` and `@reduxjs/toolkit` are first-paint dependencies (the auth bootstrap needs them). Defer Sonner toasts (already loaded eagerly; consider lazy-loading the toaster).
- **`bundle-analyzable-paths`** — `[P2 ✅]` All RTK Query imports are statically analyzable; `noUncheckedIndexedAccess` is on.
- **`async-suspense-boundaries`** — `[P2 ✅]` `RootLayout`'s `<Suspense>` boundary streams lazy chunks under `RouteLoadingShell`. Zone-level `<Suspense>` in `ZoneShell` is dropped (single Suspense at root is enough; eliminates fallback swap flicker).
- **`server-cache-react`** — `[N/A]` This is a Vite SPA; no RSC.

### 10.3 Phase 3 — auth adoption

- **`rerender-defer-reads`** — `[P3 ✅]` `useAuthPredicate` consumes a memoized selector (`createSelector` + `shallowEqual`). Stable references when no auth change.
- **`js-cache-storage`** — `[P3 ✅]` Session state lives in Redux; no `localStorage` reads per render. Refresh token is httpOnly.
- **`rerender-memo-with-default-value`** — `[P3 ✅]` When `useAuthPredicate` is replaced, verify the `RequireAuth`/`RequireRole` consumers don't re-mount on token rotation.

### 10.4 Phase 4 — Header adoption

- **`rerender-memo`** — `[P4 ✅]` `Header.tsx` is a persistent shell. Memoize the `currentRestaurant` lookup and the `unreadCount` derivation; both are cheap but compound under SignalR traffic.
- **`client-event-listeners`** — `[P4 ✅]` The two SignalR hubs each mount one shared `HubConnection`. Don't open a connection per `useOrders`-typed selector.
- **`rerender-transitions`** — `[P4 ✅]` Restaurant switching uses `startTransition` via `useNavigateWithTransition` so the catalog refresh doesn't block the input.

### 10.5 Phase 5 — feature adoption

- **`rendering-content-visibility`** — `[P5 ✅]` Staff list and order list pages apply `content-visibility: auto` to long table bodies.
- **`rendering-conditional-render`** — `[P5 ✅]` Empty/loaded/error states use ternaries, not `&&`.
- **`async-parallel`** — `[P5 ✅]` When a feature needs both staff + restaurants (e.g. "filter staff by restaurant"), fetch in parallel via `Promise.all` inside RTK Query's `transformResponse` or a `combineQueries`-style hook.

---

## How to use this plan

See the template's "How to use this template" section. Each phase ends with:

1. A code commit (`feat: ...`).
2. A plan commit (`docs: mark Phase N complete in app-foundation-completion`).

Both commits are required before the phase is "done".

---

## Changelog

### v1.0 (2026-07-28) — initial draft
- Created plan with 5 phases.
- Sections 0–10 drafted.
- §10 cross-cutting items derived from the full-codebase audit against `/vercel-react-best-practices`.

### v1.1 (2026-07-28) — backend integration synced + copy-edit fixes

**Backend integration corrections** (driven by the Orderly Microservices sibling repo, which now fronts the frontend through YARP instead of Ocelot):
- §4 Tech decisions: gateway is **YARP** on port **`6004`** (was Ocelot / 5000). Identity Service moved to port **`6007`**.
- §4 / §6.2 / §6.4: SignalR surface collapsed to a single **`/kitchen-api/hubs/kitchen`** hub (was two hubs — `/hubs/orders` and `/hubs/notifications`). Hub events renamed to the .NET PascalCase wire format: `OrderReceived`, `ItemStateChanged`, `OrderReady`.
- §5 / §6.2: `signalr.ts` now exports `createKitchenHub()` only (was `createOrdersHub` + `createNotificationsHub`).
- §6.2 `api/identity`: added **`getUserRestaurants`** endpoint (user-scoped, distinct from `catalog.getRestaurants`).
- §6.2 `apiClient`: 401 handling now specifies a **unified single-flight refresh helper** to prevent token-rotation races with concurrent RTK Query calls.
- §6.2 `signalr.ts` / `env.ts`: clarified that `VITE_SIGNALR_URL` already carries the upstream `/kitchen-api` prefix; the hub URL is `${signalrUrl}/hubs/kitchen` (no double-prefix).
- §7: added upstream path-prefix convention (`/identity-api/`, `/catalog-api/`, etc.).

**Copy-edit fixes**:
- §6.2 StorefrontProvider: fixed `RootLayout's` typo → `Wraps the RootLayout tree.`
- Phase 2 deliverables: added an explicit `AGENTS.md` sync deliverable ("Update `AGENTS.md` §Backend integration to reflect the YARP gateway, the kitchen hub, the upstream path prefixes, and the Identity Service port.").

**Docs sync (sibling commit)**:
- `AGENTS.md` §Backend integration rewritten to match the new model: gateway / port / path-prefix table, single kitchen hub, single-flight 401 refresh, and an explicit "live push delivery is not part of the foundation" note for notifications.
- `AGENTS.md` §Security gateway URL updated from `http://localhost:5000` → `http://localhost:6004`.

### v1.2 (2026-07-28) — Phase 1 complete

Phase 1 (Quick wins & code quality) shipped. All 16 deliverables landed, plan checklist ticked, status flipped to `✅ Done`.

**Code changes** (one worktree, sequenced commits):
- `index.html`: inline pre-hydration `<script>` reads `localStorage["orderly-theme"]` (or `matchMedia`) and sets `data-theme` before the module bundle paints. Mirrors `useTheme` logic.
- `src/hooks/useTheme.ts`: cached `readStoredMode` at module level (session-stable). `resolvedTheme` is now derived via `useMemo` (Vercel `rerender-derived-state-no-effect`). Effect's only job is the DOM write.
- `src/routes/HomePage.tsx`: removed the duplicate `SignInDialog` mount, the `useState`/`useDialogBridge` wiring. The page now fires `openSignIn()` directly via the imported helper. `SignInDialogHost` (mounted by `RootLayout`) is the sole owner.
- `src/routes/ProfilePage.tsx`: NEW — extracted from the inline `Component: () => (...)` in `router.tsx`.
- `src/router/router.tsx`: removed `void ForbiddenPage;`, the `as Parameters<...>` cast, and the unused `showcaseRoute.tsx`.
- `src/components/RouteGuards/GuardedPage.tsx`: NEW — wraps `<RequireRole>` with the route-level naming convention.
- `src/router/zones/{admin,kitchen,restaurant}Zone.tsx`: each zone module now wraps its zone layout in a single `<GuardedPage>` at the layout level (was: per-leaf inline `Component: () => (<RequireRole>…</RequireRole>)`). Removes the React DevTools "inline component re-mount" warning (Vercel `rerender-no-inline-components`).
- `src/components/ui/*.tsx` (30 files): `radix-ui` meta-package → `@radix-ui/react-*` per-package. Compound components use `import * as X from "@radix-ui/react-x"` namespace imports; `Slot` (no `.Root` namespace) is consumed directly. `radix-ui` dependency removed from `package.json`.
- `src/components/Header/slots/{RestaurantSwitcher,UserMenu}.tsx`: replaced inline `style={{ backgroundColor: ... }}` driven by HeadlessUI's `focus` render-prop with `data-focus` attributes; CSS in `Header.css` now selects `[data-focus="true"]` alongside `:hover`. The `color: var(--color-ink-subtle)` for "No restaurant" became `data-no-restaurant="true"` + CSS rule.
- `src/components/Layout/ZoneSidebar.tsx`: role lookup uses a `Set<Role>` built once per render (Vercel `js-set-map-lookups`).
- `src/components/SignInDialog/useDialogBridge.ts`: `open` callback lives in a `useRef`; the `addEventListener` binding is set up once (Vercel `advanced-event-handler-refs`).
- `src/components/Header/icons/index.tsx`: NEW — module-level SVG components (`BellIcon`, `UserIcon`, `LogoutIcon`, `CheckIcon`, `ChevronIcon`, `SunIcon`, `MoonIcon`). All Header slot components and `ThemeToggle` import from here (Vercel `rendering-hoist-jsx`).
- `src/hooks/useNavigateWithTransition.ts`: NEW — wraps `useNavigate()` in `startTransition` so non-urgent navigation doesn't block input (Vercel `rerender-transitions`).
- `src/components/Header/slots/Breadcrumb.tsx`: brand click navigates to `defaultZoneForRoles(roles)` via `useNavigateWithTransition`; restaurant click navigates to the restaurant zone (or default zone, falling back to `/home`).
- `src/types/order.ts`: NEW — `OrderStatus` lives here. `StatusPill` re-exports it for backward compat.
- `src/components/RestaurantContext/useRestaurantContext.ts`: `toast.warning(...)` moved inside `useEffect` keyed on `[raw, restaurantId]` so it doesn't fire on every render.
- `src/components/Layout/ZoneShell.tsx`: dropped the inner `<Suspense>` (root-level Suspense in `RootLayout` is sufficient). Eliminates fallback-swap flicker.
- `.husky/pre-commit`: runs `pnpm format:staged && pnpm lint`. Wired via `prepare` script in `package.json` (calls `husky`).
- `AGENTS.md`: documented `useNavigateWithTransition` mandate under §Code style.

**Verification**:
- `pnpm format:check` ✅
- `pnpm typecheck` ✅
- `pnpm lint` ✅ (no errors in app code; only pre-existing warnings in `.claude/skills/impeccable/`)
- `pnpm test:run` ✅ — 40 files, 161 tests, all pass.
- `pnpm test:e2e` — 12 failures, **all pre-existing on the clean main branch** (verified via `git stash` baseline). The showcase `/?showcase=1` redirect race is unrelated to Phase 1 work and will be investigated as a separate fix.

**Exit criteria status** (from §Phase 1):
- ✅ `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test:run` green.
- ⏸ Visual smoke test on `/home` in dark mode (no FOUC) — needs `pnpm dev` runtime, not part of CI.
- ⏸ `pnpm test:e2e` — partial. The pre-existing showcase failures block the green-check criterion. Logged separately.

### v1.3 (2026-07-28) — Phase 2 complete

Phase 2 (State & data layer) shipped. The app now talks to the YARP API Gateway via Redux Toolkit + RTK Query, with a single-flight 401 refresh, a typed SignalR hub factory, and an MSW-backed test suite.

**Runtime deps**:
- `@reduxjs/toolkit ^2.12.0`
- `react-redux ^9.3.0`
- `@microsoft/signalr ^10.0.0`
- `msw ^2.15.0` (devDep)

**New files**:

- `src/lib/env.ts` — typed accessor for `VITE_API_BASE_URL` (default `http://localhost:6004`) and `VITE_SIGNALR_URL` (default `http://localhost:6004/kitchen-api`). Dev-mode warning when `VITE_API_BASE_URL` is unset.
- `src/lib/apiClient.ts` — shared `fetch` wrapper with `Authorization` injection, **unified single-flight 401 refresh** (concurrent 401s share one Promise via an in-flight slot), and `ApiError` class. Read by both `apiClient.ts` callers and `base.ts`.
- `src/lib/signalr.ts` — `createKitchenHub()` factory. HubConnection with `withAutomaticReconnect([1000, 2000, 5000, 10000, 30000])`. Typed event map: `OrderReceived`, `ItemStateChanged`, `OrderReady`. URL: `${env.signalrUrl}/hubs/kitchen`.
- `src/app/store.ts` — `configureStore` wires all five RTK Query slices + middleware + `setupListeners` (refetchOnFocus / refetchOnReconnect).
- `src/app/hooks.ts` — typed `useAppDispatch` / `useAppSelector` via `withTypes`.
- `src/app/StorefrontProvider.tsx` — wraps `<RouterProvider>` in `<Provider store={store}>`. Mounted in `main.tsx`.
- `src/app/api/base.ts` — `rawBaseQuery` (injects `Authorization: Bearer <token>` from session slice, sets `credentials: "include"`) + `dynamicBaseQuery` (single-flight 401 refresh + retry).
- `src/app/api/identity.ts` — `login`, `refresh`, `logout`, `currentUser`, `userRestaurants`, plus staff CRUD (`listStaff`, `getStaff`, `createStaff`, `updateStaff`, `deactivateStaff`). Tag types: `Staff`, `Restaurants`.
- `src/app/api/catalog.ts` — `getRestaurants` (global catalog), `getRestaurant`, `getTables`, `getMenu`. Tag types: `Restaurants`, `Tables`, `Menu`.
- `src/app/api/orders.ts` — `getOrders` (filters by `restaurantId` + status), `getOrder`, `createOrder`, `updateOrderStatus`, `proposeModification`, `approveModification`, `splitBill`. Tag type: `Orders`.
- `src/app/api/kitchen.ts` — `getKitchenQueue`, `bumpOrder`. Tag type: `KitchenQueue`.
- `src/app/api/notifications.ts` — `getNotifications`, `markRead`, `markAllRead`. REST inbox only; live push lands with the notifications feature plan.
- `src/app/api/catalog.test.tsx` — Phase 2 E2E proof: renders `<Provider store={store}>` over a Probe that calls `useGetRestaurantsQuery()`; MSW returns the mocked shape; the test asserts `result[0]` matches `{ id, name, cuisine, active }`.
- `src/components/SignalRBoot/SignalRBoot.tsx` — opens the kitchen hub on `enabled=true`; on `OrderReceived` / `ItemStateChanged` / `OrderReady` invalidates the corresponding RTK Query cache tags. Cleans up listeners + stops the hub on unmount.
- `src/test/server.ts` — `setupServer(...handlers)` from `msw/node`.
- `src/test/handlers/{identity,catalog,orders,notifications}.ts` — request handlers per service, all rooted at `http://localhost:6004/<service>-api/*`. Plus `handlers/index.ts` aggregator.
- `src/test/setup.ts` — adds MSW `beforeAll` / `afterEach` / `afterAll` lifecycle to the existing Vitest setup.
- `.env.example` — documents `VITE_API_BASE_URL`, `VITE_SIGNALR_URL`, `VITE_NODE_ENV`. No secrets.

**Wiring**:
- `main.tsx` now mounts `<StrictMode><StorefrontProvider><RouterProvider/></StorefrontProvider></StrictMode>`.
- `<SignalRBoot />` lives in `src/components/SignalRBoot/` but isn't mounted yet — Phase 4 wires `enabled` to the session slice.

**Verification**:

- ✅ `pnpm format:check` — 205 files formatted.
- ✅ `pnpm typecheck`.
- ✅ `pnpm lint` — only pre-existing Fast-Refresh warnings in `ui/*.tsx`.
- ✅ `pnpm test:run` — 41 files, **163 tests** (was 161), all pass. The 2 new tests in `catalog.test.tsx` exercise the full `Provider` → MSW → RTK Query → response pipeline.
- ✅ `pnpm build` — production bundle 645.78 kB (203.41 kB gzipped); both `redux-toolkit` and `signalr` ship in `dist/assets/index-*.js`.
- ⏸ `pnpm test:e2e` — same pre-existing failures as Phase 1. The MSW handlers are wired for Vitest; the Playwright worker setup is a separate task (no MSW worker installed yet — Playwright uses the real gateway or the existing E2E fixtures).

**Exit criteria** (from §Phase 2):
- ✅ `pnpm test:run` runs an RTK Query endpoint through MSW and asserts the response shape.
- ⏸ `pnpm dev` boots; catalog query fires on app start — requires a backend (or the MSW worker setup for dev) to actually return data. The unit test demonstrates the wired path; the runtime smoke test is deferred.
- ✅ `pnpm build` produces a bundle that includes `@microsoft/signalr` and `@reduxjs/toolkit`.

**Notes for downstream phases**:
- Phase 3 adds `sessionSlice` + `sessionMiddleware`. The store already has the reducer slots reserved; the session slice just needs to register under the `session` key.
- The apiClient's `writeAccessToken` / `clearCredentials` paths read `state.session.setCredentials` / `state.session.clearCredentials` directly. When Phase 3 lands, those slots will exist; the current `forceRefetch`-style dispatch is a placeholder.
- `SignalRBoot` reads `enabled` from its props. Phase 4 will mount it inside `StorefrontProvider` and pass `useAppSelector(state => selectIsAuthenticated(state))`.