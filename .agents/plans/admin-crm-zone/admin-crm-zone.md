# Admin Zone CRM — Implementation Plan

> Scope: Replace the stubbed `/site/admin` zone with a full Restaurant CRM, including a new top-level **Brand** entity. Bilingual (en/es), role + permission gated, with a real admin dashboard. Consumed by SuperAdmin, RestaurantAdmin, and Manager roles.

---

## Status

> **Plan version**: `v1.0` (2026-08-08) — initial draft, pending Phase 1 approval.
> **Current state**: ⏸ Not started.

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Foundation: types, permissions, route tree, i18n | ⏸ Pending |
| 2 | Brands CRUD (list, new, detail, archive) | 🔒 Blocked |
| 3 | Generic `EntityAuditLog` | 🔒 Blocked |
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
- **Server-side enforcement of brand scoping** — the Identity Service already enforces this; the frontend trusts the response (no client-side security boundary). Documented in §8.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| Namespace for new i18n keys | **Extend `admin`, do not add `crm`** | All CRM copy is admin-zone-only; another namespace only adds bundle weight. `CustomTypeOptions.resources.admin` regenerates the typed key union. |
| Brand modeling | **First-class parent entity** (Brand 1-* Restaurant, Brand 1-* Staff) | User decision. Multi-tenant chains need their own audit, settings, and staff-scoping. |
| Permission shape | **Typed 17-member union** + `ROLE_PERMISSIONS` table in `src/types/auth.ts` | User decision. Replaces placeholder `Permission = string`; enables fine-grained UI gating. |
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
export interface CatalogBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  contactEmail: string;
  contactPhone: string | null;
  cuisineType: string;
  websiteUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RestaurantStatus = "active" | "inactive" | "archived";

export interface OperatingHoursDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string | null;   // "HH:mm" or null = closed
  close: string | null;
}

export interface AdminRestaurantAddress {
  line1: string; line2: string | null;
  city: string; region: string; postalCode: string; country: string;
}

export interface AdminRestaurantDetail extends CatalogRestaurant {
  brandId: string;
  ownerId: string | null;
  address: AdminRestaurantAddress;
  phone: string | null;
  email: string | null;
  timezone: string;
  currency: string;       // ISO 4217
  taxRate: number;        // 0..1
  operatingHours: OperatingHoursDay[];
  estimatedTurnoverMinutes: number;
  autoConfirmReservations: boolean;
  autoConfirmOrders: boolean;
  allowAutoSubstitute: boolean;
  status: RestaurantStatus;
  createdAt: string;
  updatedAt: string;
}

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
export type Permission =
  | "brand.read" | "brand.create" | "brand.update" | "brand.archive"
  | "restaurant.read" | "restaurant.create" | "restaurant.update" | "restaurant.archive"
  | "staff.read" | "staff.invite" | "staff.update" | "staff.deactivate"
  | "role.read" | "role.assign"
  | "audit.read"
  | "settings.read" | "settings.update";

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SuperAdmin:      [/* all 17 */],
  RestaurantAdmin: [/* 13: brand.*, restaurant.*, staff.*, role.read, audit.read, settings.read */],
  Manager:         ["restaurant.read", "staff.read", "audit.read"],
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
    new              → BrandNewPage            [SuperAdmin only — `brand.create`]
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
                  permissionNames: { brandRead, brandCreate, brandUpdate, brandArchive,
                    restaurantRead, restaurantCreate, restaurantUpdate, restaurantArchive,
                    staffRead, staffInvite, staffUpdate, staffDeactivate,
                    roleRead, roleAssign, auditRead, settingsRead, settingsUpdate } }
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
| `brandStaff` | 4 | GET | `/catalog-api/brands/{id}/staff` | (no mutation) |
| `getAdminRestaurant` | 5 | GET | `/catalog-api/restaurants/{id}` (returns `AdminRestaurantDetail`) | `Restaurants` id |
| `createRestaurant` | 5 | POST | `/catalog-api/restaurants` | `Restaurants` LIST, `Brands` id |
| `updateRestaurant` | 5 | PUT | `/catalog-api/restaurants/{id}` | `Restaurants` id, `Brands` id |
| `archiveRestaurant` | 5 | POST | `/catalog-api/restaurants/{id}/archive` | `Restaurants` id, `Brands` id |
| `getAdminSettings` | 6 | GET | `/catalog-api/settings` | `AdminSettings` GLOBAL |
| `updateAdminSettings` | 6 | PUT | `/catalog-api/settings` | `AdminSettings` GLOBAL |
| `auditFor` | 3 | GET | `/catalog-api/audit/{entityType}/{entityId}` | `Audit` id |
| `listAudit` | 3 | GET | `/catalog-api/audit?entityType=&actorId=&since=&until=` | `Audit` LIST |

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
- `src/hooks/useRestaurantContext.ts` — URL-bound `?restaurantId=`; new `useBrandContext` (Phase 2) follows the exact pattern for `?brandId=`.
- `src/components/Layout/ZoneSplash.tsx` — placeholder for every new stub in Phase 1.
- `src/components/Layout/ZoneSidebar.tsx` — already filters by `item.roles`; no change.
- `src/components/ui/{table, form, dialog, alert-dialog, sheet, pagination, badge, tabs, select, sonner}` — all reused; no new shadcn install.
- `src/test/handlers/identity.ts` MSW pattern — every new endpoint adds a handler there.

---

## 7. Cross-Repository Communication

The OrderlyWeb frontend is a sibling to the Orderly Microservices backend (`docs/backend-architecture/architecture.md`). The contract surface this plan touches:

- **`Catalog.API`** — owns Brands, Admin Restaurants, Admin Settings, Audit. New endpoints (Phase 2+).
- **`Identity.API`** — owns Staff, Roles, Permissions, JWT claims. Touched minimally: `StaffMember` widens additively; `permissions: Permission[]` claim (server-side) populates the typed array.

The frontend does **not** implement server-side authorization; it consumes the response and trusts the gateway. Any change to the JWT `permissions` claim shape (server-side) must be reflected in `src/types/auth.ts` `AuthPredicate.permissions` in the same change.

i18n pre-hydration (`index.html`) already mirrors the language; no per-route coordination needed. The `Accept-Language` header is auto-attached to every RTK Query request (see `src/app/api/base.ts`).

---

## 8. Security guardrails

> [!CAUTION]
> The Identity Service / Catalog API is the **source of truth** for authorization. Client-side role and permission gating is **UX-only** (hide buttons, render `ForbiddenPage`). The frontend MUST NOT attempt to enforce security; the gateway and JWT claims do.

| Risk | Mitigation |
|---|---|
| Manager sees brands outside their scope | Server scopes the brand list to the actor's claims. Client renders whatever the server returns; `RequirePermission` hides sub-routes the user can't reach. |
| RestaurantAdmin edits another brand's settings | Route-level `RequirePermission("brand.update")` + server re-check on the mutation; conflict type guard `isBrandForbidden` (403) → toast + no state change. |
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

**Status**: ⏸ Pending

**Deliverables**:

- [ ] Extend `src/types/auth.ts` with `Permission` union (17 entries) and `ROLE_PERMISSIONS` table
- [ ] Add `src/components/RouteGuards/usePermission.ts` + `RequirePermission.tsx`; update barrel
- [ ] Add 15 new `ADMIN_*` path constants and 3 query-param keys to `src/router/pathNames.ts`
- [ ] Extend `src/router/zones/adminZone.tsx` with ~20 new route children, all rendering stubs
- [ ] Update `ADMIN_SIDEBAR_ITEMS` to 7 entries; fix the `tabs.members` typo → `dashboard.title`
- [ ] Type-only extensions to `src/app/api/catalog.ts` and `src/app/api/identity.ts` (no endpoint behavior)
- [ ] Add ~80 new keys to `src/locales/en/admin.json` and `src/locales/es/admin.json`
- [ ] Create 14 new stub page files under `src/routes/site/admin/` (each ≤ 15 LOC, all `<ZoneSplash />`)
- [ ] Colocated tests: `usePermission.test.tsx`, extended `router.test.tsx` (route guard coverage), new `pathNames.test.ts`

**Exit criteria**: `pnpm typecheck && pnpm lint && pnpm test:run && pnpm format:check && pnpm ui:check` all pass. Manual smoke (login as SuperAdmin → /site/admin shows 7 sidebar items → every new URL renders its placeholder → switch language to es → no missing-key warnings) succeeds.

---

### Phase 2 — Brands CRUD

**Goal**: SuperAdmin can create, view, edit, and archive brands. RestaurantAdmin can read and update brands they own.

**Status**: 🔒 Blocked

**Deliverables**:

- [ ] Wire `listBrands` / `getBrand` / `createBrand` / `updateBrand` / `archiveBrand` in `src/app/api/catalog.ts` (tags: `Brands` LIST, id)
- [ ] `src/features/brand/{api, BrandList, BrandForm, BrandDetail, useBrandFilters, conflict, index}.{ts,tsx}`
- [ ] `BrandList` table with `?q=`, `?active=` filters; `useBrandFilters` mirrors `useStaffFilters`
- [ ] `BrandForm` with `useZodForm(brandCreateSchema)`; conflict UX for `BRAND_DUPLICATE_SLUG` (409)
- [ ] `BrandDetail` Overview tab: header card + counts (restaurants, staff) + status badge
- [ ] Archive action behind `<AlertDialog>` (mirrors staff deactivate); conflict UX for `BRAND_HAS_ACTIVE_RESTAURANTS`
- [ ] MSW handlers in `src/test/handlers/catalog.ts` (5 endpoints)
- [ ] Colocated `*.test.tsx` per file; `axe()` sweep

**Exit criteria**: SuperAdmin can sign in, create a brand, view its Overview, edit it, archive it (when no active children), and see the brand disappear from the list. RestaurantAdmin cannot reach `/brands/new` (ForbiddenPage). Vitest + `pnpm ui:check` clean.

---

### Phase 3 — Generic `EntityAuditLog`

**Goal**: One component powers all audit timelines. `StaffAuditLog` becomes a thin wrapper so every existing call site works unchanged.

**Status**: 🔒 Blocked

**Deliverables**:

- [ ] Wire `auditFor` and `listAudit` in `catalog.ts` (tag: `Audit` LIST, id)
- [ ] `src/features/audit/{api, EntityAuditLog, conflict, index}.{ts,tsx}`
- [ ] Refactor `src/features/staff/StaffAuditLog.tsx` to render `<EntityAuditLog entityType="staff" entityId={id} />`
- [ ] `AdminAuditPage` real (Phase 1 splash replaced); filters: entity type, actor, date range
- [ ] `AdminAuditEntry` mapping to `StaffAuditEntry` for backward compatibility
- [ ] MSW handlers for `auditFor` and `listAudit`
- [ ] Colocated tests (re-use existing `StaffAuditLog.test.tsx` assertions under the new name)

**Exit criteria**: Brand, Restaurant, and Staff audit timelines all render the same `<EntityAuditLog />` with the right entity filter. The cross-entity `AdminAuditPage` filters work. Existing `StaffDetail`'s audit tab is unchanged visually but powered by the new component.

---

### Phase 4 — Brand detail tabs

**Goal**: Every brand detail tab renders real content. Tabs: Overview · Restaurants · Staff · Settings · Audit.

**Status**: 🔒 Blocked

**Deliverables**:

- [ ] Wire `brandRestaurants` and `brandStaff` queries in `catalog.ts` (no mutation; pure data)
- [ ] `BrandRestaurantsPage` — reuses `RestaurantList` with `?brandId=` pre-set
- [ ] `BrandStaffPage` — reuses `StaffList` with `?brandId=` pre-set; add `useBrandContext` hook
- [ ] `BrandSettingsPage` — form for brand-scoped `AdminSettings` slice
- [ ] `BrandAuditPage` — mounts `<EntityAuditLog entityType="brand" entityId={id} />`
- [ ] Colocated `*.test.tsx` per page; `axe()` sweep

**Exit criteria**: Navigating to a brand and clicking each of the 5 tabs shows the correct content, all in en + es, all gated to the right permission.

---

### Phase 5 — Restaurants: full `AdminRestaurantDetail` shape

**Goal**: SuperAdmin can fully manage restaurants, including hours, address, tax, currency, and ownership.

**Status**: 🔒 Blocked

**Deliverables**:

- [ ] `getAdminRestaurant` / `createRestaurant` / `updateRestaurant` / `archiveRestaurant` in `catalog.ts`; tags invalidate `Restaurants` and parent `Brands`
- [ ] `src/features/restaurant/{api, AdminRestaurantDetail, RestaurantForm, OperatingHoursGrid, AddressCard, useRestaurantFilters, conflict, index}.{ts,tsx}`
- [ ] `OperatingHoursGrid` — 7-day controlled component; read-only + edit modes
- [ ] `AddressCard` — read-only address renderer
- [ ] `RestaurantForm` — multi-section (`useZodForm`): identity, address, contact, schedule (OperatingHoursGrid), operations, ownership
- [ ] `RestaurantDetail` tabs: Overview / Staff / Settings / Audit
- [ ] Wire `<ResourceHeader>` and `<StatusBadge>` shared components
- [ ] MSW handlers in `src/test/handlers/catalog.ts`
- [ ] Colocated tests; Playwright happy-path that creates a restaurant

**Exit criteria**: SuperAdmin can create a restaurant under a brand, fill address + hours + tax, and see it appear in the brand's Restaurants tab and the global list. Archive action blocks when staff are still assigned.

---

### Phase 6 — Roles matrix + global Settings

**Goal**: SuperAdmin can view the role × permission matrix and edit global settings.

**Status**: 🔒 Blocked

**Deliverables**:

- [ ] `getAdminSettings` / `updateAdminSettings` in `catalog.ts`; tag: `AdminSettings` GLOBAL
- [ ] `src/features/roles/{RolePermissionMatrix, index}.{tsx,ts}` — read-only table
- [ ] `src/features/settings/{AdminSettingsForm, index}.{tsx,ts}` — global settings form
- [ ] `AdminRolesPage` real; `AdminSettingsPage` real (existing placeholder replaced)
- [ ] MSW handlers; colocated tests

**Exit criteria**: `/admin/roles` shows the 8×16 matrix. `/admin/settings` saves a global config and persists across reload. RestaurantAdmin does not see either page in the sidebar.

---

### Phase 7 — Admin Dashboard

**Goal**: `/site/admin` shows a real dashboard on first login.

**Status**: 🔒 Blocked

**Deliverables**:

- [ ] `AdminDashboardPage` real; composes `<StatsGrid>` + `<EntityAuditLog limit={5} />` + brand/restaurant cards
- [ ] KPI tiles: brands under management, restaurants, staff, audit entries (last 7 days)
- [ ] "Pending invitations" panel (counts staff with `active=false` who joined within 7 days)
- [ ] "Recent activity" panel (top 5 audit entries, any entity type)
- [ ] "Brands under management" + "Restaurants needing attention" cards (drill-down to brand / restaurant detail)
- [ ] Apply `impeccable` + `dataviz` skills; placeholder palette in `references/palette.md`, swap for Orderly brand colors

**Exit criteria**: Dashboard renders without layout shift in light + dark, en + es, all KPIs have real data via RTK Query. Snapshot test on the layout.

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

### v1.0 (2026-08-08) — initial draft
- Created plan from design exploration of the OrderlyWeb admin zone.
- Sections 0–9 drafted; Section 10 (review notes) appended.
- 8 phases defined: Foundation → Brands → Audit → Brand Tabs → Restaurants → Roles+Settings → Dashboard → Hardening.
- User decisions captured: Brand as first-class entity; typed Permission union; Foundation first delivery; Dashboard in scope.
