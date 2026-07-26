# Authentication & Profile Foundation — Implementation Plan

> Scope: Establish the staff login, session lifecycle, protected routing, read-only profile, restaurant context, and reusable client/server state architecture for the Orderly Admin Panel.

---

## Status

> **Plan version**: `v1.0` (2026-07-26) — minor versions increment after each phase completion; major versions are reserved for breaking restructures of this plan.
> **Current state**: ⏸ Not started

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Contract validation and application foundation | ⏸ Pending |
| 2 | Authentication, login, and session bootstrap | 🔒 Blocked |
| 3 | Protected routing and restaurant context | 🔒 Blocked |
| 4 | Profile, logout, and end-to-end hardening | 🔒 Blocked |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `docs:`, `chore:`, `test:`, `fix:`, `refactor:`). Use a short imperative subject with no trailing period.

> **Update rule**: Every phase completion requires a code commit followed by a plan-only commit that updates this file, checks completed deliverables, records verification evidence, and bumps the minor version.

---

## 0. Skill & documentation conventions

### 0.1 Skill mandates

> All React implementation must follow the `vercel-react-best-practices` skill. State ownership and Redux/RTK Query work must follow the `react-state-management` skill. Login/profile visual work must reuse `DESIGN.md` and should use the `impeccable` skill during implementation and review.

### 0.2 Sources of truth

Read these documents before each phase and update this plan if implementation reveals drift:

- `docs/backend-architecture/architecture.md` — Identity Service, JWT, RBAC, gateway, and security model.
- `docs/backend-architecture/db_relational_model.mermaid` — current relational model and known identity/tenancy discrepancies.
- `docs/website-spec.md` — routes, zone access, auth behavior, navigation, and frontend structure.
- `.harness/docs/auth-flow.md` — token storage, refresh, rehydration, restaurant context, and logout.
- `.harness/docs/api-conventions.md` — one root RTK Query API, gateway-only traffic, errors, and cache invalidation.
- `DESIGN.md` — “The Quiet Workshop” visual language, tokens, typography, shapes, themes, and component rules.
- `.agents/plans/_template.md` — plan lifecycle and completion workflow.

### 0.3 Code-quality guardrails

- Strict TypeScript; no `any` outside an explicitly documented generated API declaration boundary.
- Keep React components functional and avoid `React.FC`.
- Use semantic Tailwind v4 utilities backed by the existing variables in `src/index.css`; do not add a Tailwind v3 configuration.
- Keep the current controlled `Header` presentational. Connect it to application state from an app-shell/container layer.
- No ad-hoc server-state stores or manual feature fetches. Server communication flows through the root RTK Query API.
- Do not add a second state-management library.
- Avoid barrel imports for feature modules and lazy-load zone-level pages.
- Never log tokens or include them in error/reporting payloads.

---

## 1. Context

The working application currently serves as a design-system and Header showcase. It already includes Tailwind v4, Headless UI, light/dark themes, semantic tokens, Fontsource fonts, status components, and a controlled global Header. It does not yet have application routing, Redux, RTK Query, authentication, forms, or automated tests.

Authentication is the correct first product milestone because every staff-facing zone depends on the same session, role, permission, restaurant, API, and error-handling contracts. Establishing these boundaries first prevents each later feature from inventing its own token storage, API client, loading behavior, or restaurant selection logic.

The backend documentation is not fully consistent. The architecture prose describes eight roles and many-to-many restaurant assignments, while the Mermaid `Users` model exposes four roles and one `RestaurantId`. The frontend auth docs require `/api/auth/me`, `/api/auth/refresh`, and `/api/users/me/restaurants`, but the implemented architecture describes service-prefixed YARP routes and OpenIddict refresh through `/connect/token`. These routing, token transport, and identity contracts must be verified before login implementation is considered unblocked.

---

## 2. Goal

Deliver a reusable application foundation with these user-visible outcomes:

- A focused, accessible `/login` page for staff email/password authentication.
- Safe field errors, invalid-credential feedback, account-lockout feedback, rate-limit feedback, and service-failure recovery.
- Session bootstrap before protected content renders using the Phase 1-verified gateway and OpenIddict/Carter contracts; no endpoint path or refresh transport is assumed in advance.
- Memory-only access-token handling and browser-managed httpOnly refresh cookies.
- Protected routes with validated internal return paths and explicit role-based zone access.
- Role-default navigation to admin, kitchen, or restaurant zones.
- Active restaurant context independent of authentication, synchronized with `?restaurantId=`.
- Existing Header controls connected to real user and restaurant state.
- A read-only `/profile` view showing identity, roles, permissions, and active restaurant.
- Centralized optimistic logout that purges authenticated and tenant-scoped state and replace-navigates to `/login`.
- Unit, component, integration, accessibility, and E2E coverage for the complete flow.

---

## 3. Out of scope

- Self-service profile editing until the backend defines and exposes an authenticated self-service endpoint.
- Forgot-password, password reset, password change, MFA, or device/session management.
- Staff creation, role assignment, or restaurant assignment administration.
- SignalR connection implementation; only its future session lifecycle boundary may be documented.
- Orders, KDS, tables, menu, reservations, queue, feedback, and analytics functionality.
- Offline support, PWA behavior, or cross-device session synchronization.
- Customer authentication; this milestone is staff-facing.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| Client/global state | Redux Toolkit | Mandated by the frontend architecture and suitable for session, tenant context, and cross-feature events. |
| Server state | One root RTK Query `createApi` | Provides one cache, one auth wrapper, and coherent tag invalidation across microservice boundaries. |
| Feature endpoints | `api.injectEndpoints` | Keeps endpoint definitions colocated without fragmenting the cache. |
| Local UI state | `useState` / `useReducer` | State stays as close to its consumer as possible. |
| Form state | React Hook Form + Zod (`zod`, `@hookform/resolvers`) | Keeps transient credentials out of Redux and supports typed field errors. Zod is the standard for strict TS validation. |
| URL state | React Router search params | `returnTo` and `restaurantId` are navigational/shareable state. |
| Access-token storage | Redux memory only | Required by `.harness/docs/auth-flow.md`; avoids durable token exposure. |
| Refresh-token storage | Backend-set httpOnly cookie | JavaScript must never read or write the refresh token. |
| API transport | RTK Query `fetchBaseQuery` with typed re-auth wrapper | Avoids a redundant HTTP library and centralizes headers, errors, refresh, and retry behavior. |
| Router | React Router v6 data router | Supports nested shells, route errors, lazy zone pages, and replace navigation. |
| Styling | Existing Tailwind v4 + Headless UI + `DESIGN.md` tokens | Reuses the implemented design system rather than introducing another component language. |
| Profile scope | Read-only | No documented self-service profile mutation contract exists. |
| Tests | Vitest, React Testing Library, MSW, Playwright | Covers reducers/API behavior, user interactions, HTTP scenarios, and full browser flows. |

---

## 5. Folder layout

Representative target layout; colocated tests should sit beside the modules they verify where practical.

```text
src/
├── app/
│   ├── api.ts                         # one root createApi
│   ├── hooks.ts                       # typed Redux hooks
│   ├── listenerMiddleware.ts          # logout and restaurant-switch effects
│   └── store.ts
├── components/
│   ├── Header/                        # existing controlled Header; adapt, do not replace
│   ├── Layout/
│   │   ├── AppShell.tsx
│   │   ├── RequireAuth.tsx
│   │   └── RequireRole.tsx
│   └── ui/                            # minimal shared form/action primitives
├── features/
│   ├── auth/
│   │   ├── authApi.ts
│   │   ├── authSlice.ts
│   │   ├── authSelectors.ts
│   │   └── components/
│   │       ├── AuthBootstrap.tsx
│   │       └── LoginForm.tsx
│   └── restaurant/
│       ├── restaurantApi.ts
│       ├── restaurantSlice.ts
│       └── restaurantSelectors.ts
├── lib/
│   ├── apiClient.ts                   # gateway base query + single-flight re-auth
│   ├── authRedirect.ts                # safe return path and role-default route
│   └── env.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── ProfilePage.tsx
│   ├── ForbiddenPage.tsx
│   └── zone placeholders              # lazy route boundaries only
├── router/
│   └── router.tsx
├── test/
│   ├── fixtures/
│   └── msw/
│       ├── handlers.ts
│       └── server.ts
└── types/
    └── api.d.ts                       # verified backend DTOs and error contracts

e2e/
└── auth.spec.ts
```

Critical existing files to modify rather than replace:

- `src/main.tsx` — add providers and router entry.
- `src/App.tsx` — move the design showcase to a dedicated development route or page.
- `src/index.css` — reuse existing Tailwind v4 tokens and themes.
- `src/lib/tokens.ts` — keep semantic token definitions as the visual source of truth.
- `src/components/Header/Header.tsx` and related Header modules — wire controlled props/callbacks through `AppShell`.
- `package.json` and `pnpm-lock.yaml` — add only approved runtime/test dependencies and scripts.

---

## 6. Authentication, Profile & State Specification

### 6.1 State ownership contract

| State category | Owner | Examples |
|---|---|---|
| Server state | RTK Query | current user response, accessible restaurants, future orders/menu data |
| Global client state | Redux slices | access token, session status, active restaurant ID |
| URL state | React Router | `returnTo`, active `restaurantId`, future filters that must be shareable |
| Form state | React Hook Form | login email/password, field validation, touched/dirty state |
| Local UI state | component hooks | password visibility, popover state not owned by Headless UI |
| Derived state | selectors/render | `isAuthenticated`, current restaurant object, zone access |

Do not duplicate the current user or restaurant collection unnecessarily across both RTK Query and slices. The implementation may normalize login/bootstrap responses into auth state, but one authoritative representation and explicit selectors must be documented in Phase 1.

### 6.2 Auth state

Recommended shape:

```ts
type SessionStatus = 'checking' | 'authenticated' | 'anonymous';

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  status: SessionStatus;
}
```

`isAuthenticated` is derived from `status === 'authenticated' && user !== null`; avoid a separately mutable boolean that can drift. The slice must not use persistence middleware.

Expected normalized user contract:

```ts
interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: Role[];
  permissions: string[];
  restaurantId: string;
}
```

Derive display-only values such as `name` and `initials` in selectors/view-model adapters rather than assuming the wire DTO provides them. If the verified response includes a canonical `name` claim, retain it in the wire type but still centralize Header mapping. A successful login, bootstrap, or refresh that resolves to `isActive === false` is terminal: clear session state and show a non-enumerating “Your account has been deactivated” message.

The exact wire casing, response envelope, identifier types, role values, and permission values remain blocked on Phase 1 verification.

### 6.3 Root API and error normalization

- Define one root `createApi` in `src/app/api.ts`.
- Configure its base URL from validated `VITE_API_BASE_URL` and set `credentials: 'include'` for gateway requests.
- `prepareHeaders` reads the access token from Redux memory and adds `Authorization: Bearer …` when present.
- All feature modules use `injectEndpoints`.
- Keep tag types broad enough for later modules, including `User`, `Restaurant`, `Order`, `Menu`, `Table`, `Reservation`, `Queue`, `Feedback`, and `Notification`.
- Normalize the verified backend error into a typed frontend error with HTTP status, stable code, safe message, and optional field details. Include graceful fallback normalization for network disconnections (e.g., `TypeError: Failed to fetch`).
- Login form field details map through React Hook Form `setError`; Phase 1–4 authentication failures use accessible inline/form-level states. Toast infrastructure is explicitly deferred until a shared notification plan exists.
- Handle `403 Forbidden` through typed route/error state. Do not introduce a one-off auth toast system; redirect to the forbidden page when route access is revoked and render an inline action error for mutations.

### 6.4 Single-flight 401 refresh

`src/lib/apiClient.ts` wraps the raw base query. The symbolic `refreshRequest` below is resolved in Phase 1: it may be a cookie-aware Carter wrapper or OpenIddict `/connect/token` with a different media type and token transport. Do not implement the latter by exposing an httpOnly refresh token to JavaScript.

1. Execute the original request.
2. Return immediately unless it fails with 401.
3. Never start re-auth for login, the verified refresh endpoint, or another terminal identity request.
4. If no refresh is in flight, start exactly one verified refresh request.
5. Concurrent failed requests await the same refresh promise.
6. On success, write only the new access token to Redux and retry each original request once.
7. Validate the refreshed/session user is active; deactivation uses centralized terminal cleanup.
8. On terminal refresh failure, dispatch the centralized local session-clear action.
9. Never recursively retry a refresh 401, and never retry the original request more than once.
10. Reactive refresh is the MVP behavior. Record proactive refresh 30–60 seconds before JWT expiry as a post-MVP follow-up, to avoid periodic 401 bursts once realtime and high-request-volume screens are introduced.

Tests must prove that multiple concurrent 401 responses produce one refresh request and that an inactive account terminates the session.

### 6.5 Startup session bootstrap

`AuthBootstrap` runs before protected route content becomes visible. It must use cancellable RTK Query dispatches/subscriptions (or an explicit `AbortController` if verified contract handling requires a manual request) so Strict Mode remounts and unmounts cannot commit stale results.

The preferred sequence, if the backend confirms `/me`, is:

1. Set session status to `checking`.
2. Execute the verified current-user request through the verified gateway path.
3. On 200, normalize the user; terminate the session if `isActive === false`, otherwise populate canonical session state.
4. On 401, execute the verified refresh mechanism.
5. On refresh success, store the access token and retry the current-user request.
6. On terminal failure, mark the session `anonymous`.
7. Render a stable branded loading state while checking to avoid login/protected-content flashes.
8. Abort/unsubscribe on teardown and ignore stale completions.

If no current-user endpoint exists, Phase 1 must choose and document one backend-approved fallback:

- Prefer adding a dedicated Identity self endpoint that returns the normalized `UserDto`; or
- Refresh through the verified OpenIddict flow, decode the signed access-token claims only to restore client session/display state, and optionally supplement them through `/connect/userinfo` or a permitted self-user endpoint.

JWT decoding in this fallback is not authorization. Frontend guards remain UX hints and backend validation remains authoritative. The plan must not fall back to an admin-only `/api/users/{id}` call unless the backend explicitly authorizes self-read access.

### 6.6 Login page

- Route: `/login`; it is the only public application route in this milestone.
- Fields: email and password, both visibly labelled and compatible with password managers (`username`, `current-password`).
- Keep credential values inside React Hook Form; never dispatch them to Redux.
- "Remember Me" functionality is out of scope unless the backend explicitly supports distinguishing between session and persistent cookies.
- Disable repeated submit while the mutation is pending.
- Error behavior must distinguish invalid credentials, locked account, rate limiting, field validation, and unavailable service without leaking whether an account exists.
- Use `aria-invalid`, `aria-describedby`, and a form-level `aria-live="polite"` region.
- Preserve focus rings, keyboard submission, reduced-motion preferences, and sufficient touch targets.
- Follow `DESIGN.md`: Sage Linen page surface, semantic tokens only, Urbanist body, MuseoModerno title, flat tonal layering, and one restrained use of the brand gradient. Burnt Tangerine is not a general login CTA color.
- If already authenticated, replace-navigate away from `/login` to the validated return path or role-default zone.

### 6.7 Return path and role-default navigation

- Preserve the originally requested protected path as an internal `returnTo` value.
- Accept only same-origin application paths from a strict allowlist/prefix map; reject schemes, protocol-relative paths, backslashes, and unknown routes.
- Use `replace` after successful login and logout.
- Resolve the first matching role from this explicit priority, independent of backend claim order:

  ```ts
  const ROLE_PRIORITY: ReadonlyArray<readonly [Role, string]> = [
    ['SuperAdmin', '/site/admin'],
    ['RestaurantAdmin', '/site/admin'],
    ['KitchenManager', '/site/kitchen'],
    ['KitchenStaff', '/site/kitchen'],
    ['Manager', '/site/restaurant'],
    ['Waiter', '/site/restaurant'],
    ['Cashier', '/site/restaurant'],
    ['Host', '/site/restaurant'],
  ];
  ```

- Test multi-role collisions explicitly, including `KitchenManager + Manager` and `RestaurantAdmin + KitchenManager`.
- A user with no recognized role reaches a forbidden/no-access state rather than an arbitrary zone.

### 6.8 Route guards

- `RequireAuth` waits for bootstrap completion, then redirects anonymous users to login with a safe return path.
- `RequireRole` handles zone-level role access and renders/redirects to a dedicated forbidden state. A `RequirePermission` component or `usePermissions` hook should also be defined for granular UI element rendering (e.g., hiding specific buttons based on the `permissions` array).
- Frontend guards improve UX only. The backend remains authoritative and every protected request must still enforce authorization.
- Handle the documented Manager exception for `/site/admin/staff` explicitly in that future route; do not grant Managers access to the full admin zone.
- Zone pages should be route-level lazy chunks so login/profile do not load admin, kitchen, and restaurant feature bundles.

### 6.9 Restaurant context

Recommended client context:

```ts
interface RestaurantState {
  activeRestaurantId: string | null;
}
```

The accessible restaurant collection should remain RTK Query server state unless implementation proves a separate normalized client copy is necessary.

- Treat `user.restaurantId` as the default restaurant, not the complete access list.
- Load accessible restaurants from the verified `/api/users/me/restaurants` contract after authentication.
- Validate a URL `restaurantId` against the accessible list before selecting it.
- Keep the active ID and `?restaurantId=` synchronized without navigation loops.
- Switching restaurants invalidates all restaurant-scoped tags, but does not replace the access token.
- A single-restaurant user sees a static restaurant label rather than an unnecessary switching interaction, matching the existing Header behavior.
- An empty restaurant list gets an explicit no-assignment state with a safe logout path.

### 6.10 Header and app shell integration

- Keep `src/components/Header/Header.tsx` controlled and free from direct Redux/API imports.
- `AppShell` selects the current user, restaurant list, active restaurant, and route zone, then maps them into Header props.
- Add an explicit view-model adapter from verified `UserDto` to Header `CurrentUser`: derive `name` and `initials`, never extend the transport DTO with presentation-only fields.
- Reconcile Header `RestaurantRole` (`Owner | Manager | Staff`) with the verified backend role/restaurant-access contract. Prefer removing that lossy type from runtime data or introducing a separate display-label mapping rather than pretending it is the backend eight-role enum.
- Replace Header mock callbacks with app-shell callbacks for restaurant selection, profile navigation, and logout.
- Keep mock data for the dedicated design-system showcase and component tests; do not ship it into authenticated runtime state.
- Preserve existing Header accessibility, themes, and visual rules.

### 6.11 Read-only profile

Route `/profile` displays:

- Name and email.
- Stable user identifier where operationally useful.
- Assigned roles.
- Effective permissions, grouped or collapsible if the list is long.
- Active restaurant name and identifier.
- Logout action.

Use semantic headings and definition lists. Do not render editable fields, save controls, or a speculative request. Add a plan follow-up—not an invented endpoint—for self-service profile mutation once the backend publishes a contract.

### 6.12 Logout

Centralize logout so Header, Profile, terminal refresh failure, and future session-expiry events cannot drift:

1. Optimistically clear auth state.
2. Reset active restaurant state.
3. Purge the RTK Query cache.
4. Make a best-effort `POST /api/auth/logout` request.
5. Ignore network failure for local cleanup, while allowing safe telemetry later.
6. Replace-navigate to `/login`.

The frontend does not and cannot directly clear an httpOnly cookie; the backend logout response owns cookie revocation.

---

## 7. Backend integration and contract gate

All requests go through YARP using `VITE_API_BASE_URL`; production code must never call service ports directly. The backend routing table currently exposes `/identity-api/{**catch-all}` without an obvious prefix-removal transform, so service-local paths such as `/api/auth/login` are not assumed to be gateway paths. Phase 1 must test the actual externally reachable URL (the architecture example currently shows `https://localhost:6064/identity-api/api/auth/login`) and update `.harness/docs/api-conventions.md` / `.harness/docs/auth-flow.md` if those docs are stale.

Before Phase 2 starts, verify these symbolic operations against the running YARP gateway and authoritative OpenAPI/OpenIddict metadata:

| Operation | Candidate path(s) to verify | Required verification |
|---|---|---|
| Login | `/identity-api/api/auth/login` vs service-local `/api/auth/login` | Gateway prefix/transform, request fields/media type, response envelope/casing, claims/user shape, token location, cookie behavior, 400/401/423/429 bodies |
| Refresh | `/identity-api/connect/token` with `grant_type=refresh_token` vs a custom `/identity-api/api/auth/refresh` wrapper | Which endpoint actually exists; JSON vs form encoding; where the refresh token comes from; whether an httpOnly cookie can support the flow; client ID requirements; rotation; terminal errors |
| Logout | `/identity-api/api/auth/logout` | Gateway path, status code, token revocation, cookie revocation, idempotency |
| Current user | `/identity-api/api/auth/me`, `/identity-api/connect/userinfo`, or another self endpoint | Existence, credentials/token requirements, claims vs rich DTO, `isActive`, roles, permissions, restaurant ID |
| Accessible restaurants | `/identity-api/api/users/me/restaurants` or verified equivalent | Existence, authorization, restaurant DTO, per-restaurant role shape, ordering/default indicator, empty behavior |
| OIDC discovery | `/identity-api/.well-known/openid-configuration` or exposed equivalent | Published token/userinfo endpoints and whether gateway prefixing is represented correctly |

The refresh decision is a potential backend requirement, not merely a frontend detail. Standard OpenIddict `/connect/token` expects `application/x-www-form-urlencoded` and a refresh token value in the request, while the frontend security contract requires that token to remain httpOnly and inaccessible to JavaScript. If the backend does not already bridge cookie-based refresh to OpenIddict, Phase 2 stays blocked until the backend provides a secure browser-compatible flow; the frontend must not weaken token storage to make the standard request work.

The Phase 1 implementation notes must resolve:

1. Exact YARP-proxied Identity URL prefixes and any path-removal transforms.
2. Standard OpenIddict `/connect/token` versus a custom cookie-aware refresh wrapper, including media type and token transport.
3. RFC 7807 versus the custom `{ success, data, error }` envelope documented elsewhere.
4. Eight prose roles versus the four-role Mermaid enum.
5. Multiple roles and M:N restaurant access versus the Mermaid single-role/single-restaurant shape.
6. String versus numeric identifiers in token examples and DTOs.
7. Refresh-cookie `HttpOnly`, `Secure`, `SameSite`, `Path`, and `Domain` values.
8. Backend CSRF protections for cookie-authenticated refresh/logout requests.
9. Whether `/me` exists; otherwise which approved fallback in §6.5 supplies canonical session/display state.
10. `firstName`, `lastName`, `Name`, `isActive`, role, permission, and restaurant claim casing/serialization.

If the current-user, refresh, or accessible-restaurants operation has no secure browser-compatible contract, mark dependent work blocked and update this plan with the required backend work. Do not silently drop gateway prefixes, expose refresh tokens to JavaScript, call an admin-only user endpoint, or weaken multi-restaurant behavior.

---

## 8. Security guardrails

> [!CAUTION]
> Access and refresh tokens must never be persisted, exposed to JavaScript storage, logged, or included in analytics/error payloads.

| Risk | Mitigation |
|---|---|
| Token theft through durable browser storage | Store the access token in Redux memory only; refresh token remains httpOnly. |
| Refresh storms from concurrent 401 responses | One shared in-flight refresh and one retry per original request. |
| Infinite refresh recursion | Exclude login/refresh requests and treat refresh 401 as terminal. |
| Open redirect through `returnTo` | Accept only validated same-origin application paths. |
| Cross-tenant stale cache | Purge on logout and invalidate all restaurant-scoped tags on restaurant switch. |
| Frontend role bypass | Treat guards as UX only; backend authorization remains required. |
| CSRF against cookie endpoints | Verify backend SameSite/CSRF controls during Phase 1; do not assume frontend headers solve it. |
| Direct microservice bypass | Configure only the gateway base URL and scan source for direct service hosts/ports from the verified YARP configuration (currently including 6000–6007 service ports). |
| Sensitive error leakage | Normalize backend errors to user-safe messages; never expose hashes, raw tokens, or account-existence details. |
| Cached authenticated history after logout | Clear state/cache and replace-navigate to login; verify browser-back behavior in E2E. |

---

## 9. Development Phases

### Phase overview

| Phase | Name | Groups delivered | Goal |
|:---:|---|---|---|
| **1** | Contract validation and application foundation | API contracts, dependencies, store/API, test harness | Establish verified boundaries before feature code. |
| **2** | Authentication, login, and session bootstrap | Auth slice/API, refresh, bootstrap, Login UI | Sign in and restore sessions safely. |
| **3** | Protected routing and restaurant context | Guards, zones, restaurant state, Header shell | Enforce navigation and tenant context. |
| **4** | Profile, logout, and end-to-end hardening | Profile, centralized logout, E2E/a11y/performance | Make the milestone shippable and verifiable. |

### Phase 1 — Contract validation and application foundation

**Goal**: Confirm backend contracts and create the reusable store, API, routing, and test foundations without implementing product auth UI prematurely.

**Status**: ⏸ Pending

**Deliverables**:

- [ ] Verify all §7 Identity/YARP contracts, including externally reachable service-prefixed paths, and record exact request/response examples in implementation notes.
- [ ] Determine whether refresh uses OpenIddict `/connect/token` or a secure cookie-aware Carter wrapper; if neither satisfies the browser token-storage contract, record the required backend work and keep Phase 2 blocked.
- [ ] Resolve or explicitly block the current-user endpoint/fallback, role, restaurant, response-envelope, cookie, and CSRF discrepancies.
- [ ] Add approved runtime dependencies: Redux Toolkit, React Redux, React Router, React Hook Form, Zod, and `@hookform/resolvers`.
- [ ] Add approved test dependencies and scripts for typecheck, Vitest/RTL/MSW, coverage, and Playwright.
- [ ] Create the root store, root RTK Query API, typed hooks, environment validation, error normalization, and listener middleware skeleton.
- [ ] Configure the test harness and provider/API smoke tests.
- [ ] Preserve the current design showcase at a dedicated development route/page rather than deleting it.
- [ ] Keep the current Tailwind v4 Vite setup; do not introduce obsolete Tailwind v3 config files.

**Exit criteria**: Verified contracts are documented; `pnpm typecheck`, `pnpm lint`, provider/API smoke tests, and `pnpm build` pass. Phase 2 is unblocked only if the required session endpoints are confirmed.

---

### Phase 2 — Authentication, login, and session bootstrap

**Goal**: Users can authenticate, protected content waits for session resolution, and expired access tokens refresh safely without persistence.

**Status**: 🔒 Blocked by Phase 1

**Deliverables**:

- [ ] Implement typed auth DTOs (`firstName`, `lastName`, `isActive`, roles, permissions, default restaurant), `authSlice`, selectors, and injected auth endpoints.
- [ ] Implement `baseQueryWithReauth` using the verified OpenIddict/Carter refresh mechanism, with header injection, single-flight refresh, one retry, active-account validation, and terminal cleanup.
- [ ] Implement cancellable startup session bootstrap using the verified current-user contract or approved §6.5 fallback; clean up safely under Strict Mode.
- [ ] Build the accessible Login page/form with existing semantic design tokens.
- [ ] Normalize and render field, credential, lockout, rate-limit, and service errors.
- [ ] Implement safe internal `returnTo` validation and role-default redirect.
- [ ] Test reducers, response transformations, bootstrap branches, login interactions, and concurrent 401 behavior.
- [ ] Add a source test/scan proving no auth token is stored in web storage or cookies by frontend code.

**Exit criteria**: Mocked login, session bootstrap, refresh/retry, and terminal-expiry flows pass; no token survives a full reload except through the backend-managed refresh cookie.

**Adoption note (added 2026-07-26, base-components plan v1.8)**: When this phase ships, the `LoginForm` and `ProfilePage` **must** consume the base components shipped by `.agents/plans/base-components/base-component-library.md` rather than hand-rolled HTML. Concretely:
- `LoginForm` uses `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `Input`, `Button` (default for submit, link for "forgot password").
- `ProfilePage` uses `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `Avatar` + `AvatarFallback` for the identity block, `Separator` between sections, and `Button variant="destructive"` for the sign-out action.
- The sign-out `AlertDialog` ships with the AlertDialog primitive from Phase 5.
- The toast for "session expired" / "signed out" ships with the Sonner `toast` helper from Phase 6 (`politeness: polite`).

Open `?showcase=1` in the dev server to confirm the visual contract before writing the phase-4 code.

---

### Phase 3 — Protected routing and restaurant context

**Goal**: Authenticated staff can access only their allowed zones and operate in a validated active-restaurant context through the existing Header.

**Status**: 🔒 Blocked by Phase 2

**Deliverables**:

- [ ] Create router tree, authenticated app shell, forbidden/not-found handling, and lazy zone placeholders.
- [ ] Implement `RequireAuth` and explicit role/permission-aware guards.
- [ ] Implement deterministic role-priority routing from the ordered matrix in §6.7, independent of backend role-array order.
- [ ] Test multi-role collisions and the no-recognized-role state.
- [ ] Implement restaurant API/context, URL synchronization, validation, empty state, and scoped tag invalidation.
- [ ] Connect the controlled Header to real user, restaurant, zone, profile, and logout callbacks through `AppShell`.
- [ ] Add and test the explicit `UserDto` → Header `CurrentUser` view-model adapter (`name`, `initials`) and resolve the lossy `RestaurantRole` type against the verified backend contract.
- [ ] Preserve Header mocks only for showcase/tests.
- [ ] Test every documented role’s default zone and denied zones.
- [ ] Test Manager’s future staff-route exception without granting broad admin access.
- [ ] Test single/multiple/no restaurant states, invalid URL restaurant IDs, and cache invalidation.

**Exit criteria**: Each role lands in and can navigate only its documented zones; the active restaurant is valid, URL-synchronized, and isolated from stale tenant cache.

---

### Phase 4 — Profile, logout, and end-to-end hardening

**Goal**: Complete the read-only account experience, centralize session termination, and verify the entire milestone in a real browser.

**Status**: 🔒 Blocked by Phase 3

**Deliverables**:

- [ ] Implement the read-only Profile page using semantic identity/role/permission/restaurant presentation.
- [ ] Wire Profile and Logout in the existing Header user menu.
- [ ] Centralize optimistic logout, cache purge, restaurant reset, best-effort API logout, and replace navigation.
- [ ] Ensure terminal refresh failure uses the same cleanup path.
- [ ] Add route-level lazy loading and review selector granularity/direct imports under Vercel React guidance.
- [ ] Add Playwright flows for login → zone redirect → profile → logout → browser back.
- [ ] Add E2E scenarios for invalid credentials, denied role, and session expiry.
- [ ] Run keyboard, screen-reader semantics, contrast, reduced-motion, responsive, and automated accessibility checks.
- [ ] Verify bundle output keeps zone code out of the login chunk.
- [ ] Document deferred self-service profile editing as a backend-contract follow-up.

**Exit criteria**: Typecheck, lint, unit/component tests, feature coverage, build, E2E auth flows, accessibility checks, and security source scans all pass.

---

### Phase N implementation notes (append after completion)

**§ items adopted in Phase N.**
- Item — `[✅ adopted | ⚠ deferred | ❌ rejected]` resolution and rationale.

**Backend contracts verified.**
- Endpoint — exact request/response/error behavior and OpenAPI/source reference.

**Bugs found and fixed during implementation.**
- Symptom — resolution.

**Deferred follow-ups.**
- Item — owning plan/ticket and reason.

**Phase N verification.**
- Command/manual check — actual result.

**Files added.** List. **Files modified:** List.

---

## 10. Technical considerations

### 10.1 Cross-cutting

- **Current design-system work is reusable, not throwaway.** Preserve `DESIGN.md`, semantic CSS tokens, ThemeToggle, StatusPill, and the controlled Header. Move the showcase out of the runtime root rather than deleting it.
- **Tailwind version matters.** The repository already uses Tailwind v4 through `@tailwindcss/vite`; do not copy v3-era `tailwind.config.ts`/PostCSS setup from generic plans.
- **Do not duplicate server collections.** Accessible restaurants should remain RTK Query data while Redux owns only active context unless profiling proves otherwise.
- **Avoid whole-store subscriptions.** Header subcomponents should select primitives/derived values or receive stable controlled props from `AppShell`.
- **Start independent requests together.** Once authenticated, user-dependent restaurant loading and other independent bootstrap work should avoid avoidable waterfalls.
- **JWT claims are not authorization truth.** Claims may restore client session/display state only when Phase 1 confirms no richer self endpoint exists; frontend guards remain UX hints and backend authorization remains authoritative.
- **Reactive refresh is MVP-only.** Add proactive refresh 30–60 seconds before expiry as a follow-up when realtime/high-volume screens land; cancellation, visibility changes, and clock skew must be designed before adding a timer.
- **Auth errors remain inline in this milestone.** Do not introduce an isolated toast dependency or component before the shared notification architecture is planned.
- **No unsupported profile mutations.** A disabled Save button or fake edit form is misleading; ship a useful read-only profile instead.

### 10.2 Verification matrix

The final phase must run and record:

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test -- --run` or the final equivalent script
4. `pnpm test:coverage` with at least 70% line coverage for `src/features/`
5. `pnpm build`
6. `pnpm test:e2e`
7. Manual keyboard and responsive review of `/login` and `/profile`
8. Automated accessibility checks with zero serious/critical violations
9. Source scan for `localStorage`, `sessionStorage`, `document.cookie`, token logging, and direct service hosts/ports that bypass the configured YARP gateway
10. When the gateway is available: login → authenticated request → forced access-token refresh → logout, with cookies and response bodies inspected

### 10.3 Performance acceptance

- Login/profile bundles must not eagerly import zone feature pages.
- Prefer direct imports over feature barrel imports.
- Keep design-system showcase code out of production runtime chunks where feasible.
- Use stable selectors and avoid subscribing to state used only inside callbacks.
- Do not add memoization around trivial primitive derivations.
- Parallelize independent authenticated bootstrap requests once their prerequisites are available.

---

## Changelog

### v1.0 (2026-07-26) — initial draft

- Created the four-phase authentication, profile, routing, and state-management plan.
- Selected Redux Toolkit for global client state and one root RTK Query API for server state.
- Preserved the existing Tailwind v4 design system and controlled Header as implementation foundations.
- Added a mandatory backend contract gate for `/auth/me`, restaurant access, roles, response envelopes, refresh cookies, and CSRF behavior.
- Kept the first profile milestone read-only because no self-service mutation endpoint is documented.
- Incorporated architecture review findings: YARP service prefixes, OpenIddict refresh ambiguity, current-user fallback, active-account handling, cancellable bootstrap, explicit multi-role priority, and Header DTO/view-model alignment.
