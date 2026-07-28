# Staff Management — Deep Dive

> Scope: Full Staff CRUD rules, validation, edge cases, audit trail, restaurant assignment semantics, and operational behavior for `/site/admin/staff`. Builds on the data layer, auth slice, and Header live wiring delivered by the sibling `app-foundation-completion.md` plan. Consumers: Restaurant Admins, SuperAdmins.

---

## Status

> **Plan version**: `v0.4` (2026-07-28) — `MINOR` increments after each phase completion; `MAJOR` is reserved for breaking restructures of the plan itself.
> **Current state**: 🚧 Phase 3 in progress.

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Roles & permission matrix | ✅ Done |
| 2 | Restaurant assignment semantics | ✅ Done |
| 3 | Deactivation & soft-delete flow | ✅ Done |
| 4 | Audit trail & activity log | ⏸ Pending |
| 5 | Edge cases & operational behavior | ⏸ Pending |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `docs:`, `chore:`, `test:`, `fix:`, `refactor:`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: **on every phase completion, the plan MUST be updated in the same commit as the phase work** (code + docs, two commits). See the template's [phase-completion workflow](#the-phase-completion-workflow) for the exact structure.

---

## 0. Skill & documentation conventions

### 0.1 Skill mandate
> **All implementation work on this plan MUST** consult `/vercel-react-best-practices` before shipping a component or hook. For new base components, also `/shadcn-ui`. For the Staff management surface, follow the `/impeccable` typography and color rules.

### 0.2 Code-quality guard rails
- **TypeScript strict** — `tsconfig.app.json` already has `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`. No `any` outside generated DTO shims.
- **No inline `style={{}}`** — Tailwind utility class, CSS file, or documented dynamic-value exception (per `AGENTS.md` §Code style).
- **Format (oxfmt)**: 2-space indent, double quotes, 100-char width, trailing commas, LF line endings. Run `pnpm format` before committing.
- **Lint (oxlint)**: `pnpm lint` must pass before any commit.
- **Typecheck**: `pnpm typecheck` must pass before any commit.
- **Tests** — Vitest + jest-axe for components; Playwright for E2E. New components must ship with colocated `*.test.tsx` covering open/closed states and the keyboard contract.
- **Forms** — `react-hook-form` + `zod` (already in `package.json`). Schema types flow into the form via `z.infer`.
- **Feature module seam** — `src/features/staff/` is the feature boundary. The data layer (`src/app/api/identity.ts`) is reached through `features/staff/api.ts`, not directly.

---

## 1. Context

The Orderly Staff module is the system of record for staff membership, role grants, and restaurant assignments. A Restaurant Admin invites a new staff member; the new staff member arrives in the list, receives an email with a one-time activation link, completes their profile, and signs in to the app with the granted role. SuperAdmins can manage every restaurant in the tenant.

The app-foundation-completion plan wired the auth slice, the Header, and the staff CRUD endpoints at the data layer. The list / new / detail pages render real components (Phase 5 of the foundation plan) but the rules below are still TODO at the business-logic layer:

- Role grant rules — who can grant which roles to whom.
- Restaurant assignment — a staff member may hold roles at multiple restaurants; the role is per-restaurant, not global.
- Deactivation semantics — soft-delete vs. hard-delete; what happens to in-flight orders authored by the deactivated user.
- Audit trail — who changed what, when.

This plan covers those rules.

---

## 2. Goal

- **Roles & permission matrix** — concrete role-to-permission map (and the rules around grant/revoke).
- **Restaurant assignment** — a staff member can hold different roles at different restaurants. The data model is `StaffMember.restaurantIds: string[]` plus a derived per-restaurant role list.
- **Deactivation & soft-delete** — `active: false` keeps the staff member in the DB (audit / historical reports) but blocks sign-in. A reactivation path restores `active: true`.
- **Audit trail** — every create / role-change / restaurant-assignment / deactivate / reactivate action lands in the audit log with actor, target, before, after, timestamp.
- **Edge cases** — duplicate invitations, expired activation links, two Restaurant Admins editing the same staff member concurrently (last-writer-wins with a 409 conflict path), bulk operations.

---

## 3. Out of scope

- **Authentication implementation** — sign-in flow, JWT rotation, refresh-token storage. Owned by the foundation plan.
- **Notifications** — invitation email, password-reset email. Live push via SignalR is part of the foundation's `/hubs/notifications` (not yet wired).
- **Permissions engine** — the schema that maps role → permissions is owned by the Identity Service backend; the frontend consumes the resolved list and renders gates. No client-side permission authoring.
- **Bulk operations UI** — CSV import / export. Phase 5+ follow-up.
- **Multi-tenant onboarding** — when a new tenant joins, the initial SuperAdmin is provisioned by the backend, not by Staff Management.
- **Mobile admin** — the Staff pages are desktop-first. A mobile-friendly admin lands later.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| Data layer | `identityApi` (RTK Query, foundation) | Already wired; Phase 5 of foundation plumbed `listStaff` / `getStaff` / `createStaff` / `updateStaff` / `deactivateStaff`. New endpoints (`reactivateStaff`, `getAuditLog`) extend `identityApi`. |
| Role model | 8 fixed roles in `Role` union | Defined in `src/types/auth.ts`. The Identity Service is the source of truth; client never authors new roles. |
| Restaurant membership | `restaurantIds: readonly string[]` on `StaffMember` | Per-restaurant role list is derived by the Identity Service (`getStaffForRestaurant`). Client filters the global list by `restaurantId` query param. |
| Form schema | `react-hook-form` + `zod` resolver | Project-standard (`package.json` already has both). |
| Audit log | `useAuditLogQuery` against `${VITE_API_BASE_URL}/identity-api/staff/:id/audit` | Backend-owned; client is a thin read-only consumer. |
| Deactivation | Soft-delete via `active: false` | Historical reports need inactive staff; hard-delete breaks audit. |
| Conflict resolution | 409 → user-facing "another admin updated this staff member" surface | RTK Query's `error.status === 409`; refetch + diff. |
| Bulk operations | None in this plan | Out of scope (see §3). |
| Reactivation | `useReactivateStaffMutation` (POST `/:id/reactivate`) | Same audit entry shape as `deactivate`. |

---

## 5. Folder layout

```
src/features/staff/
  api.ts                         # re-export identityApi hooks + types
  useStaffFilters.ts             # URL-bound filter state (foundation Phase 5)
  StaffList.tsx                  # /site/admin/staff — table surface
  StaffForm.tsx                  # shared create + edit form
  StaffDetail.tsx                # /site/admin/staff/:id — read + edit + deactivate
  schemas.ts                     # zod schemas: createStaffSchema, updateStaffSchema
  useStaffMutations.ts           # wrapped mutations with onSuccess cache invalidation
  useStaffAudit.ts               # useAuditLogQuery hook + reactivate mutation
  conflict.ts                    # 409 detection + diff helper
  StaffList.test.tsx
  StaffForm.test.tsx
  StaffDetail.test.tsx
src/types/
  auth.ts                        # Role union, Permission string
  staff.ts                       # NEW — StaffMember, StaffAuditEntry, StaffRoleGrant
src/app/api/identity.ts          # extended: useReactivateStaffMutation, useAuditLogQuery
src/test/handlers/identity.ts    # extended: PUT /staff/:id, POST /:id/deactivate,
                                 # POST /:id/reactivate, GET /:id/audit, 409 fixture
```

---

## 6. Specification

### 6.1 Data model

```ts
// src/types/staff.ts

import type { Role } from "./auth";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  roles: readonly Role[];             // legacy: union of roles across restaurants
  restaurantIds: readonly string[];  // restaurants the member has access to
  active: boolean;
  createdAt: string;                 // ISO timestamp
  updatedAt: string;                 // ISO timestamp
  lastActiveAt: string | null;       // ISO timestamp; null until first sign-in
}

export interface StaffRoleGrant {
  staffId: string;
  restaurantId: string;
  role: Role;
  grantedAt: string;
  grantedBy: string;                 // actor user id
}

export interface StaffAuditEntry {
  id: string;
  staffId: string;
  actorId: string;
  actorName: string;
  action: "create" | "update" | "deactivate" | "reactivate" | "role-grant" | "role-revoke" | "restaurant-assign" | "restaurant-unassign";
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: string;
  reason?: string;
}
```

### 6.2 Roles & permission matrix

The 8 fixed roles (defined in `src/types/auth.ts`):

| Role | Description | Typical zone |
|---|---|---|
| `SuperAdmin` | Tenant-wide admin; can grant any role. | All zones |
| `RestaurantAdmin` | Per-restaurant admin; can grant non-SuperAdmin roles within their restaurants. | Admin, Restaurant |
| `Manager` | Floor manager. | Restaurant |
| `KitchenManager` | Kitchen lead. | Kitchen, Restaurant |
| `KitchenStaff` | Line cook / prep. | Kitchen |
| `Waiter` | Floor staff. | Restaurant |
| `Cashier` | Payment + bill split. | Restaurant |
| `Host` | Front-of-house reservations. | Restaurant |

Grant rules:

- `SuperAdmin` can grant any role, including to themselves, including at any restaurant.
- `RestaurantAdmin` can grant `Manager`, `KitchenManager`, `KitchenStaff`, `Waiter`, `Cashier`, `Host` at restaurants they administer. They CANNOT grant `SuperAdmin` or another `RestaurantAdmin` (to prevent privilege escalation).
- `Manager` and below have **no grant authority** — they can read but not modify.

Client enforcement: the form's role checkboxes are derived from `useGrantableRoles()` (foundation Phase 4 selectors pattern; new selector lives in `headerSelectors.ts` or a sibling `staffSelectors.ts`). The server is the source of truth — the client-side hide is a UX nicety, not a security boundary.

### 6.3 Restaurant assignment semantics

A staff member may hold the same role at multiple restaurants (e.g. a Manager at both Acme Bistro — Downtown and Acme Bistro — Marina) and different roles at different restaurants (Manager at one, Waiter at another — permitted; e.g. a part-time staff member).

Data shape: `StaffMember.restaurantIds: readonly string[]`. The Identity Service returns the *aggregate* role list (`roles`) for the staff member; the per-restaurant grants are stored separately and exposed via `useStaffGrantsForQuery(staffId)`.

Client rules:

- The form requires at least one restaurant (foundation Phase 5 already enforces this).
- Removing the last restaurant disables submit.
- A staff member with `active: false` keeps their restaurant assignments — they can be reactivated without re-assignment.

### 6.4 Deactivation & soft-delete flow

`useDeactivateStaffMutation` (foundation) sets `active: false`. Effects:

- The deactivated member cannot sign in (Identity Service rejects the activation link + the JWT refresh returns 401 even if the access token is still valid).
- The staff row stays in the list view (greyed out via `<Badge variant="outline">Inactive</Badge>` — foundation Phase 5 already renders this).
- In-flight orders authored by the deactivated member continue to process; the deactivation is recorded on the order audit log but does not roll back state.
- A "Reactivate" button replaces "Deactivate" in `StaffDetail` when `!active`. `useReactivateStaffMutation` (new in this plan) flips `active: true` and adds an audit entry.

Hard-delete is **out of scope**. If compliance ever requires it, it lands as a separate plan with a destruction-of-PII workflow.

### 6.5 Audit trail & activity log

Every mutation creates an audit entry. The `useAuditLogQuery(staffId)` hook returns `StaffAuditEntry[]` ordered by `timestamp DESC`. The `StaffDetail` page renders the most recent 20 entries; a "View full history" button opens a modal with the full list.

Client behavior:

- Render actor (name + email), action, before/after diff (only the changed fields), timestamp (formatted relative for <7d, absolute otherwise), optional `reason` text.
- Audit entries are **read-only** on the client. No edit / delete surface.

### 6.6 Edge cases

- **Duplicate invitation** — backend returns 409 with `{ code: "STAFF_DUPLICATE_EMAIL" }`. Client surfaces a "this email already has an account — invite as a new restaurant member instead?" link.
- **Concurrent edit** — two admins edit the same staff member. Backend returns 409 with `{ code: "STAFF_VERSION_MISMATCH", currentVersion: 7 }`. Client refreshes the row, highlights changed fields, asks the admin to re-apply their changes.
- **Expired activation link** — backend returns 410 Gone. Client surfaces "this invitation has expired — resend?" with a `useResendInvitationMutation`.
- **Self-demotion** — a RestaurantAdmin cannot remove their own last `RestaurantAdmin` grant at a restaurant they administer. Client disables the "Remove restaurant" button with a tooltip; backend enforces.
- **Bulk import / export** — out of scope (see §3).
- **Cross-restaurant role escalation** — already covered by the grant rules in §6.2.

### 6.7 Conflict detection helper

```ts
// src/features/staff/conflict.ts

import type { StaffMember } from "../../types/staff";

export interface StaffConflict {
  status: 409;
  code: "STAFF_VERSION_MISMATCH" | "STAFF_DUPLICATE_EMAIL";
  current?: StaffMember;
}

export function isStaffConflict(err: unknown): err is StaffConflict {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status: number }).status === 409
  );
}
```

Consumers (`StaffForm`, `StaffDetail`) call `isStaffConflict` on mutation errors and route to the conflict UI.

---

## 7. Cross-repo / integration

The frontend talks to the Orderly Microservices `Identity Service` via the YARP gateway on `http://localhost:6004/identity-api/*`. New endpoints required for this plan (the backend ships these in parallel):

- `POST /identity-api/staff/:id/reactivate` — flip `active` back to `true`.
- `GET /identity-api/staff/:id/audit` — return `StaffAuditEntry[]`.
- `POST /identity-api/staff/:id/audit` (optional) — append a free-text `reason` to the most recent entry (e.g. admin explains "left the company").
- `POST /identity-api/staff/invitations/:id/resend` — re-fire the activation email.

All four inherit the auth header + 401 single-flight refresh from the foundation's `dynamicBaseQuery`.

---

## 8. Security guardrails

> [!CAUTION]
> Role grants are the most privileged operation in the app. The client MUST hide controls it cannot grant (e.g. a RestaurantAdmin cannot grant SuperAdmin), but the server is the source of truth — every endpoint re-checks authorization independently.

| Risk | Mitigation |
|---|---|
| Privilege escalation via grant flow | Client hides ungrantable roles; backend re-checks authorization on every mutation; audit log records actor + before/after. |
| Stale frontend cache after server-side conflict | 409 response includes `currentVersion`; client refetches the staff member before showing the conflict UI. |
| Reactivation of a staff member who left the company | Audit log surfaces the previous deactivation; SuperAdmin reactivation requires a `reason` field. |
| Email enumeration via duplicate-invite 409 | Backend returns 409 with the same shape as a successful create (just `id: existing-id`) for known emails; the duplicate path is only visible to admins. |
| Activation link replay | Activation links are single-use; backend invalidates on first consume. |

---

## 9. Development Phases

### Phase overview

| Phase | Name | Tool groups delivered | Goal |
|:---:|---|---|---|
| **1** | Roles & permission matrix | `useGrantableRoles` selector, role-conditional form sections | The form hides roles the current actor cannot grant; backend is source of truth. |
| **2** | Restaurant assignment semantics | `useStaffGrantsForQuery`, per-restaurant assignment UI | A staff member can hold different roles at different restaurants; the form supports it. |
| **3** | Deactivation & soft-delete | `useReactivateStaffMutation`, reactivate button in detail view | Deactivation is reversible; audit entries for both directions. |
| **4** | Audit trail & activity log | `useAuditLogQuery`, `StaffAuditLog` component | Every mutation lands in the audit log; admin can read the history. |
| **5** | Edge cases & operational behavior | conflict helper, 409 / 410 surfaces, resend-invitation flow | Concurrent edits, expired links, and duplicate emails surface explicit, actionable messages. |

### Phase 1 — Roles & permission matrix

**Goal**: The Staff form hides roles the current actor cannot grant. The backend is the source of truth — the client hide is UX, not security.

**Status**: ✅ Done (2026-07-28)

**Deliverables**:
- [x] `src/features/staff/useGrantableRoles.ts` — selector that returns `readonly Role[]` based on the current actor's roles.
- [x] `StaffForm` consumes `useGrantableRoles` and disables / hides ungrantable roles.
- [x] `StaffDetail` disables role toggles when the current actor lacks authority.
- [x] MSW handler `POST /identity-api/staff` returns 403 when called by a non-SuperAdmin trying to grant `SuperAdmin`.
- [x] Vitest: a RestaurantAdmin session cannot grant `SuperAdmin`; the role checkbox is disabled.
- [x] Documentation: a one-page role matrix in `docs/website-spec.md` §4.3 (cross-link to the existing access matrix).

**Exit criteria**: A RestaurantAdmin session sees Manager / KitchenStaff / Waiter / Cashier / Host as grantable; SuperAdmin / RestaurantAdmin are not in the form's role checkbox list. Backend 403 surfaces inline if the client somehow sends an ungrantable role.

### Phase 1 implementation notes (2026-07-28)

**Files added.** `src/features/staff/useGrantableRoles.ts`; `src/features/staff/useGrantableRoles.test.tsx`. **Files modified:** `src/features/staff/StaffForm.tsx` (consumes `useGrantableRoles`, renders note when actor has no grant authority), `src/features/staff/StaffDetail.tsx` (Edit + Deactivate buttons `disabled` when actor has no grant authority), `src/test/handlers/identity.ts` (POST `/staff` returns 403 with `STAFF_GRANT_FORBIDDEN` when `X-Test-Actor-Roles` header doesn't include `SuperAdmin` but payload includes `SuperAdmin`), `docs/website-spec.md` §4.3.1 (new sub-section with grant authority matrix).

**Phase 1 verification.** `pnpm format:check` (219 files formatted), `pnpm typecheck`, `pnpm lint` (no errors in app code), `pnpm test:run` (46 files, 173 tests, +4 vs Phase 5), `pnpm build`. The 4 new tests in `useGrantableRoles.test.tsx` cover SuperAdmin, RestaurantAdmin, Manager, and Waiter.

**Bugs found + fixed during implementation.** Initial form test failed because `useGrantableRoles` returned `[]` without a seeded session — the test now sets up a SuperAdmin session via `setCredentials`.

---

### Phase 2 — Restaurant assignment semantics

**Goal**: A staff member can hold different roles at different restaurants; the form supports it.

**Status**: ✅ Done (2026-07-28)

**Deliverables**:
- [x] `src/app/api/identity.ts` — add `useStaffGrantsForQuery(staffId)` returning `StaffRoleGrant[]`.
- [x] `src/features/staff/RestaurantAssignmentGrid.tsx` — table-style UI: rows = restaurants, columns = grantable roles, checkboxes = the grant.
- [x] `StaffForm` swaps the "Restaurants" fieldset for `RestaurantAssignmentGrid` when the backend exposes per-restaurant grants.
- [x] Vitest: a Manager with two restaurants can be assigned `Manager` at one and `Waiter` at the other.
- [x] MSW handler returns the per-restaurant grants for the demo staff member.

**Exit criteria**: The form's "Restaurants + Roles" surface is a grid, not a flat list. Saving persists the per-restaurant grants.

### Phase 2 implementation notes (2026-07-28)

**Files added.** `src/features/staff/RestaurantAssignmentGrid.tsx`; `src/features/staff/RestaurantAssignmentGrid.test.tsx`. **Files modified:** `src/app/api/identity.ts` (added `useStaffGrantsForQuery` + `StaffRoleGrant` type), `src/features/staff/api.ts` (re-exports the new hook + type), `src/features/staff/StaffForm.tsx` (per-restaurant grant state via `Map<restaurantId, Set<Role>>`; swaps the flat restaurants fieldset for the grid; `restaurantIds` derived from the map keys), `src/test/handlers/identity.ts` (`GET /identity-api/staff/:id/grants` returns two demo grants: Manager @ Downtown, Waiter @ Marina).

**Phase 2 verification.** `pnpm format:check` (221 files), `pnpm typecheck`, `pnpm lint`, `pnpm test:run` (47 files, 176 tests, +3 vs Phase 1), `pnpm build`. The 3 new tests in `RestaurantAssignmentGrid.test.tsx` cover rendering, initial-grant reflection, and onToggle dispatch.

---

### Phase 3 — Deactivation & soft-delete

**Goal**: Deactivation is reversible; audit entries for both directions.

**Status**: ✅ Done (2026-07-28)

**Deliverables**:
- [x] `src/app/api/identity.ts` — add `useReactivateStaffMutation(staffId)`.
- [x] `StaffDetail` shows "Reactivate" instead of "Deactivate" when `!active`.
- [x] MSW handler `POST /:id/reactivate` returns the staff member with `active: true`.
- [x] Vitest: deactivating then reactivating preserves the original role list and restaurant assignments.

**Exit criteria**: A deactivated staff member's audit log shows two entries (deactivate + reactivate); the row in the list flips back to "Active" on reactivation. The audit log entries land in Phase 4.

### Phase 3 implementation notes (2026-07-28)

**Files added.** `src/features/staff/StaffDetail.test.tsx`. **Files modified:** `src/app/api/identity.ts` (added `useReactivateStaffMutation`), `src/features/staff/api.ts` (re-export), `src/features/staff/StaffDetail.tsx` (Reactivate button when `!data.active && canEdit`), `src/test/handlers/identity.ts` (`POST /:id/reactivate` returns the staff member with `active: true`).

**Phase 3 verification.** `pnpm format:check` (222 files), `pnpm typecheck`, `pnpm lint`, `pnpm test:run` (48 files, 179 tests, +3 vs Phase 2), `pnpm build`.

**Bugs found + fixed during implementation.** `StaffDetail.test.tsx` initially built its own `configureStore` without RTK Query middleware — switched to reusing the foundation's `store` so mutations resolve.

---

### Phase 4 — Audit trail & activity log

**Goal**: Every mutation lands in the audit log; admin can read the history.

**Status**: ⏸ Pending

**Deliverables**:
- [ ] `src/app/api/identity.ts` — add `useAuditLogQuery(staffId)` returning `StaffAuditEntry[]`.
- [ ] `src/features/staff/StaffAuditLog.tsx` — list view of the most recent 20 entries; "View full history" modal.
- [ ] `StaffDetail` mounts `StaffAuditLog` below the action buttons.
- [ ] MSW handler returns 5 demo entries: create, role-grant, restaurant-assign, deactivate, reactivate.
- [ ] Vitest: the audit log renders actor names, before/after diffs, and relative timestamps.

**Exit criteria**: Every mutation the admin performs in the form produces a corresponding audit entry on the next refetch.

---

### Phase 5 — Edge cases & operational behavior

**Goal**: Concurrent edits, expired links, and duplicate emails surface explicit, actionable messages.

**Status**: ⏸ Pending

**Deliverables**:
- [ ] `src/features/staff/conflict.ts` — `isStaffConflict` type guard.
- [ ] `src/app/api/identity.ts` — add `useResendInvitationMutation(staffId)`.
- [ ] `StaffForm` + `StaffDetail` route 409 / 410 to explicit UI surfaces (refetch + diff for 409; resend-invite link for 410).
- [ ] MSW handler returns 409 with `STAFF_VERSION_MISMATCH` when the form's `If-Match` header is stale; 410 with `INVITATION_EXPIRED` on resend.
- [ ] Vitest: a 409 surfaces "another admin updated this staff member — refresh and re-apply"; a 410 surfaces "this invitation has expired — resend?".

**Exit criteria**: All three error paths (409 version mismatch, 410 expired invitation, 403 unauthorized grant) render explicit UI; no silent failures.

---

## 10. Technical considerations

> Surfaced from the foundation audit (`.agents/plans/app-foundation-completion/app-foundation-completion.md` §10) and the role-restriction rules in `docs/website-spec.md` §4.3. Each item points at a concrete risk and the relevant Vercel / AGENTS rule.

### 10.1 Cross-cutting (foundation already adopted)

These were adopted in the foundation plan (`.agents/plans/app-foundation-completion/app-foundation-completion.md` §10.1). They carry over to Staff Management by reference.

- `rerender-memo` — `StaffForm` is a controlled form; memoize the `toggleRole` / `toggleRestaurant` callbacks so the fieldset doesn't re-render on each keystroke.
- `rerender-derived-state-no-effect` — derive `selectedRoles` / `selectedRestaurantIds` from local form state, not via `useEffect`.
- `rendering-conditional-render` — empty / loading / error states use ternaries.
- `rendering-content-visibility` — apply `content-visibility: auto` to the audit log's scroll container (already used on `StaffList`'s `<tbody>`).
- `async-parallel` — when the detail page needs both the staff member and their grants + audit log, the three queries run in parallel.

### 10.2 Phase 1 — Roles & permission matrix

- `rerender-defer-reads` — `useGrantableRoles` returns a memoized `readonly Role[]`; consumers spread only when needed.
- **No `any` in selectors** — `Role` union is the source of truth; widen only via the foundation's `StaffMember.roles: readonly Role[]`.

### 10.3 Phase 2 — Restaurant assignment

- `js-set-map-lookups` — `useStaffFilters.matchesRole` (foundation) and `RestaurantAssignmentGrid`'s row->grants lookup both use `Set<Role>`.
- `rendering-content-visibility` — the assignment grid applies `content-visibility: auto` to its row body for restaurants with many grants.

### 10.4 Phase 3 — Deactivation

- `rerender-transitions` — reactivate wraps the mutation in `startTransition` so the audit log + list view refetch doesn't block the row click.

### 10.5 Phase 4 — Audit trail

- `async-parallel` — `StaffDetail` issues `useGetStaffQuery`, `useStaffGrantsForQuery`, `useAuditLogQuery` in parallel; renders skeleton until all three resolve.
- `client-event-listeners` — the audit log uses the same `useAuditLogQuery` instance as the conflict helper; no per-field refetch.

### 10.6 Phase 5 — Edge cases

- `rendering-conditional-render` — 409 vs 410 vs generic error each have their own JSX branch.
- `js-cache-storage` — the conflict helper reads the error structure once; no per-render recompute.

---

## How to use this template

The deep-dive plan follows the foundation's conventions. See `_template.md` for the full workflow.

### The phase-completion workflow

> Every phase completion is two commits, not one.

1. **Code commit** — the work itself (`feat: ...`). Do NOT touch the plan in this commit.
2. **Plan commit** — the plan update only (`docs: mark Phase N complete in staff-management`):
   - Bump `Plan version` from `v0.{N-1}` → `v0.{N}` in the Status section.
   - Mark the phase's `[ ]` → `[x]` and update the table row.
   - Append a new `### Phase {N} implementation notes ({DATE})` section under Section 9.
   - Update §10's "Phase {N} adoption" subnote to reflect what was actually adopted vs deferred.
   - Add a Changelog entry at the bottom.

> Two commits keeps the diff reviewable: the code commit is just code, the plan commit is just documentation.

---

## Changelog

### v0.1 (2026-07-28) — initial draft
- Created plan with 5 phases covering Staff CRUD deep-dive (roles & permission matrix, restaurant assignment semantics, deactivation & soft-delete, audit trail, edge cases).
- Sections 0–10 drafted; foundation cross-references noted in §10.1.
- Out-of-scope boundaries set (notifications, bulk ops, multi-tenant onboarding).

### v0.2 (2026-07-28) — Phase 1 complete

**Roles & permission matrix shipped.** The Staff form now hides role checkboxes the current actor cannot grant; `StaffDetail` disables Edit + Deactivate when the actor has no authority; the MSW handler returns 403 `STAFF_GRANT_FORBIDDEN` when a non-SuperAdmin tries to grant `SuperAdmin`; `docs/website-spec.md` §4.3.1 documents the matrix.

**Files added.** `src/features/staff/useGrantableRoles.ts`; `src/features/staff/useGrantableRoles.test.tsx`. **Files modified:** `src/features/staff/StaffForm.tsx`, `src/features/staff/StaffDetail.tsx`, `src/test/handlers/identity.ts`, `docs/website-spec.md`.

**Verification.** `pnpm format:check` (219 files), `pnpm typecheck`, `pnpm lint`, `pnpm test:run` (46 files, 173 tests, +4 vs Phase 5), `pnpm build`.

### v0.3 (2026-07-28) — Phase 2 complete

**Restaurant assignment semantics shipped.** The Staff form's flat "Restaurants + Roles" fieldsets are now a single `RestaurantAssignmentGrid`: rows = restaurants, columns = grantable roles, checkboxes per cell. `useStaffGrantsForQuery` exposes the per-restaurant grants via RTK Query; the form owns the `Map<restaurantId, Set<Role>>` state and a `toggleGrant` callback. The demo staff member holds Manager @ Downtown and Waiter @ Marina.

**Files added.** `src/features/staff/RestaurantAssignmentGrid.tsx`; `src/features/staff/RestaurantAssignmentGrid.test.tsx`. **Files modified:** `src/app/api/identity.ts` (added `StaffRoleGrant` type + `useStaffGrantsForQuery`), `src/features/staff/api.ts`, `src/features/staff/StaffForm.tsx`, `src/test/handlers/identity.ts` (`GET /staff/:id/grants`).

**Verification.** `pnpm format:check` (221 files), `pnpm typecheck`, `pnpm lint`, `pnpm test:run` (47 files, 176 tests, +3 vs Phase 1), `pnpm build`.

### v0.4 (2026-07-28) — Phase 3 complete

**Deactivation & soft-delete shipped.** `useReactivateStaffMutation` flips `active` back to true; the `StaffDetail` page swaps the Deactivate button for Reactivate when the staff is inactive. The MSW handler `POST /:id/reactivate` returns the original staff member with `active: true`.

**Files added.** `src/features/staff/StaffDetail.test.tsx`. **Files modified:** `src/app/api/identity.ts` (added `useReactivateStaffMutation`), `src/features/staff/api.ts`, `src/features/staff/StaffDetail.tsx`, `src/test/handlers/identity.ts`.

**Verification.** `pnpm format:check` (222 files), `pnpm typecheck`, `pnpm lint`, `pnpm test:run` (48 files, 179 tests, +3 vs Phase 2), `pnpm build`.