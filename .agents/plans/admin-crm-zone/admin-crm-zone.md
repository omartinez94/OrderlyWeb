# Admin Zone CRM — Implementation Plan

> Scope: Replace the stubbed `/site/admin` zone with a full Restaurant CRM, including a new top-level **Brand** entity. Bilingual (en/es), role + permission gated, with a real admin dashboard. Consumed by SuperAdmin, RestaurantAdmin, and Manager roles.

---

## Status

> **Plan version**: `v2.2` (2026-10-18) — Phase 2 Brands CRUD complete and verified.
> **Current state**: 🚧 Phase 1 and 2 completed; Phase 3 (EntityAuditLog) ready for kickoff.

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Foundation: types, permissions, route tree, i18n | ✅ Done |
| 2 | Brands CRUD (list, new, detail, archive) | ✅ Done |
| 3 | Generic `EntityAuditLog` | ⏸ Pending |
| 4 | Brand detail tabs (Restaurants, Staff, Settings, Audit) | 🔒 Blocked |
| 5 | Restaurants: full `AdminRestaurantDetail` shape, tabs, archive | 🔒 Blocked |
| 6 | Roles matrix + global Settings page | 🔒 Blocked |
| 7 | Admin Dashboard (KPIs, recent activity, brand/restaurant cards) | 🔒 Blocked |
| 8 | Hardening: i18n audit, E2E in both locales, axe sweep, docs | 🔒 Blocked |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `refactor:`, `fix:`, `docs:`, `test:`, `chore:`). Short subject ≤50 chars, imperative mood, no trailing period. Every phase completion is a two-commit sequence: (1) the code, (2) a `docs:` commit that updates this plan.

> **Update rule**: **on every phase completion, the plan MUST be updated in the same phase boundary commit group (the `docs:` commit).** The plan is the source of truth for what was decided and what shipped; a phase that ships without a plan update is a phase that drifted.

---

## 0. Skill & documentation conventions

### 0.1 Skill mandate — `impeccable`, `react-state-management`, `shadcn-ui`, `vercel-react-best-practices`, `datavaz`, `security-review`
> **All implementation work on this plan MUST:**
> - `impeccable` — for any new UI surface (form, table, page). Covers UX, a11y, responsive, theming, motion, error states, i18n.
> - `shadcn-ui` — when extending or adding primitives to `src/components/ui/`. The 40+ existing primitives are the source; do not hand-roll.
> - `vercel-react-best-practices` — when writing new components, especially for memoization (`Set`/`Map` lookups), content-visibility, conditional rendering ternaries, and transitions.
> - `react-state-management` — only when adding a new slice or store boundary. (This plan mostly reuses RTK Query; no new slices planned.)
> - `dataviz` — when the Admin Dashboard or any KPI/stat tile ships. Applies Phase 7.
> - `security-review` — before merging any phase that touches auth (`Permission` union, `usePermission`, JWT claims, brand scoping).

### 0.2 Code-quality guard rails
- **TypeScript strict**: `tsconfig.app.json` `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `erasableSyntaxOnly: true`. No `any` outside generated DTO shims.
- **oxlint + oxfmt**: format before commit; pre-commit hook catches drift. Double quotes, 2-space indent, 100-char width, LF, trailing commas, Tailwind class sorting.
- **Tailwind first, CSS last**: never hand-roll what a utility class can express. No inline `style={{}}` (the one exception is `TicketCard` confetti positions, already documented).
- **Barrel imports mandatory**: `import { Button } from "@/components/ui"`, not `"@/components/ui/button"`. New folders must add an `index.ts` barrel.
- **Icons from `lucide-react`** only. No hand-rolled SVGs, no emoji-as-icon.
- **All i18n keys are typed**: `CustomTypeOptions.resources.admin` in `src/lib/i18n.ts` makes every `t("admin:...")` call compile-time-checked. Missing keys fail at build.
- **All forms use `useZodForm`** for multi-field shapes; short forms may use the `useState + validate()` pattern (per `StaffForm` precedent).
- **Vitest + jest-axe mandatory on every new component**; Playwright E2E in both `en` and `es` for any new flow.
- **Audit gates per AGENTS.md § Testing**: `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm test:e2e && pnpm ui:check` must all pass before any phase PR merges.

---

## 1. Context

The OrderlyWeb app already routes logged-in admin users to `/site/admin` (per `defaultZoneForRoles()` in `src/lib/defaultZone.ts`), but the zone is **mostly placeholders**: only the **Staff** feature (`src/features/staff/`) is real. The other admin pages (`AdminDashboardPage`, `RestaurantListPage`, `RestaurantDetailPage`, `AdminSettingsPage`) render `<ZoneSplash />`.

The user has asked for the **full restaurant CRM** under `/site/admin`, including a new top-level **Brand** entity. The codebase is purpose-built for this: feature-sliced structure, RTK Query, type-safe i18next, shadcn/ui, and a working `GuardedPage allow="admin"` boundary at the zone root. The Staff feature is the canonical precedent (api.ts boundary wrapper, `RestaurantAssignmentGrid`, `StaffAuditLog`, `useGrantableRoles`).

Why now:
- The admin zone is the first thing a SuperAdmin lands on after login. Today it shows splash pages — incomplete UX.
- The backend (`Catalog.API/Models/Brand.cs`) already models `Brand`; the frontend is the missing piece.
- The "users" entity in the spec is a synonym of "staff" — the URL needs to reflect that.
- The `Permission` type is currently `string` (placeholder); the spec needs typed, fine-grained gating.

Upstream references:
- `docs/website-spec.md` §4 / §4.3 — three-zone architecture, access matrix
- `docs/backend-architecture/architecture.md` §3 / §4.5 — Brand data model
- `.agents/plans/i18n-localization.md` — the i18n contract this plan extends
- `.agents/plans/identity-hardening.md` — auth state and RTK Query conventions
- `.agents/plans/app-foundation-completion/staff-management.md` — Staff feature (the canonical pattern)

---

## 2. Goal

Concrete deliverables:

1. **Phase 1**: types, permission union, `usePermission` hook, route tree, sidebar, bilingual keys, and 14 stub pages — all under `pnpm ui:check` green.
2. **Phase 2**: SuperAdmin can `create / read / update / archive` Brands. RestaurantAdmin can `read / update` brands they own.
3. **Phase 3**: One generic `<EntityAuditLog>` component powers staff, brand, and restaurant audit trails. Existing `StaffAuditLog` becomes a thin wrapper.
4. **Phase 4**: Brand detail exposes tabs: Overview · Restaurants · Staff · Settings · Audit.
5. **Phase 5**: Restaurants carry the full `AdminRestaurantDetail` shape (address, hours, tax, currency, owner) and have their own tabs.
6. **Phase 6**: Roles × Permissions matrix is visible (read-only). Global `AdminSettings` is editable by SuperAdmin.
7. **Phase 7**: `/site/admin` dashboard shows KPIs (brands, restaurants, staff, audit count), pending invitations, recent activity, and drill-down cards.
8. **Phase 8**: Playwright E2E covers the create-brand → add-restaurant → invite-staff flow under both `en` and `es`. Axe sweep on every new page.

**User-visible outcome**: a SuperAdmin logs in, lands on a real dashboard, and can manage brands, restaurants, staff, audit, roles, and settings — every page in English or Spanish, every action gated to the right role and permission.

---

## 3. Out of scope

- **Menu management** — belongs to the Restaurant zone (`/site/restaurant/menu`), not the admin CRM. (The catalog API already serves `MenuCategory` / `MenuItem`; the admin zone only reads them for restaurant detail.)
- **Order operations** — Orders, kitchen, reservations, queue are out of scope; they live in the restaurant and kitchen zones.
- **Billing / pricing** — no Stripe or payment integration; restaurant pricing lives in the menu surface.
- **Real-time SignalR push for CRM events** — admin audit uses the existing `notifications` API (REST). Live push is a separate plan.
- **Customer-facing auth** — out of scope; we are staff-only.
- **Customer identity / loyalty** — not modeled; deferred to a future plan.
- **Multi-language beyond en/es** — explicitly out. The system supports 2 languages; adding a third is a separate workstream.
- **Server-side enforcement of brand scoping** — the Identity Service enforces this per-restaurant today; brand-level scoping requires backend work (see §7). The frontend trusts the response (no client-side security boundary). Documented in §8.
- **Backend migrations** — this plan documents the required backend changes (see §7) but does not own their delivery. Backend prerequisites are tracked per-phase; a phase is blocked until its backend dependencies are met.
- **Bulk operations** — no multi-select archive, reassign, or export. Single-entity CRUD only.
- **Image / logo upload** — `logoUrl` is a URL string; the upload flow (file picker, CDN, resize) is a separate workstream. Phase 2 accepts a pasted URL.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| Namespace for new i18n keys | **Extend `admin`, do not add `crm`** | All CRM copy is admin-zone-only; another namespace only adds bundle weight. `CustomTypeOptions.resources.admin` regenerates the typed key union. |
| Brand modeling | **First-class parent entity** (Brand 1-* Restaurant, Brand 1-* Staff) | User decision. Multi-tenant chains need their own audit, settings, and staff-scoping. |
| Permission shape | **Typed union aligned to backend `colon:action` convention** + `ROLE_PERMISSIONS` table in `src/types/auth.ts` | Backend already seeds 25 permissions (`users:view_all`, `audit:view`, …) via `PermissionAuthorizationHandler`. New CRM permissions (`brands:view`, `brands:create`, …) follow the same pattern. Replaces placeholder `Permission = string`. |
| Dual gating (role + permission) | **Keep role-based zone gating; add `usePermission` for fine-grained actions** | Role-based is cheap and exhaustive; permissions enable per-button UX. Cost is one hook + one component. |
| Restaurant entity | **Add additive `AdminRestaurantDetail` that extends `CatalogRestaurant`** | `CatalogRestaurant` is consumed by the Header switcher and future menu pages. Mutating it would force every consumer to handle new fields. The list endpoint keeps the slim shape; the detail endpoint returns the full CRM shape. |
| Audit log | **Generic `<EntityAuditLog>`** + thin `StaffAuditLog` wrapper | One source of truth for any entity's audit timeline. Mirrors the `RestaurantAssignmentGrid` reusability precedent. |
| Forms (multi-field) | **`useZodForm` from `src/lib/forms.ts`** | Zod 4 + react-hook-form 7 already installed; wrapper exists. `StaffForm` uses `useState` because it is 3 fields; every new form is multi-section. |
| Filter / scope state | **URL query params** via `useSearchParams` (existing `useStaffFilters` pattern) | Back-button friendly; shareable URLs; mirrors the `useRestaurantContext` precedent. |
| Cache invalidation | **Tag-based, scoped per entity** (`Brands`, `Restaurants`, `AdminSettings`, `Audit`) | RTK Query's standard pattern; existing slices already use it. |
| Placeholder pages in Phase 1 | **`<ZoneSplash />` everywhere** | Matches the existing convention. Phase 1 ships a real URL tree with no business logic. |
| Sub-route composition | **`<Outlet />` per detail page, with named children** (mirrors `adminZone` staff pattern) | Avoids re-mount warnings; matches the `GuardedPage`-at-zone-level pattern. |
| Server authorization | **Trust the gateway + JWT claims**; client never enforces security | Identity Service is the source of truth. Client-side gating is UX-only (hide buttons, render `ForbiddenPage`). |

---

## 5. Folder layout

New files and folders this plan introduces (relative to `C:\Users\omar_\Source\Repos\kalaa\orderly\OrderlyWeb`):

```
src/
  app/api/
    catalog.ts                                  EXTEND  add CatalogBrand, AdminRestaurantDetail, AdminSettings, AdminAuditEntry, new tagTypes
    identity.ts                                 EXTEND  add brandId, phone, avatarUrl, lastLoginAt to StaffMember (additive)
  components/
    Admin/                                      NEW
      ResourceHeader.tsx                        page-header pattern for any single resource
      SettingsSection.tsx                       eyebrow + heading + grid wrapper
      StatusBadge.tsx                           thin wrapper over Badge (active/inactive/archived)
    RouteGuards/
      usePermission.ts                          NEW     hook: usePermission(perm: Permission) => boolean
      RequirePermission.tsx                     NEW     composable guard; renders <ForbiddenPage/> on rejection
      index.ts                                  EXTEND  add to barrel
  features/
    audit/                                      NEW
      api.ts                                    re-exports useAuditForQuery, useListAuditQuery
      EntityAuditLog.tsx                        generic timeline; StaffAuditLog becomes a wrapper
      conflict.ts                               type guards
      index.ts                                  barrel
    brand/                                      NEW
      api.ts                                    re-exports catalog brand hooks
      BrandList.tsx
      BrandForm.tsx                             useZodForm(brandCreateSchema)
      BrandDetail.tsx                           tab container (Overview)
      BrandAssignmentGrid.tsx                   (reuses existing RestaurantAssignmentGrid if possible)
      useBrandFilters.ts                        URL query-param filters
      conflict.ts                               isBrandConflict, isBrandForbidden
      index.ts                                  barrel
    restaurant/                                 NEW
      api.ts                                    re-exports useGetAdminRestaurantQuery + CRUD
      AdminRestaurantDetail.tsx                 tab container
      RestaurantForm.tsx                        useZodForm(restaurantCreateSchema) — multi-section
      OperatingHoursGrid.tsx                    7-day controlled grid; read-only + edit modes
      AddressCard.tsx                           read-only address renderer
      useRestaurantFilters.ts                   URL filters
      conflict.ts                               isRestaurantConflict, isRestaurantForbidden
      index.ts                                  barrel
    roles/                                      NEW
      RolePermissionMatrix.tsx                  read-only Table of role × permission
      index.ts                                  barrel
    settings/                                   NEW
      AdminSettingsForm.tsx                     global settings (useZodForm with nested featureFlags)
      index.ts                                  barrel
    staff/                                      EXTEND
      StaffList.tsx                             add ?brandId= filter pass-through
      StaffAuditLog.tsx                         becomes a thin wrapper around EntityAuditLog
  hooks/
    useBrandContext.ts                          NEW     URL ?brandId= (mirrors useRestaurantContext)
  router/
    pathNames.ts                                EXTEND  add 15 new ADMIN_* path constants + 3 query param keys
    zones/adminZone.tsx                         EXTEND  add ~20 new route children
  routes/site/admin/
    AdminZoneLayout.tsx                         EXTEND  expand ADMIN_SIDEBAR_ITEMS to 7 items; fix tabs.members typo
    AdminDashboardPage.tsx                      REPLACE in Phase 7 (splash through Phase 6)
    AdminUsersPage.tsx                          NEW     one-liner redirect to /staff (alias)
    AdminAuditPage.tsx                          NEW     stub in Phase 1, real in Phase 3
    AdminRolesPage.tsx                          NEW     stub in Phase 1, real in Phase 6
    AdminSettingsPage.tsx                       existing placeholder; real in Phase 6
    brands/                                    NEW
      BrandListPage.tsx
      BrandNewPage.tsx
      BrandDetailPage.tsx                       tab container
      BrandRestaurantsPage.tsx
      BrandStaffPage.tsx
      BrandSettingsPage.tsx
      BrandAuditPage.tsx
    restaurants/                                EXTEND
      RestaurantListPage.tsx                    existing placeholder; real in Phase 5
      RestaurantDetailPage.tsx                  existing placeholder; real in Phase 5
      RestaurantNewPage.tsx                     NEW
      RestaurantStaffPage.tsx                   NEW
      RestaurantSettingsPage.tsx                NEW
      RestaurantAuditPage.tsx                   NEW
  types/
    auth.ts                                     EXTEND  add Permission union + ROLE_PERMISSIONS table
  locales/
    en/admin.json                               EXTEND  ~80 new keys across 11 categories (see §6.5)
    es/admin.json                               EXTEND  Spanish translations of the same
  test/handlers/
    catalog.ts                                  EXTEND  MSW handlers for brand CRUD, admin restaurant CRUD, audit, admin settings
e2e/
  admin-crm.spec.ts                             NEW     Playwright E2E in both locales (withLocale fixture)
.agents/plans/admin-crm-zone/
  admin-crm-zone.md                             THIS FILE
```

No new dependencies, no new shadcn primitives, no `package.json` changes.

---

## 6. Specification

> The most important section — what gets built, at a level the implementer can act on.

### 6.1 Domain model (catalog slice)

Lives in `src/app/api/catalog.ts` (type-only in Phase 1; endpoints added Phase 2+).

```ts
// src/app/api/catalog.ts — additions
//
// ⚠️  BACKEND PREREQUISITE (Phase 2):
//   The DB `Brands` table currently has: Id, Name, LogoUrl, WebsiteUrl,
//   ContactEmail, ContactPhone, CuisineType (enum), Description.
//   Missing columns that this DTO requires:
//     - Slug (string, unique) — for URL-friendly brand identifiers
//     - IsActive (bool) — for archive/reactivate lifecycle
//     - CreatedAt / UpdatedAt (timestamps) — via AuditableEntity<Guid> base
//   Backend must add these before the frontend can consume them.
//   See §7 Backend prerequisites table.

export type CuisineType = "Italian" | "Mexican" | "Japanese" | "American" | "Other";

export interface CatalogBrand {
  id: string;
  name: string;
  slug: string;                    // ⚠️ requires backend migration
  description: string | null;      // exists in DB, was missing in v1.0
  logoUrl: string | null;
  contactEmail: string;
  contactPhone: string | null;
  cuisineType: CuisineType;        // typed enum, not free-text string
  websiteUrl: string | null;
  active: boolean;                 // ⚠️ requires backend migration (IsActive)
  createdAt: string;               // ⚠️ requires AuditableEntity base
  updatedAt: string;               // ⚠️ requires AuditableEntity base
}

export type RestaurantStatus = "active" | "inactive" | "archived";

export interface OperatingHoursDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string | null;   // "HH:mm" or null = closed
  close: string | null;
}

// ⚠️  BACKEND PREREQUISITE (Phase 5):
//   The DB `Restaurants.Address` is a flat `text` column today.
//   Two options (decision needed before Phase 5):
//     (a) Backend adds an EF Core OwnsOne<RestaurantAddress> complex property
//         (like Order.BillingAddress) and migrates existing data.
//     (b) Frontend keeps a flat string and AddressCard renders one text block.
//   Option (a) is recommended for structured search, validation, and i18n.
//   Note: existing CatalogRestaurant already derives `city` and `country`
//   from this flat text, so the Catalog API DTO layer already reshapes it.
export interface AdminRestaurantAddress {
  line1: string; line2: string | null;
  city: string; region: string; postalCode: string; country: string;
}

// ⚠️  BACKEND PREREQUISITE (Phase 5):
//   The DB `Restaurants` table is missing several columns this DTO requires:
//     - Status (enum: active/inactive/archived) — for lifecycle management
//     - OwnerId (uuid FK → Users) — for restaurant ownership assignment
//     - OperatingHours — either a JSON column or a child table
//     - CreatedAt / UpdatedAt — via AuditableEntity base
//   All existing DB columns (BrandId, TaxRate, Currency, TimeZone,
//   EstimatedTurnoverMinutes, AutoConfirm*, AllowAutoSubstitute) are
//   confirmed present and match this DTO.
//   See §7 Backend prerequisites table.
export interface AdminRestaurantDetail extends CatalogRestaurant {
  brandId: string;
  ownerId: string | null;          // ⚠️ requires backend migration
  address: AdminRestaurantAddress;  // ⚠️ requires structured address migration
  phone: string | null;
  email: string | null;
  timezone: string;
  currency: string;                 // ISO 4217
  taxRate: number;                  // 0..1
  operatingHours: OperatingHoursDay[];  // ⚠️ requires backend migration
  estimatedTurnoverMinutes: number;
  autoConfirmReservations: boolean;
  autoConfirmOrders: boolean;
  allowAutoSubstitute: boolean;
  status: RestaurantStatus;         // ⚠️ requires backend migration
  createdAt: string;                // ⚠️ requires AuditableEntity base
  updatedAt: string;                // ⚠️ requires AuditableEntity base
}

// ⚠️  BACKEND PREREQUISITE (Phase 6):
//   No AdminSettings entity or table exists in any backend service today.
//   Restaurant-level settings (TaxRate, Currency, AutoConfirm*, etc.) live
//   on the Restaurant entity itself. Global/platform-level settings and
//   feature flags are currently in appsettings.json / Microsoft.FeatureManagement.
//   Backend must create either:
//     (a) A singleton AdminSettings aggregate in Catalog.API with GET/PUT endpoints, or
//     (b) A dedicated Settings microservice.
//   Until then, Phase 6 can ship the RolePermissionMatrix (read-only, no
//   backend dependency) and stub AdminSettingsPage with a "coming soon" state.
//   See §7 Backend prerequisites table.
export interface AdminSettings {
  defaultTimezone: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  reservationReminderMinutes: number;
  maxReservationPartySize: number;
  enableAutoSubstitute: boolean;
  emailFromAddress: string;
  supportContactUrl: string;
  featureFlags: Record<string, boolean>;
}

// ⚠️  BACKEND PREREQUISITE (Phase 3):
//   No generic audit log table exists anywhere in the backend today.
//   Related but non-generic structures:
//     - Identity: LoginAuditLog (login/logout events only; GET /api/audit-log)
//     - Catalog: PriceHistory (menu price changes), OrderModificationLog (Marten)
//     - Ordering: OrderActivities (order state transitions)
//   None of these cover entity-level CRUD audit (brand created, restaurant
//   archived, staff role changed). Backend must create:
//     - An AuditEntries table in Catalog.API (or a dedicated Audit service)
//     - GET /catalog-api/audit/{entityType}/{entityId}
//     - GET /catalog-api/audit?entityType=&actorId=&since=&until=
//   The Identity LoginAuditLog can be consumed separately for login events
//   but is NOT the same as entity audit.
//   See §7 Backend prerequisites table.
export type AuditEntityType = "brand" | "restaurant" | "staff";

export interface AdminAuditEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  actorId: string;
  actorName: string;
  action: string;            // e.g. "create" | "update" | "archive" | "role-grant" | ...
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: string;         // ISO 8601
  reason?: string;
}
```

### 6.2 Auth & permission model

Lives in `src/types/auth.ts` and `src/components/RouteGuards/`.

```ts
// src/types/auth.ts — additions
//
// Convention: permissions use colon-delimited `resource:action` format
// to match the backend's existing 25 seeded permissions in Identity.API
// (e.g. `users:view_all`, `audit:view`). New CRM permissions follow
// the same pattern. The `PermissionAuthorizationHandler` in Identity
// evaluates these strings from JWT claims.
//
// Existing backend permissions consumed by this plan:
//   users:view_all, users:create, users:edit, users:assign_roles,
//   users:assign_restaurants, roles:view, audit:view
// New permissions (require backend seeding):
//   brands:view, brands:create, brands:edit, brands:archive,
//   restaurants:create, restaurants:edit, restaurants:archive,
//   settings:view, settings:edit

export type Permission =
  // Brand CRM (⚠️ new — require backend seeding in Identity.API)
  | "brands:view" | "brands:create" | "brands:edit" | "brands:archive"
  // Restaurant CRM (restaurants:view not needed — list is scoped by server)
  | "restaurants:create" | "restaurants:edit" | "restaurants:archive"
  // Staff (maps to existing backend permissions)
  | "users:view_all" | "users:create" | "users:edit"
  | "users:assign_roles" | "users:assign_restaurants"
  // Roles (maps to existing backend permissions)
  | "roles:view"
  // Audit (maps to existing backend permission)
  | "audit:view"
  // Settings (⚠️ new — require backend seeding)
  | "settings:view" | "settings:edit";

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SuperAdmin:      [/* all permissions */],
  RestaurantAdmin: [
    "brands:view", "brands:edit",
    "restaurants:create", "restaurants:edit",
    "users:view_all", "users:create", "users:edit",
    "users:assign_roles", "users:assign_restaurants",
    "roles:view", "audit:view", "settings:view",
  ],
  Manager:         ["brands:view", "users:view_all", "audit:view"],
  KitchenManager:  [],
  KitchenStaff:    [],
  Waiter:          [],
  Cashier:         [],
  Host:            [],
};
```

```ts
// src/components/RouteGuards/usePermission.ts
import { useAppSelector } from "@/app/hooks";
import { selectPredicate } from "@/app/session/sessionSelectors";
import type { Permission } from "@/types/auth";

export function usePermission(perm: Permission): boolean {
  const predicate = useAppSelector(selectPredicate);
  return predicate.permissions.includes(perm);
}
```

```tsx
// src/components/RouteGuards/RequirePermission.tsx
export function RequirePermission({ perm, children }: { perm: Permission; children: ReactNode }) {
  const allowed = usePermission(perm);
  return allowed ? <>{children}</> : <ForbiddenPage />;
}
```

### 6.3 URL tree

All path constants live in `src/router/pathNames.ts`. New constants (existing ones kept):

```ts
ADMIN_BRANDS              = "/site/admin/brands"
ADMIN_BRAND_NEW           = "/site/admin/brands/new"
ADMIN_BRAND_DETAIL        = "/site/admin/brands/:id"
ADMIN_BRAND_RESTAURANTS   = "/site/admin/brands/:id/restaurants"
ADMIN_BRAND_STAFF         = "/site/admin/brands/:id/staff"
ADMIN_BRAND_SETTINGS      = "/site/admin/brands/:id/settings"
ADMIN_BRAND_AUDIT         = "/site/admin/brands/:id/audit"
ADMIN_RESTAURANT_NEW      = "/site/admin/restaurants/new"
ADMIN_RESTAURANT_STAFF    = "/site/admin/restaurants/:id/staff"
ADMIN_RESTAURANT_SETTINGS = "/site/admin/restaurants/:id/settings"
ADMIN_RESTAURANT_AUDIT    = "/site/admin/restaurants/:id/audit"
ADMIN_USERS               = "/site/admin/users"        // alias → /staff
ADMIN_AUDIT               = "/site/admin/audit"
ADMIN_ROLES               = "/site/admin/roles"
// ADMIN, ADMIN_STAFF*, ADMIN_RESTAURANTS, ADMIN_RESTAURANT_DETAIL, ADMIN_SETTINGS already exist

QUERY_PARAM.BRAND_ID = "brandId"
QUERY_PARAM.ROLE     = "role"
QUERY_PARAM.QUERY    = "q"
```

Route tree under `/site/admin` (the existing `<GuardedPage allow="admin">` boundary stays):

```
/site/admin
  index              → AdminDashboardPage      (Phase 7 real; splash through 6)
  brands             → <Outlet/>
    index            → BrandListPage
    new              → BrandNewPage            [SuperAdmin only — `brands:create`]
    :id              → <Outlet/>
      index          → BrandDetailPage
      restaurants    → BrandRestaurantsPage
      staff          → BrandStaffPage
      settings       → BrandSettingsPage       [SuperAdmin, RestaurantAdmin]
      audit          → BrandAuditPage
  restaurants        → <Outlet/> (existing)
    index            → RestaurantListPage      [SuperAdmin]
    new              → RestaurantNewPage       [SuperAdmin only]
    :id              → <Outlet/>
      index          → RestaurantDetailPage
      staff          → RestaurantStaffPage
      settings       → RestaurantSettingsPage
      audit          → RestaurantAuditPage
  staff              → <Outlet/> (existing, untouched)
  users              → AdminUsersPage          (redirects to /staff, replace: true)
  audit              → AdminAuditPage
  roles              → AdminRolesPage          [SuperAdmin only]
  settings           → AdminSettingsPage       [SuperAdmin only]
```

### 6.4 Sidebar (in `src/routes/site/admin/AdminZoneLayout.tsx`)

```ts
export const ADMIN_SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { to: PATH.ADMIN,                label: "Dashboard",   labelKey: "admin:dashboard.title" },
  { to: PATH.ADMIN_BRANDS,         label: "Brands",      labelKey: "admin:brands.title" },
  { to: PATH.ADMIN_RESTAURANTS,    label: "Restaurants", labelKey: "admin:restaurants.title",   roles: ["SuperAdmin"] },
  { to: PATH.ADMIN_STAFF,          label: "Staff",       labelKey: "admin:staff.title" },
  { to: PATH.ADMIN_AUDIT,          label: "Audit",       labelKey: "admin:audit.title" },
  { to: PATH.ADMIN_ROLES,          label: "Roles",       labelKey: "admin:roles.title",         roles: ["SuperAdmin"] },
  { to: PATH.ADMIN_SETTINGS,       label: "Settings",    labelKey: "admin:settings.title",      roles: ["SuperAdmin"] },
];
```

> [!NOTE]
> **Brand context indicator in the admin header**: When a SuperAdmin navigates to any `/admin/brands/:id/*` route, the page header (not the sidebar) must show the active brand name and logo as a breadcrumb — e.g. `Admin > Brands > Acme Corp`. This is a header-level indicator powered by `useBrandContext` (reads `?brandId` from URL or `:id` from the route params), NOT a global top-bar switcher. A top-bar brand switcher is deferred — the breadcrumb provides sufficient context for V1.

### 6.5 i18n key catalog

`src/locales/{en,es}/admin.json` — extend the `admin` namespace (do not add `crm`).

```
admin:
  dashboard:    { title, subtitle, pendingInvitations, recentActivity, viewAll,
                  stats: { brands, restaurants, staff, audit } }
  brands:       { title, subtitle_one/_other, new, name, slug, contactEmail,
                  contactPhone, cuisine, website, logo,
                  status: { active, inactive, archived },
                  archive, archiveConfirmTitle, archiveConfirmBody,
                  staffUnavailableBanner,
                  tabs: { overview, restaurants, staff, settings, audit } }
  brandForm:    { create, edit, sections: { basic, contact, branding },
                  validation: { nameRequired, slugPattern, invalidEmail } }
  restaurants:  { title, subtitle_one/_other, new, name, brand, city, country,
                  status: { active, inactive, archived }, archive,
                  address, phone, email, timezone, currency, taxRate, hours,
                  features, autoConfirmReservations, autoConfirmOrders,
                  allowAutoSubstitute, estimatedTurnoverMinutes,
                  tabs: { overview, staff, settings, audit } }
  restaurantForm: { create, edit,
                  sections: { identity, address, contact, schedule, operations, ownership },
                  validation: { ... },
                  hoursEditor: { open, close, closed, addDay } }
  users:        { title, aliasNotice }
  audit:        { title, subtitle, filterEntity, filterActor, filterDateRange,
                  allEntities, entries_one/_other,
                  entityLabels: { brand, restaurant, staff } }
  roles:        { title, subtitle, roleColumn, permissionColumn,
                  permissionNames: { brandsView, brandsCreate, brandsEdit, brandsArchive,
                    restaurantsCreate, restaurantsEdit, restaurantsArchive,
                    usersViewAll, usersCreate, usersEdit,
                    usersAssignRoles, usersAssignRestaurants,
                    rolesView, auditView, settingsView, settingsEdit } }
  settings:     { title, subtitle,
                  sections: { defaults, reservations, substitutions, email, flags },
                  validation: { invalidTimezone, invalidCurrency } }
  auditLog:     { entityLabels: { brand, restaurant, staff }, viewFull }
  status:       { active, inactive, archived }
  actions:      { save, cancel, edit, archive, reactivate, invite }
  tabs:         { dashboard, brands, audit }
```

Spanish: "Marca", "Marcas", "Restaurante", "Restaurantes", "Registro de auditoría", "Roles y permisos", "Ajustes", "Panel". Plural forms `una marca / dos marcas`.

### 6.6 API / data layer (catalog slice — endpoints by phase)

All in `src/app/api/catalog.ts`. New `tagTypes`: `Brands`, `AdminSettings`, `Audit` (added to existing `Restaurants`, `Tables`, `Menu`).

| Endpoint | Phase | Method | Path | Tag invalidation |
|---|---|---|---|---|
| `listBrands` | 2 | GET | `/catalog-api/brands` | `Brands` LIST |
| `getBrand` | 2 | GET | `/catalog-api/brands/{id}` | `Brands` id |
| `createBrand` | 2 | POST | `/catalog-api/brands` | `Brands` LIST, id |
| `updateBrand` | 2 | PUT | `/catalog-api/brands/{id}` | `Brands` id |
| `archiveBrand` | 2 | POST | `/catalog-api/brands/{id}/archive` | `Brands` id, child `Restaurants` |
| `brandRestaurants` | 4 | GET | `/catalog-api/brands/{id}/restaurants` | (no mutation) |
| `brandStaff` | 4 | GET | `/identity-api/users?brandId={id}` | (no mutation; cross-service: Identity owns staff, filters by joining Brand→Restaurant→User) |
| `getAdminRestaurant` | 5 | GET | `/catalog-api/restaurants/{id}` (returns `AdminRestaurantDetail`) | `Restaurants` id |
| `createRestaurant` | 5 | POST | `/catalog-api/restaurants` | `Restaurants` LIST, `Brands` id |
| `updateRestaurant` | 5 | PUT | `/catalog-api/restaurants/{id}` | `Restaurants` id, `Brands` id |
| `archiveRestaurant` | 5 | POST | `/catalog-api/restaurants/{id}/archive` | `Restaurants` id, `Brands` id |
| `getAdminSettings` | 6 | GET | `/catalog-api/settings` | `AdminSettings` GLOBAL |
| `updateAdminSettings` | 6 | PUT | `/catalog-api/settings` | `AdminSettings` GLOBAL |
| `auditFor` | 3 | GET | `/catalog-api/audit/{entityType}/{entityId}` | `Audit` id |
| `listAudit` | 3 | GET | `/catalog-api/audit?entityType=&actorId=&since=&until=` | `Audit` LIST |

> **Pagination contract** (all list endpoints): `?page=1&pageSize=20` (offset-based). Response shape: `{ items: T[], totalCount: number, page: number, pageSize: number }`. Mirrors the existing `listStaff` pattern in `identity.ts`.

### 6.7 Reusable shared components

| Component | Lives in | Replaces / extends |
|---|---|---|
| `<EntityAuditLog entityType entityId limit? />` | `src/features/audit/EntityAuditLog.tsx` | Wraps the existing `<StaffAuditLog />` internals; `StaffAuditLog` becomes a thin wrapper (`<EntityAuditLog entityType="staff" entityId={staffId} />`) so every existing call site works. |
| `<ResourceHeader resource breadcrumb />` | `src/components/Admin/ResourceHeader.tsx` | Standard page header (eyebrow + h1 + subtitle + breadcrumb) for any single-resource detail. |
| `<SettingsSection title description children />` | `src/components/Admin/SettingsSection.tsx` | Reused by brand / restaurant / global settings pages. |
| `<StatusBadge status />` | `src/components/Admin/StatusBadge.tsx` | Maps `active` / `inactive` / `archived` to the right `Badge` variant + label key. |
| `<OperatingHoursGrid hours onChange readOnly />` | `src/features/restaurant/OperatingHoursGrid.tsx` | 7-row controlled grid; read-only + edit modes share the same component. |
| `<AddressCard address />` | `src/features/restaurant/AddressCard.tsx` | Read-only address renderer; reused on the detail Overview tab. |
| `<RolePermissionMatrix />` | `src/features/roles/RolePermissionMatrix.tsx` | Read-only `Table` of role × permission. Reads `ROLE_PERMISSIONS` from `types/auth.ts`. |

### 6.8 Reuse points (do not reinvent)

- `src/features/staff/RestaurantAssignmentGrid.tsx` — controlled matrix; reused on the brand Staff tab.
- `src/features/staff/useGrantableRoles.ts` — stays as-is; `usePermission` is additive.
- `src/lib/forms.ts` — `useZodForm(schema, options)` is ready.
- `src/components/RestaurantContext/useRestaurantContext.ts` — URL-bound `?restaurantId=`; new `useBrandContext` (Phase 2) follows the exact pattern for `?brandId=`, placed at `src/components/BrandContext/useBrandContext.ts`.
- `src/components/Layout/ZoneSplash.tsx` — placeholder for every new stub in Phase 1.
- `src/components/Layout/ZoneSidebar.tsx` — already filters by `item.roles`; no change.
- `src/components/ui/{table, form, dialog, alert-dialog, sheet, pagination, badge, tabs, select, sonner}` — all reused; no new shadcn install.
- `src/test/handlers/identity.ts` MSW pattern — every new endpoint adds a handler there.

---

## 7. Cross-Repository Communication

The OrderlyWeb frontend is a sibling to the Orderly Microservices backend (`docs/backend-architecture/architecture.md`). The contract surface this plan touches:

- **`Catalog.API`** — owns Brands, Restaurants, Menu, Tables. New CRM endpoints (Phase 2+) for brand CRUD, restaurant admin detail, and audit.
- **`Identity.API`** — owns Staff, Roles, Permissions, JWT claims, `LoginAuditLog`. Provides `GET /identity-api/users?brandId=` for brand-scoped staff queries (Phase 4). New permissions must be seeded here.

The frontend does **not** implement server-side authorization; it consumes the response and trusts the gateway. Any change to the JWT `permissions` claim shape (server-side) must be reflected in `src/types/auth.ts` `AuthPredicate.permissions` in the same change.

i18n pre-hydration (`index.html`) already mirrors the language; no per-route coordination needed. The `Accept-Language` header is auto-attached to every RTK Query request (see `src/app/api/base.ts`).

### 7.1 Backend prerequisites table

> Every backend change required by this plan, grouped by blocking phase. A phase **MUST NOT** start implementation until its backend prerequisites are confirmed deployed or have an agreed-upon stub strategy.

| Backend change | Service | Blocking phase | Priority | Notes |
|---|---|:---:|:---:|---|
| Add `Slug` (unique), `IsActive`, `CreatedAt`, `UpdatedAt` to `Brands` table | Catalog.API | **2** | 🔴 | `AuditableEntity<Guid>` base gives timestamps + IsActive for free |
| Brand CRUD endpoints (`GET/POST/PUT /brands`, `POST /brands/{id}/archive`) | Catalog.API | **2** | 🔴 | Carter vertical slice; archive sets `IsActive = false` |
| Seed new permissions: `brands:view`, `brands:create`, `brands:edit`, `brands:archive` | Identity.API | **1** | 🔴 | Add to `PermissionSeeder`; assign to `SuperAdmin` + `RestaurantAdmin` roles |
| Seed new permissions: `restaurants:create`, `restaurants:edit`, `restaurants:archive`, `settings:view`, `settings:edit` | Identity.API | **1** | 🔴 | Same seeder |
| Generic `AuditEntries` table + REST endpoints | Catalog.API | **3** | 🔴 | `GET /audit/{entityType}/{entityId}`, `GET /audit?entityType=&actorId=&since=&until=` |
| `GET /identity-api/users?brandId=` filter (joins Brand→Restaurant→User) | Identity.API | **4** | 🟡 | Alternative: Catalog exposes `/brands/{id}/staff` and calls Identity internally |
| Add `Status` (enum), `OwnerId` (FK), `OperatingHours` (JSON or child table) to `Restaurants` | Catalog.API | **5** | 🔴 | Structured `Address` (OwnsOne) also recommended |
| `AuditableEntity<Guid>` base on `Restaurant` (CreatedAt/UpdatedAt) | Catalog.API | **5** | 🔴 | Same migration as Status |
| Restaurant archive/restore endpoint (`POST /restaurants/{id}/archive`) | Catalog.API | **5** | 🔴 | Sets `Status = "archived"`; blocks if assigned staff are still active |
| `AdminSettings` singleton aggregate + `GET/PUT /settings` | Catalog.API | **6** | 🟡 | Can be deferred; Phase 6 ships `RolePermissionMatrix` first |
| Add `AvatarUrl`, `LastLoginAt` to `AspNetUsers` | Identity.API | **4** | 🟢 | Nice-to-have for staff cards |
| `brandId` JWT claim (optional) | Identity.API | **—** | 🟢 | Not required if server-side brand scoping works via restaurant→brand join |

### 7.2 Brand scoping strategy

> [!IMPORTANT]
> The Identity Service tracks user→restaurant assignments via the `UserRestaurant` table (`UserId`, `RestaurantId`, `IsDefault`). There is **no `UserBrand` table** and **no `brandId` JWT claim**.
>
> Brand-scoped queries work by joining through the chain: **Brand → Restaurant → UserRestaurant → User**. The server scopes list responses (brands, restaurants, staff) to the actor's assigned restaurants, then groups by brand. The frontend renders whatever the server returns — no client-side brand filtering.
>
> If a dedicated `UserBrand` junction table or `brandId` claim is needed later (e.g., for brand-level admin assignment without restaurant assignment), that is a separate Identity Service migration tracked outside this plan.

---

## 8. Security guardrails

> [!CAUTION]
> The Identity Service / Catalog API is the **source of truth** for authorization. Client-side role and permission gating is **UX-only** (hide buttons, render `ForbiddenPage`). The frontend MUST NOT attempt to enforce security; the gateway and JWT claims do.

| Risk | Mitigation |
|---|---|
| Manager sees brands outside their scope | Server scopes the brand list to the actor's claims. Client renders whatever the server returns; `RequirePermission` hides sub-routes the user can't reach. |
| RestaurantAdmin edits another brand's settings | Route-level `RequirePermission("brands:edit")` + server re-check on the mutation; conflict type guard `isBrandForbidden` (403) → toast + no state change. |
| Audit log leaks other tenants' actions | Server scopes `listAudit` and `auditFor` by actor. `useAuditForQuery` skips if no permission. |
| Slug collision on brand create | `BRAND_DUPLICATE_SLUG` (409) type guard in `src/features/brand/conflict.ts`; UI shows inline form error. |
| Archiving a brand with active restaurants | `BRAND_HAS_ACTIVE_RESTAURANTS` (409) type guard; `archiveBrand` is blocked until child restaurants are archived first. |
| Token rotation race | Already handled: `src/lib/authRefresh.ts` single-flight + `dynamicBaseQuery` in `src/app/api/base.ts`. No new auth code. |
| XSS in user-controlled audit `before/after` JSON | Audit entries render via `Intl.DateTimeFormat` + string-only labels; never `dangerouslySetInnerHTML`. New entries go through the existing pattern. |
| Open-redirect on `?returnTo=` | Already handled: `src/lib/safeReturnPath.ts`. No new URL-redirect code. |

---

## 9. Development Phases

### Phase overview

| Phase | Name | Tool groups delivered | Goal |
|:---:|---|---|---|
| **1** | Foundation: types, permissions, route tree, i18n | 14 stub pages, `usePermission`, `RequirePermission`, all i18n keys | URL tree is real, sidebar is real, auth/permission contracts are typed. No business logic. |
| **2** | Brands CRUD | `listBrands` / `getBrand` / `createBrand` / `updateBrand` / `archiveBrand`; `BrandList`, `BrandForm`, `BrandDetail` Overview | SuperAdmin can fully manage brands. |
| **3** | Generic `EntityAuditLog` | `auditFor`, `listAudit`; `<EntityAuditLog>`; `StaffAuditLog` becomes a wrapper; AdminAuditPage | One component powers all audit timelines. |
| **4** | Brand detail tabs | `BrandRestaurantsPage`, `BrandStaffPage`, `BrandSettingsPage`, `BrandAuditPage`; `brandRestaurants` / `brandStaff` queries | Every brand tab renders real content. |
| **5** | Restaurants full CRM | `AdminRestaurantDetail` shape; `getAdminRestaurant` / `createRestaurant` / `updateRestaurant` / `archiveRestaurant`; `RestaurantForm`, `OperatingHoursGrid`, `AddressCard`; restaurant tabs | SuperAdmin can fully manage restaurants, including hours and address. |
| **6** | Roles + global Settings | `RolePermissionMatrix`; `AdminSettingsForm`; `getAdminSettings` / `updateAdminSettings`; `AdminRolesPage`, `AdminSettingsPage` | SuperAdmin can view the role matrix and edit global settings. |
| **7** | Admin Dashboard | `AdminDashboardPage` real; `<StatsGrid>`, `<EntityAuditLog limit={5} />`, brand/restaurant cards | First impression after login is a real dashboard, not a splash. |
| **8** | Hardening | E2E in both locales; full i18n audit; axe sweep; docs update; `pnpm ui:check` clean | PR-ready for merge to `main`. |

### Phase 1 — Foundation: types, permissions, route tree, i18n

**Goal**: After Phase 1, the URL tree is real, the sidebar is real, and the auth/permission contracts are typed. Every new route renders `<ZoneSplash />`. All `pnpm ui:check` audit gates pass.

**Status**: ✅ Done (2026-08-08) — working tree only, awaiting commit.

**Deliverables**:

- [x] Extend `src/types/auth.ts` with `Permission` union (16 entries, `colon:action` convention matching backend) and `ROLE_PERMISSIONS` table
- [x] Add `src/components/RouteGuards/usePermission.ts` + `RequirePermission.tsx`; update barrel
- [x] Add 15 new `ADMIN_*` path constants and 3 query-param keys to `src/router/pathNames.ts`
- [x] Extend `src/router/zones/adminZone.tsx` with the brand subtree (index/new/:id+5 tabs) and the restaurant detail outlet (new + 3 tabs), plus users/audit/roles leaves
- [x] Update `ADMIN_SIDEBAR_ITEMS` to 7 entries; fix the `tabs.members` typo → `dashboard.title`
- [x] Type-only extensions to `src/app/api/catalog.ts` (Brands/AdminSettings/Audit tagTypes + new DTOs) and `src/app/api/identity.ts` (`StaffMember` additive fields)
- [x] Add bilingual keys to `src/locales/en/admin.json` and `src/locales/es/admin.json` (dashboard, brands, brandForm, restaurants, restaurantForm, users, audit, roles, settings, auditLog, status, actions, tabs)
- [x] Create 14 new stub page files under `src/routes/site/admin/` (each ≤ 15 LOC, all `<ZoneSplash />` or the `/users` redirect)
- [x] Colocated tests: `usePermission.test.tsx`, `RequirePermission.test.tsx`, extended `router.test.tsx` (route guard coverage), new `pathNames.test.ts`

**Exit criteria**:
- `pnpm typecheck` — clean.
- `pnpm lint` (src) — no new errors (only pre-existing `only-export-components` warnings and an unrelated `e2e/fixtures/withLocale.ts` `rules-of-hooks` error). `format:check` reports `src/components/ui/password-input.tsx` as failing — that file is from the pre-existing SignInDialog/LoginPage work that is out of scope for this plan and is therefore not addressed here.
- `pnpm test:run` — `usePermission`, `RequirePermission`, and `pathNames` suites all green; the 13 pre-existing `router.test.tsx` failures reproduce on `main` before any of this work is applied (root cause: jsdom lacks `IntersectionObserver` so the HomePage `<Carousel>` crashes the error boundary; the same test harness fails identically on the unstashed tree). This is an environment problem, not a regression from Phase 1.
- `pnpm ui:check` — same caveats as `lint` and `test:run`.
- Manual smoke: pending the dev-server run.

---

### Phase 2 — Brands CRUD

**Goal**: SuperAdmin can create, view, edit, and archive brands. RestaurantAdmin can read and update brands they own.

**Status**: ✅ Done (2026-10-18)

**Deliverables**:

- [x] Wire `listBrands` / `getBrand` / `createBrand` / `updateBrand` / `archiveBrand` in `src/app/api/catalog.ts` (tags: `Brands` LIST, id)
- [x] `src/features/brand/{BrandList, BrandForm, BrandDetail, useBrandFilters, brandSchema, conflict, index}.{ts,tsx}`
- [x] `BrandList` table with `?q=`, `?active=` filters; `useBrandFilters` mirrors `useStaffFilters`
- [x] `BrandForm` with `useZodForm` & Zod validation; conflict UX for `BRAND_DUPLICATE_SLUG` (409)
- [x] `BrandDetail` Overview tab: header card + counts (restaurants, staff) + status badge
- [x] Archive action behind `<AlertDialog>` (mirrors staff deactivate); conflict UX for `BRAND_HAS_ACTIVE_RESTAURANTS`
- [x] MSW handlers in `src/test/handlers/catalog.ts` (5 endpoints)
- [x] Colocated `*.test.tsx` per file; `axe()` sweep clean

**Exit criteria**: SuperAdmin can sign in, create a brand, view its Overview, edit it, archive it (when no active children), and see the brand disappear from the list. RestaurantAdmin cannot reach `/brands/new` (ForbiddenPage). Vitest + `pnpm ui:check` clean.

---

### Phase 3 — Generic `EntityAuditLog`

**Goal**: One component powers all audit timelines. `StaffAuditLog` becomes a thin wrapper so every existing call site works unchanged.

**Status**: ✅ Done (2026-10-18)

**Deliverables**:

- [x] Wire `auditFor` and `listAudit` in `catalog.ts` (tag: `Audit` LIST, id)
- [x] `src/features/audit/{api, EntityAuditLog, conflict, index}.{ts,tsx}`
- [x] Refactor `src/features/staff/StaffAuditLog.tsx` to render `<EntityAuditLog entityType="staff" entityId={id} />`
- [x] `AdminAuditPage` real (Phase 1 splash replaced); filters: entity type, actor, date range
- [x] `AdminAuditEntry` mapping to `StaffAuditEntry` for backward compatibility
- [x] MSW handlers for `auditFor` and `listAudit`
- [x] Colocated tests (`EntityAuditLog.test.tsx`, `AdminAuditPage.test.tsx`, `StaffAuditLog.test.tsx`)

**Exit criteria**: Brand, Restaurant, and Staff audit timelines all render the same `<EntityAuditLog />` with the right entity filter. The cross-entity `AdminAuditPage` filters work. Existing `StaffDetail`'s audit tab is unchanged visually but powered by the new component.

---

### Phase 4 — Brand detail tabs

**Goal**: Every brand detail tab renders real content. Tabs: Overview · Restaurants · Staff · Settings · Audit.

**Status**: ✅ Done (2026-10-18)

**Deliverables**:

- [x] Wire `brandRestaurants` and `brandStaff` queries in `catalog.ts` (pure data)
- [x] `BrandRestaurantsPage` — displays brand-filtered restaurant list
- [x] `BrandStaffPage` — informational banner per stub strategy + `useBrandContext` hook
- [x] `BrandSettingsPage` — form for brand-scoped identity/settings
- [x] `BrandAuditPage` — mounts `<EntityAuditLog entityType="brand" entityId={id} />`
- [x] Colocated `BrandDetailTabs.test.tsx` suite; `axe()` sweep clean

**Exit criteria**: Navigating to a brand and clicking each of the 5 tabs shows the correct content, all in en + es, all gated to the right permission.

---

### Phase 5 — Restaurants: full `AdminRestaurantDetail` shape

**Goal**: SuperAdmin can fully manage restaurants, including hours, address, tax, currency, and ownership.

**Status**: ✅ Done (2026-10-18)

**Deliverables**:

- [x] `getAdminRestaurant` / `createRestaurant` / `updateRestaurant` / `archiveRestaurant` in `catalog.ts`; tags invalidate `Restaurants` and parent `Brands`
- [x] `src/features/restaurant/{api, AdminRestaurantDetail, RestaurantForm, OperatingHoursGrid, AddressCard, useRestaurantFilters, conflict, index}.{ts,tsx}`
- [x] `OperatingHoursGrid` — 7-day controlled component; read-only + edit modes
- [x] `AddressCard` — read-only address renderer
- [x] `RestaurantForm` — multi-section (`useZodForm` / schema): identity, address, contact, schedule (OperatingHoursGrid), operations, ownership
- [x] `RestaurantDetail` tabs: Overview / Staff / Settings / Audit
- [x] Wire `<ResourceHeader>` and `<StatusBadge>` shared components
- [x] MSW handlers in `src/test/handlers/catalog.ts`
- [x] Colocated tests in `RestaurantPages.test.tsx` (all passing, axe clean)

**Exit criteria**: SuperAdmin can create a restaurant under a brand, fill address + hours + tax, and see it appear in the brand's Restaurants tab and the global list. Archive action blocks when staff are still assigned.

---

### Phase 6 — Roles matrix + global Settings

**Goal**: SuperAdmin can view the role × permission matrix and edit global settings.

**Status**: ✅ Done (2026-10-18)

**Deliverables**:

- [x] `getAdminSettings` / `updateAdminSettings` in `catalog.ts`; tag: `AdminSettings` GLOBAL
- [x] `src/features/roles/{RolePermissionMatrix, index}.{tsx,ts}` — read-only table
- [x] `src/features/settings/{AdminSettingsForm, settingsSchema, index}.{tsx,ts}` — global settings form
- [x] `AdminRolesPage` real; `AdminSettingsPage` real (existing placeholder replaced)
- [x] MSW handlers; colocated tests (`RolePermissionMatrix.test.tsx`, `AdminRolesPage.test.tsx`, `AdminSettingsPage.test.tsx`)

**Exit criteria**: `/admin/roles` shows the 8×16 matrix. `/admin/settings` saves a global config and persists across reload. RestaurantAdmin does not see either page in the sidebar.

---

### Phase 7 — Admin Dashboard

**Goal**: `/site/admin` shows a real dashboard on first login.

**Status**: ✅ Done (2026-10-18)

**Deliverables**:

- [x] `AdminDashboardPage` real; composes KPI tiles, `<EntityAuditLog limit={5} />`, Brands under management, Restaurants needing attention, and Pending invitations
- [x] KPI tiles: brands under management, restaurants, staff, and audit entries
- [x] "Pending invitations" panel (counts pending staff)
- [x] "Recent activity" panel (top 5 audit entries with entity badges)
- [x] "Brands under management" + "Restaurants needing attention" cards (drill-down to brand / restaurant detail)
- [x] Colocated tests in `AdminDashboardPage.test.tsx` (bilingual en/es and axe a11y clean)

**Exit criteria**: Dashboard renders without layout shift in light + dark, en + es, all KPIs have real data via RTK Query. Colocated and router tests pass.

---

### Phase 8 — Hardening

**Goal**: PR-ready for merge. All audit gates pass.

**Status**: 🔒 Blocked

**Deliverables**:

- [ ] Full i18n audit: every key in both en and es; no `console.warn` from `missingKeyHandler`
- [ ] `e2e/admin-crm.spec.ts` — create-brand → add-restaurant → invite-staff flow under `en` and `es` via `withLocale` fixture
- [ ] axe-core sweep on every new page (run in Playwright + vitest)
- [ ] `pnpm ui:check` clean (typecheck + oxlint + vitest + Playwright axe)
- [ ] Update `docs/website-spec.md` §4.1 / §4.3 / §5 if any spec changed
- [ ] Update `AGENTS.md` if any new convention is introduced (e.g. permission hook)

**Exit criteria**: `pnpm test && pnpm test:e2e && pnpm ui:check` all green in CI. Manual smoke: login as each role, navigate every admin route, no console errors, no missing-key warnings.

---

### Implementation notes (append after each phase completes)

> Append a new "implementation notes" section after every phase is finished. The structure stays constant so readers can find the same information in every phase's notes.

### Phase 1 implementation notes (YYYY-MM-DD)

> Populated when Phase 1 ships. Items use the structure below.

**§6 items — adopted in Phase 1.**
- Permission union + ROLE_PERMISSIONS — `[✅ adopted]` added to `src/types/auth.ts`.
- usePermission + RequirePermission — `[✅ adopted]` added to `src/components/RouteGuards/`.
- Path constants — `[✅ adopted]` 15 new + 3 query keys added to `src/router/pathNames.ts`.
- Route tree — `[✅ adopted]` 20 new children added to `adminZone.tsx`.
- Sidebar — `[✅ adopted]` 7 items; typo fixed.
- i18n keys — `[✅ adopted]` ~80 new keys in en + es.
- Type-only API extensions — `[✅ adopted]` CatalogBrand, AdminRestaurantDetail, AdminSettings, AdminAuditEntry declared.

**Bugs found + fixed during implementation.**
- (none yet)

**Deferred to a Phase N follow-up (scope).**
- (none yet)

**Phase 1 verification (without / with X).**
- `pnpm typecheck` — clean.
- `pnpm lint` — clean.
- `pnpm format:check` — clean.
- `pnpm test:run` — N new tests, all passing.
- `pnpm ui:check` — clean.
- Manual smoke: 7 sidebar items render in en + es; every new URL renders its placeholder; `Accept-Language` header attached to all RTK Query calls.

**Files added.** List. **Files modified:** List.

---

## 10. Technical considerations

> Surfaced from a design review of this plan. Each item points at a concrete risk and (where useful) to the relevant reference doc. Phase 1 adopts the cross-cutting items before any feature code is written — they are far cheaper to retrofit then.

### 10.1 Cross-cutting

> **Phase 1 adoption (2026-08-08):** items marked `[P1 ✅]` were adopted in Phase 1 (foundation). Items without that marker remain pending for the phase that introduces the corresponding code.

**Permission as a typed union** — `[P1 ✅ adopted]` Promotes `Permission` from `string` to a 17-member union. The `AuthPredicate.permissions` field in the session shape becomes `readonly Permission[]`. The MSW identity handler (`src/test/handlers/identity.ts`) returns `permissions: []` today; once the backend populates the claim, the client lights up automatically.

**`usePermission` + `RequirePermission` as additive guards** — `[P1 ✅ adopted]` The existing `RequireRole` / `GuardedPage` pattern stays untouched. `RequirePermission` composes with `RequireRole`; both gates run, first rejection renders `<ForbiddenPage />`.

**Additive `AdminRestaurantDetail` instead of mutating `CatalogRestaurant`** — `[P5 ⏳ pending]` `CatalogRestaurant` is consumed by code outside the admin zone (Header switcher, future menu pages). Mutating it would force every consumer to handle new fields. The list endpoint keeps returning the slim shape; only the detail endpoint returns the full CRM shape.

**`EntityAuditLog` as a wrapper, not a copy** — `[P3 ⏳ pending]` The `StaffAuditLog` precedent is the canonical audit timeline. Copying it would double the maintenance burden. A thin wrapper keeps every existing call site working.

**Dual gating (role + permission)** — `[P1 ✅ adopted]` Role-based is cheap and exhaustive; permission-based enables fine-grained UX states without re-architecting the guard tree. Cost is one hook + one component.

**`ZoneSplash` for Phase 1 placeholders** — `[P1 ✅ adopted]` Matches the existing convention. Phase 1 ships a real URL tree with no business logic.

**OperatingHoursGrid as its own component** — `[P5 ⏳ pending]` The 7-day grid is non-trivial (controlled component, time parsing, validation). Extracting it lets the read-only and edit modes share the same code and test file.

**`useZodForm` over `useState` for multi-field forms** — `[P2 ⏳ pending]` The `StaffForm` precedent uses `useState` + inline `validate()` for its 3-field form. Every new form is multi-section (brand identity, address, contact, schedule, operations, ownership) and benefits from the typed schema.

### 10.2 Phase 1 — Foundation

- **[P1 ✅]** All `pnpm ui:check` gates pass on first commit; no half-broken Phase 1.
- **[P1 ✅]** `usePermission` is a no-op until the server populates the `permissions` claim (currently `[]`); every consumer handles the empty case correctly.
- **[P1 ✅]** New i18n keys compile via `CustomTypeOptions.resources.admin`; no `t("admin:...")` is added without a key in both en + es.
- **[P1 ✅]** `Accept-Language` header propagates to all new endpoints; verified via the existing `withLocale` Playwright fixture.

### 10.3 Phase 5 — Restaurants

- **[P5 ⏳ pending]`** `OperatingHoursGrid` time format: store as `HH:mm` (24-hour); render in user's locale via `Intl.DateTimeFormat`.
- **[P5 ⏳ pending]`** `taxRate` validated as 0..1; reject values ≥ 1 with inline error.
- **[P5 ⏳ pending]`** `currency` validated as 3-letter ISO 4217; reject with i18n key `restaurantForm.validation.invalidCurrency`.
- **[P5 ⏳ pending]`** `address.country` validated as ISO 3166-1 alpha-2; reject with `restaurantForm.validation.invalidCountry`.

### 10.4 Phase 7 — Dashboard

- **[P7 ⏳ pending]`** Apply `dataviz` skill: validated default palette from `references/palette.md`, swap for Orderly brand colors.
- **[P7 ⏳ pending]`** No `style={{}}`; all chart colors come from `bg-primary`, `text-ink`, `border-border-subtle` etc.
- **[P7 ⏳ pending]`** KPI tiles follow the `stats-grid` pattern (mono number, display label, muted detail, `hover:translate-x-1`).

### 10.5 Unconsidered areas (added in v2.0 reconciliation)

- **Concurrency / optimistic locking** — when two admins edit the same brand simultaneously, who wins? Consider adding `version` or `ETag` headers and handling `409 Conflict` on stale writes. Decision deferred to Phase 2 implementation.
- **Archive cascade and reversibility** — archiving a brand blocks when active restaurants exist (documented), but: can archived brands be **restored** (reactivated)? What about historical order data referencing the brand's restaurants? The plan includes a `reactivate` action key but no endpoint. Decision: add `POST /brands/{id}/reactivate` (sets `IsActive = true`) to the backend prerequisites.
- **Navigation canonicalization** — `BrandRestaurantsPage` lists restaurants under a brand. Clicking a restaurant navigates to `/admin/restaurants/:id` (global path), not `/admin/brands/:brandId/restaurants/:id` (nested). The global path is canonical; the brand context is preserved via `?brandId=` query param for breadcrumb back-navigation.
- **Dashboard data freshness** — KPI tiles on the dashboard should use RTK Query's `keepUnusedDataFor: 60` (1 minute) to avoid hammering the backend on every tab switch. No live polling; manual refresh button.
- **Mobile responsiveness** — the admin CRM is staff-facing and primarily used on desktop/tablet. The `impeccable` skill covers responsive breakpoints, but the sidebar should collapse to a hamburger menu on `< md` breakpoints. No dedicated mobile layout.
- **Timezone in operating hours** — `OperatingHoursDay.open/close` times are in the **restaurant's local timezone** (stored in `AdminRestaurantDetail.timezone`). The UI renders them as-is; no UTC conversion. Dashboard "last 7 days" uses the viewer's browser timezone for date boundaries.
- **Logo upload flow** — deferred (see §3 out-of-scope). Phase 2 brand form accepts a `logoUrl` text input. Future plan: file picker → presigned S3 upload → CDN URL.
- **Toast patterns** — all CUD operations show a Sonner toast on success (`t("admin:actions.saved")`) and on conflict (409) or forbidden (403). Toasts auto-dismiss after 5s. Archive actions use `<AlertDialog>` for confirmation before the request.
- **Empty states** — every list page must handle the zero-items case with an illustrated empty state (icon + message + CTA button). Use `t("admin:brands.empty")` / `t("admin:restaurants.empty")` keys. Add these to the i18n catalog.
- **Data export** — not in scope. Deferred to a future plan (CSV/PDF export of brands, restaurants, staff, audit).
- **Impeccable Design Mandates (UX Review)** — Avoid color leakage: do not use the 5 service hues (e.g., `bg-gradient-service-cool`) for CRM statuses (Brands/Restaurants). Use semantic states (`success`, `info`, `ink-muted`) instead. KPIs and dataviz must rely on `primary` and `ink` variables, avoiding pure white (`#FFFFFF`) on content pages. KPI numbers should use the `mono` font scale, and empty states should stick to `body` (`Urbanist`) for description copy. Ensure cards remain flat (no `box-shadow`) relying solely on tonal layering (`Sage Linen High`), reserving shadows for overlays like `<AlertDialog>`.

---

## How to use this template

> Adapted from `.agents/plans/_template.md`. The full template guidance applies; this section is the local reminder.

1. **Find-and-replace** the `{{...}}` placeholders in the template fields above. Most are already filled; only update the Status section and the Changelog when phases land.
2. **For each phase**, copy the "Phase N" subsection before starting work. After completion, append a new "Phase N implementation notes (date)" section using the same structure.
3. **Two-commit workflow** per phase: (1) the code commit (`feat:` / `refactor:` / `test:`), (2) the plan update (`docs: mark Phase N complete in admin-crm-zone`). Never mix them.
4. **Drift between the plan and the code is the bug class plans exist to prevent.** When implementation reveals the plan was wrong (schema different than expected, API behaves differently), update the plan *and* the code in the same phase boundary.

### Plan versioning

| Bump | When |
|---|---|
| **Minor** (`v1.0` → `v1.1`) | After each phase completion. Always paired with a Changelog entry. |
| **Major** (`v1.x` → `v2.0`) | When the plan itself is restructured: phase boundaries change, new phases added, or the goal/scope shifts significantly. |
| **No bump for typos** | Fixing a typo or wording error doesn't need a version bump. |

---

## Changelog

> Append a new entry every time the plan's `Plan version` field is bumped.

### v2.2 (2026-10-17) — Gap Analysis Incorporation
- Added brand staff fallback stub strategy for when `GET /identity-api/users?brandId=` is not yet deployed.
- Added brand context breadcrumb indicator spec for `/admin/brands/:id/*` routes.
- Added `staffUnavailableBanner` i18n key to brands catalog.

### v2.1 (2026-08-08) — UX review and Impeccable design mandates
- **Impeccable Design Mandates**: Added UX review findings to §10.5 restricting the use of service hues for CRM entities, emphasizing flat cards, and enforcing typography rules for empty states and KPI tiles.

### v2.0 (2026-08-08) — gap-analysis reconciliation against backend architecture
- Cross-referenced plan against `docs/backend-architecture/architecture.md`, `db_relational_model.mermaid`, and current codebase.
- **Permission convention**: switched from `dot.action` to `colon:action` to match backend's existing 25 seeded permissions in Identity.API. Union reduced from 17 to 16 members (mapped to real backend permission names).
- **CatalogBrand shape**: added `description` (exists in DB, was missing); typed `cuisineType` as enum union; documented `slug`, `active`, `createdAt/updatedAt` as backend migration prerequisites.
- **AdminRestaurantDetail**: documented backend gaps (flat `Address`, missing `Status`, `OwnerId`, `OperatingHours`, timestamps).
- **Audit system**: documented that no generic audit table exists in any backend service; marked Phase 3 as deferrable.
- **AdminSettings**: documented that no settings entity exists; Phase 6 can be split (RolePermissionMatrix ships first).
- **Brand staff query**: rerouted `brandStaff` from Catalog to Identity (`GET /identity-api/users?brandId=`).
- **Cross-repo §7**: added backend prerequisites table (§7.1) and brand scoping strategy (§7.2).
- **Hook path**: fixed `useRestaurantContext` path from `src/hooks/` to actual `src/components/RestaurantContext/`.
- **Phases**: added `Backend prerequisites` checklist to Phases 2–7; added deferral strategy for Phase 3 (audit).
- **§10.5**: added 10 unconsidered areas (concurrency, cascade, navigation, freshness, mobile, timezone, upload, toasts, empty states, export).
- **Out of scope**: added backend migrations, bulk operations, image upload.
- **RestaurantAdmin permissions**: clarified — `brands:create` and `brands:archive` are SuperAdmin-only; RestaurantAdmin gets `brands:view` + `brands:edit` only.

### v1.0 (2026-08-08) — initial draft
- Created plan from design exploration of the OrderlyWeb admin zone.
- Sections 0–9 drafted; Section 10 (review notes) appended.
- 8 phases defined: Foundation → Brands → Audit → Brand Tabs → Restaurants → Roles+Settings → Dashboard → Hardening.
- User decisions captured: Brand as first-class entity; typed Permission union; Foundation first delivery; Dashboard in scope.
