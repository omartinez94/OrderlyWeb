# Identity Hardening & Route Guards — Implementation Plan

> Scope: Hardens routing guards (RequireAuth/RequireRole), fixes and de-duplicates the single-flight refresh token flow in RTK Query base query and apiClient, optimizes Reselect v5 selectors, and implements the read-only Profile page using shadcn primitives. Consumed by all restaurant and admin operators.

---

## Status

> **Plan version**: `v1.4` (2026-08-04) — `MINOR` increments after each phase completion; `MAJOR` is reserved for breaking restructures of the plan itself.
> **Current state**: ✅ All phases completed

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Route Guard & Redirect Hardening | ✅ Done |
| 2 | Deduplicate Token Refresh & Sync | ✅ Done |
| 3 | Reselect v5 Performance Optimizations | ✅ Done |
| 4 | Profile Page Implementation | ✅ Done |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `docs:`, `chore:`, `test:`, `fix:`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: **on every phase completion, the plan MUST be updated in the same commit as the phase work.** The plan is the source of truth for what was decided and what shipped; a phase that ships without a plan update is a phase that drifted. See [How to use this template](#how-to-use-this-template) for the workflow.

---

## 0. Skill & documentation conventions

### 0.1 Skill mandate — vercel-react-best-practices / react-state-management
> **All implementation work on this plan MUST consult the Vercel React Best Practices guidelines to avoid unnecessary re-renders, unstable selectors, and circular dependencies in Redux state.**

### 0.2 Code-quality guard rails
- **TypeScript strict** — strict mode enabled in compiler options. No `any` outside generated shims.
- **No inline styles** — use Tailwind utility classes or custom colocated `.css` classes.
- **Base Components** — consume UI primitives in `src/components/ui/` (Card, Separator, Button, Avatar).
- **Format and Lint** — run `pnpm format` and `pnpm lint` before committing.

---

## 1. Context

The Orderly Admin Panel has the foundation of routing and Redux configured, but a few technical gaps and bugs are currently present:
- **Routing Gaps:** Unauthenticated users accessing `/site/admin` or `/site/kitchen` see a 403 Forbidden page instead of being redirected to `/login` with a `returnTo` search parameter. If they land on `/`, a blank page is rendered.
- **Token Refresh Bugs:** The RTK Query `dynamicBaseQuery` implements a duplicate token refresh function that does not dispatch new credentials to the Redux store, causing subsequent retried requests to fail or trigger token rotation races.
- **Reselect v5 Warnings:** Inefficient selectors in `headerSelectors.ts` throw warnings during tests due to identity outputs (`(inputs) => inputs`) and unstable array references.
- **Profile Page Missing:** `/profile` renders a static skeleton page.

---

## 2. Goal

- **Harden Guards:** Wrap layout guards with authentication checks so that unauthenticated users redirect to `/login` and see a login screen.
- **Redirects:** Render the marketing `HomePage` or redirect correctly from the root `/` route.
- **Deduplicate Refresh:** Export `refreshAccessToken` from `apiClient.ts` and call it from `base.ts`, synchronizing the Redux state properly on retry.
- **Clean Selectors:** Fix Reselect v5 input stability and identity mappings.
- **Real Profile Page:** Implement the `/profile` page with the user's name, email, roles, permissions list, and default restaurant name using base components.

---

## 3. Out of scope

- **Profile editing** — profile updates or password resets remain out of scope for this milestone.
- **Bulk operations** — bulk management of restaurant staff.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| Gating | Nested `RequireAuth` + `RequireRole` | Protects layouts: checks authentication first, then role access. |
| Token Refresh | Shared Promise in `apiClient.ts` | Prevents token rotation races; ensures one request resolves concurrent 401s. |
| Selectors | Stable Query Maps | Avoids unstable reference updates in Reselect. |
| Profile UI | Shadcn UI primitives | Consistent with "The Quiet Workshop" design aesthetics. |

---

## 5. Folder layout

No new files are added. We harden and refine the following:
- `src/components/RouteGuards/GuardedPage.tsx` — layout guard wrapper.
- `src/components/Layout/RootRedirect.tsx` — root redirect logic.
- `src/components/RouteGuards/useAuthPredicate.ts` — auth bypass flag for local dev.
- `src/lib/apiClient.ts` — export `refreshAccessToken` helper.
- `src/app/api/base.ts` — consume shared refresh helper and remove duplicate implementation.
- `src/app/session/headerSelectors.ts` — optimize notification and restaurant selectors.
- `src/routes/ProfilePage.tsx` — render user details card.

---

## 6. Spec Specification

### 6.1 Route Guard Gating
* **`RequireAuth` integration** — `GuardedPage` must check `RequireAuth` before testing `RequireRole`.
* **`RootRedirect` Home Rendering** — Return `<HomePage />` when unauthenticated to prevent blank screens at `/`.
* **`orderly_real_auth` bypass flag** — `useAuthPredicate.ts` respects a `localStorage` override to let developers test the real auth flow locally.

### 6.2 Token Refresh State Synchronization
* **Shared Promise** — `base.ts` imports and awaits the single-flight `refreshAccessToken` from `apiClient.ts`.
* **Redux Dispatch** — On success, `apiClient`'s refresh helper automatically dispatches `setSessionCredentials`, ensuring the retry uses the correct token in headers.

### 6.3 Reselect Optimizations
* **Stable inputs** — Change input selectors to target the cached query map reference, computing list arrays inside output mappers.
* **Remove identity maps** — Eliminate `(x) => x` mapping.

### 6.4 Profile Card UI
* Display name, email, initials inside a `Card` layout with `Avatar`.
* Render roles as a badge row and list permissions cleanly.
* Match and display the default/active restaurant name.

---

## 7. Integration Points

All endpoints proxy through the YARP gateway. The token refresh endpoint is `/identity-api/auth/refresh`.

---

## 8. Security guardrails

> [!CAUTION]
> The access token must remain in memory only and never be saved to persistent browser storage like localStorage or sessionStorage.

| Risk | Mitigation |
|---|---|
| Token rotation race | Single-flight promise in `apiClient.ts` ensures only one refresh request runs at a time. |
| Stale user cache | Local state is purged on logout or terminal refresh failure. |

---

## 9. Development Phases

### Phase overview

| Phase | Name | Tool groups delivered | Goal |
|:---:|---|---|---|
| **1** | Route Guard & Redirect Hardening | GuardedPage, RootRedirect, Dev bypass flag | Secure zone layouts and direct users to login. |
| **2** | Deduplicate Token Refresh & Sync | baseQuery re-auth integration | Correct the retry credentials synchronization. |
| **3** | Reselect v5 Performance Optimizations | headerSelectors refactoring | Silence Reselect warnings and ensure stable memoization. |
| **4** | Profile Page Implementation | Profile page card view | Display operational profile details using primitives. |

### Phase 1 — Route Guard & Redirect Hardening

**Goal**: Zone pages redirect unauthenticated users to `/login` and the home page renders on `/` when not logged in.

**Status**: ✅ Done (2026-08-04)

**Deliverables**:
- [x] Wrap layouts with `RequireAuth` inside `GuardedPage.tsx`.
- [x] Return `<HomePage />` inside `RootRedirect.tsx` when `!isAuthenticated`.
- [x] Respect `orderly_real_auth === "true"` in `useAuthPredicate.ts`.

**Exit criteria**: Accessing `/site/admin` while logged out redirects to `/login`.

---

### Phase 2 — Deduplicate Token Refresh & Sync

**Goal**: Unify the token refresh helper and ensure credentials update the store on RTK Query 401 retries.

**Status**: ✅ Done (2026-08-04)

**Deliverables**:
- [x] Export `refreshAccessToken` from `apiClient.ts`.
- [x] Consume `refreshAccessToken` in `base.ts`'s `dynamicBaseQuery` and remove local duplicate helper.
- [x] Dispatch `clearCredentials()` on failed refresh attempts.

**Exit criteria**: Vitest session re-auth tests pass without duplicate request warnings.

---

### Phase 3 — Reselect v5 Performance Optimizations

**Goal**: Refactor selectors in `headerSelectors.ts` to solve input instability and identity mapping warnings.

**Status**: ✅ Done (2026-08-04)

**Deliverables**:
- [x] Select query map slices stably.
- [x] Extract and format list arrays inside the output selectors.

**Exit criteria**: `pnpm test` runs with zero Reselect warnings in the console.

---

### Phase 4 — Profile Page Implementation

**Goal**: Profile page displays the user's authentic session details, roles, permissions, and active restaurant using base components.

**Status**: ✅ Done (2026-08-04)

**Deliverables**:
- [x] Construct the read-only Profile UI in `ProfilePage.tsx`.
- [x] Match and display the default restaurant name.
- [x] Implement a destructive sign-out button using UI primitives.

**Exit criteria**: Accessing `/site/admin` while logged out redirects to `/login`.

---

### Phase 1 implementation notes (2026-08-04)

**Bugs found + fixed during implementation.**
- None

**Phase 1 verification (without backend).**
- Verified via `pnpm phase:check` passing successfully.

**Files added.** None. **Files modified:** `src/components/RouteGuards/GuardedPage.tsx`, `src/components/Layout/RootRedirect.tsx`, `src/components/RouteGuards/useAuthPredicate.ts`.

---

### Phase 2 implementation notes (2026-08-04)

**Bugs found + fixed during implementation.**
- Resolved circular refresh token flow by importing shared singleton from `apiClient.ts` directly.

**Phase 2 verification (without backend).**
- Verified via `pnpm phase:check` unit tests passing successfully.

**Files added.** None. **Files modified:** `src/lib/apiClient.ts`, `src/app/api/base.ts`.

---

### Phase 3 implementation notes (2026-08-04)

**Bugs found + fixed during implementation.**
- None

**Phase 3 verification (without backend).**
- Verified via `pnpm phase:check` running Vitest suite with zero Reselect warnings.

**Files added.** None. **Files modified:** `src/app/session/headerSelectors.ts`.

---

### Phase 4 implementation notes (2026-08-04)

**Bugs found + fixed during implementation.**
- None

**Phase 4 verification (without backend).**
- Verified via `pnpm phase:check` running Vitest suite successfully.

**Files added.** None. **Files modified:** `src/routes/ProfilePage.tsx`.

---

## 10. Technical considerations

### 10.1 Cross-cutting
- **Base Components Mandate** — Use the exact UI primitives from `src/components/ui/` for the Profile Page.

---

## Changelog

### v1.0 (2026-08-04) — initial draft
- Created the identity-hardening and guard protection plan covering Phase 1–4.

### v1.1 (2026-08-04) — Phase 1 complete
- Phase 1 status → ✅ Done; `[ ]` → `[x]` on deliverables.
- Phase 1 implementation notes appended.
- Files modified listed in implementation notes.

### v1.2 (2026-08-04) — Phase 2 complete
- Phase 2 status → ✅ Done; `[ ]` → `[x]` on deliverables.
- Phase 2 implementation notes appended.
- Files modified listed in implementation notes.

### v1.3 (2026-08-04) — Phase 3 complete
- Phase 3 status → ✅ Done; `[ ]` → `[x]` on deliverables.
- Phase 3 implementation notes appended.
- Files modified listed in implementation notes.

### v1.4 (2026-08-04) — Phase 4 complete
- Phase 4 status → ✅ Done; `[ ]` → `[x]` on deliverables.
- Phase 4 implementation notes appended.
- Files modified listed in implementation notes.
