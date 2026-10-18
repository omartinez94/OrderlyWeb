# OrderlyWeb — Master Implementation Plan

> Scope: Comprehensive phased roadmap for the end-to-end development of the OrderlyWeb frontend, delivering full enterprise operational workflows across Restaurant Operations (Orders, Basket, Menu, Floor & Queue), Kitchen Display System (Real-time KDS & Hardware Bump Bar), Multi-Brand Admin CRM, and Operational Analytics.

---

## Status

> **Plan version**: `v1.1` (2026-10-16) — Restructured with microservice alignment (`Basket.API`, `Catalog.API`, `Ordering.API`, `Kitchen.API`), child plan synchronization, and anticipatory UX specifications.
> **Current state**: 🚧 Phase 0, 1, and 2 completed. Phase 3 & 4 ready for kickoff.

| Phase | Name | Target Deliverable / Domain | Status |
|:---:|---|---|:---:|
| **0** | API Gateway & RTK Query Alignment | Cross-cutting / Data Layer (`ordering-api`, `kitchen-api`, `basket-api`, `catalog-api`) | ✅ Done |
| **1** | Restaurant Operations: Orders & Basket Lifecycle | `/site/restaurant/orders/*`, Token-bound Cart & Checkout | ✅ Done |
| **2** | Real-Time KDS & Bump Bar Hardware Ecosystem | `/site/kitchen/*`, SignalR Hub, Virtual Bump Bar (`BroadcastChannel`) | ✅ Done |
| **3** | Catalog, Floor Plan, Reservations & Queue Operations | `/site/restaurant/menu`, `/tables`, `/reservations`, `/queue` | ⏸ Pending |
| **4** | Multi-Brand Admin CRM & Governance | `/site/admin/*` (Brands, Restaurants, Staff, Roles, Audit, Settings) | ⏸ Pending |
| **5** | Operational Analytics, Feedback & Production Hardening | `/site/restaurant/analytics`, `/feedback`, Playwright E2E, a11y & Lighthouse | 🔒 Blocked |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> [!NOTE]
> **Parallel execution**: Phases 1, 2, 3, and 4 can all start **concurrently** once Phase 0 exits. The "Blocked" status reflects the dependency on Phase 0 API alignment, not a sequential order among themselves. Only Phase 5 has a hard dependency on all four preceding phases being feature-complete.

> **Commit messages**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Short imperative subject, ≤50 chars, no trailing period.
> **Update rule**: On every phase completion, the plan MUST be updated in the same commit group as the phase work. The plan is the source of truth for what was decided and what shipped.

---

## 0. Skill & Architectural Mandates

### 0.1 Skill Mandate
- **All implementation work MUST follow `OrderlyWeb/AGENTS.md` and repository design rules in `OrderlyWeb/DESIGN.md` ("The Stainless Line" — industrial culinary precision).**
- **Impeccable Design Skill**: High heat for urgency (Induction Flame Orange `#EA580C` ≤ 10%), 5-stop service hue gradient strictly for ticket progression, monospace telemetry for timers and token IDs, chamfered 6px controls / 8px cards.
- **Data Layer**: Follow `add-rtk-query-slice` conventions, with rigorous cache invalidation per tenant (`restaurantId`).

### 0.2 Code-Quality Guard Rails
- **TypeScript strict mode**: No `any` outside generated DTO shims.
- **Styling**: TailwindCSS 4 utility-first + design tokens in `src/index.css`. No inline `style={{}}` on JSX unless purely dynamic.
- **Typography**: `MuseoModerno` exclusively for display/headlines/titles; `Urbanist` exclusively for body/content; System monospace for ticket counters, table tokens, and order IDs. Never swap roles.
- **Components**: Primitives MUST come from `src/components/ui/` (Radix UI / shadcn path).
- **Icons**: Named exports from `lucide-react` only. No emojis, no hand-rolled SVGs.
- **Toasts**: Single source of truth via Sonner (`import { toast } from "@/components/ui/sonner"`).
- **Localization**: All user-visible copy MUST go through `react-i18next` with complete `en` and `es` typed keys (`CustomTypeOptions`).
- **Currency & Dates**: Always `formatCurrency` (`src/utils/currency.ts`) and `date-fns` wrappers (`src/utils/date.ts`). Never hand-roll `"$"` or `new Date()`.

---

## 1. Context & Microservices Alignment

Orderly is an enterprise restaurant platform structured as a .NET 10 microservice backend fronted by YARP and consumed by the OrderlyWeb React 19 SPA.

### 1.1 Where We Stand Today
1. **Foundation & Auth Verified**:
   - Live route guards (`RequireAuth`, `RequireRole`, `GuardedPage`).
   - JWT token decode with role/permission/restaurant claims.
   - Demo credentials aligned with seeded data.
   - Token storage in Redux in-memory state; refresh tokens managed via httpOnly cookies.
2. **Staff Management Operational**:
   - `/site/admin/staff` CRUD and role grant authority functional.
3. **Primary Workflow Gaps**:
   - Orders, Cart, KDS, Menu availability, Table floor plan, and Analytics routes currently render `<ZoneSplash />` placeholders.
   - RTK Query slices contain legacy or incorrect endpoint URLs (`/order-api/` vs `/ordering-api/v1/`, missing `Basket.API` client, `/kitchen-api/kds/` vs `/kitchen-api/v1/kitchen/queue`).

### 1.2 Microservice Target Mapping (YARP Gateway at `http://localhost:6004`)

| Gateway Route Prefix | Backend Target Service | Port | Storage / Engine | Key Operational Responsibilities |
|:---|:---|:---:|:---|:---|
| `/identity-api/{**}` | `Identity.API` | 6007 | Postgres + OpenIddict | Auth, users, roles, 25 seeded permissions, staff assignments. |
| `/ordering-api/{**}` | `Ordering.API` | 6003 | SQL Server 2022 | Clean Architecture DDD `Order` aggregate, status lifecycle, activity timeline. |
| `/basket-api/{**}` | `Basket.API` | 6001 | Postgres (Marten) + Redis | Multi-tenant shopping cart, coupon resolution (gRPC Discount), checkout outbox. |
| `/kitchen-api/{**}` | `Kitchen.API` | 6005 | Postgres + SignalR | Kitchen tickets queue, bump/recall/prep actions, real-time `/hubs/kitchen`. |
| `/catalog-api/{**}` | `Catalog.API` | 6000 | Postgres (EF + Marten) | Brands, Restaurants, Tables, MergedTables, Menu, 86'd Ingredients, Reservations, Queue, Feedback. |
| `/discount-api/{**}` | `Discount.Grpc` | 6002 | SQLite | gRPC promo coupons, discount rules, feedback reward codes. |

---

## 2. Goal

Deliver a responsive, anticipatory, and real-time operational web application:
- **Waiters & Cashiers**: Fast touch order drafting with basket persistence, instant item modifiers, table reservation auto-binding, and bill settlement.
- **Kitchen Staff & Line Cooks**: Touch-friendly high-contrast KDS, dual-mode hardware bump bar integration (physical USB HID + Virtual KB9000 popup), Station routing, and synthesized audio cues.
- **Floor Managers & Hosts**: Live table map with drag/grouping awareness, walk-in waitlist with SMS notification triggers, and instant 86'd inventory toggling.
- **Brand & Franchise Admins**: Enterprise multi-location governance, granular role-permission visibility, and speed/volume analytics.

---

## 3. Anticipatory & "Smart" UX Principles

1. **Contextual Order Creation**:
   - Navigating to `/orders/new?tableId=X` immediately pre-selects the table, sets order type to `DineIn`, estimates guest count based on table capacity, and pulls active table draft if one exists.
   - Menu item picker sorts by item popularity/shift context (e.g. lunch vs dinner) and filters out 86'd / unavailable items automatically.
2. **Kiosk & Environment Awareness**:
   - KDS views feature Screen WakeLock API integration to prevent kitchen display timeouts.
   - High-contrast visual timers with progressive urgency (Green `< 80% prepTime`, Amber `80%–100%`, Pulsing Induction Flame `> 100%`).
3. **Resilient Real-time Sync**:
   - Non-intrusive reconnection banners when SignalR drops; automatic queue replay upon reconnection.
   - Optimistic UI transitions with rollback on command conflict (e.g., ticket already bumped by peer station).

---

## 4. Master Development Phases

### Phase 0: API Gateway & RTK Query Alignment
**Goal**: Correct all endpoint URL mismatches and construct standard client contracts across backend microservices before assembling UI views.
**Child Plan**: [`api-gateway-and-rtk-query-alignment.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/.agents/plans/api-gateway-and-rtk-query-alignment.md)
**Target Areas**: `src/app/api/orders.ts`, `kitchen.ts`, `basket.ts`, `catalog.ts`, `src/test/handlers/*`.
**Deliverables**:
- [ ] Fix Ordering API routes: Map to `${env.apiBaseUrl}/ordering-api/v1/orders`.
- [ ] Fix Kitchen API routes: Map to `${env.apiBaseUrl}/kitchen-api/v1/kitchen/queue` and command paths (`/accept`, `/bump`, `/recall`, `/mark-ready`).
- [ ] Implement `basketApi` slice: **⚠️ Highest effort** — net-new file. Support token-bound `GET /basket-api/v1/cart`, `PUT /basket-api/v1/cart`, `DELETE /basket-api/v1/cart`, `POST /basket-api/v1/cart/checkout` with `Idempotency-Key` header and ETag caching.
- [ ] Standardize Catalog API routes: Align Tables (`/catalog-api/v1/restaurants/{id}/tables`), Reservations, and Menu item availability endpoints. Add `mergeTables` / `splitTables` mutations (backend endpoints already exist in `Catalog.API`).
- [ ] Align MSW test handlers for all aligned routes.
- [ ] Create shared `src/hooks/useElapsedTimer.ts` — shared elapsed time hook for KDS timers (Phase 2) and waitlist timers (Phase 3).
- [ ] Add zone-level React Error Boundaries to `AdminZoneLayout`, `KitchenZoneLayout`, `RestaurantZoneLayout`.
- [ ] Add shared loading skeletons to `src/components/ui/`: `DataTableSkeleton`, `KpiCardSkeleton`, `TicketCardSkeleton`.
**Exit Criteria**: `pnpm test:run` passes with zero unhandled MSW route warnings.

---

### Phase 1: Restaurant Operations — Orders & Basket Module
**Goal**: Complete the transactional order intake, cart staging, order inspection, and payment settlement workflows.
**Target Zone**: `/site/restaurant/orders/*`
**Parent Architecture & Gaps Addressed**:
- Employs `Basket.API` for order composition and coupon discounts before converting to confirmed `Ordering.API` orders.
- Solves missing backend `SplitBill` Carter endpoint by implementing client-side bill calculation and sequential bill settlement.
**Deliverables**:
- [ ] **Order List (`/site/restaurant/orders`)**:
  - Live order queue with multi-filter bar (Status chips, Order Type, Table #, Date range).
  - 5-stop service hue status badges (`New` Blue → `Confirmed` Cyan → `Preparing` Teal → `Plating` Amber → `Ready` Induction Flame).
  - Chronological search and pagination.
- [ ] **Smart Order Creator (`/site/restaurant/orders/new`)**:
  - Auto-binding of Table ID and guest defaults from floor plan routing.
  - Category-based catalog item selector with quick modifiers and item-specific notes.
  - Cart sidebar powered by `basketApi` with running discount deductions.
  - Submission triggers atomic checkout with client-generated UUID v4 `Idempotency-Key`.
- [ ] **Order Detail & Timeline (`/site/restaurant/orders/:id`)**:
  - Order header with monetary breakdown, seat numbers, and customer metadata.
  - Chronological activity timeline powered by `order_activities` feed (stamped with correlation IDs).
  - Modification workflow: add/cancel items based on status gating (`Pending`/`Confirmed`).
- [ ] **Bill Splitting & Settlement (`/site/restaurant/orders/:id/split-bill`)**:
  - Interactive multi-payer assignment (Equal split vs Custom by item/seat).
  - Real-time balance check (sum of splits equals total amount).
  - Payment settlement simulation (Cash, Card, Room Charge) with receipt generation.
**Exit Criteria**: Staff can draft a basket, check out into an order, monitor it in real time, view activity history, and split the bill.

---

### Phase 2: Real-Time KDS & Hardware Bump Bar Integration
**Goal**: Construct the touch-optimized Kitchen Display System with live SignalR streaming, station filtering, and dual-mode bump bar support.
**Target Zone**: `/site/kitchen/*`
**Synchronized Plan**: Incorporates [`kds-bump-bar-integration.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/.agents/plans/kds-bump-bar-integration.md).
**Deliverables**:
- [ ] **KDS Live Board (`/site/kitchen`)**:
  - Kanban ticket grid grouped by status (`New`, `Preparing`, `Ready`).
  - SignalR hub listener on `${VITE_SIGNALR_URL}/hubs/kitchen`: handles `OrderReceived`, `ItemStateChanged`, `OrderReady`, `OrderBumped`, `OrderCancelled`.
  - Monospace elapsed timers with progressive urgency styling (alert pulsing > prep target).
  - Full-screen Kiosk mode with Screen WakeLock API toggle.
- [ ] **Dual-Channel Bump Bar Engine**:
  - Physical USB HID keyboard listener (`useBumpBar`) supporting KB9000 scan codes.
  - Standalone Virtual Bump Bar window (`/site/kitchen/virtual-bumpbar`) communicating via `BroadcastChannel("orderly-kds-bumpbar")`.
  - Visual hotkey slot badges (`#1` through `#8`) and keyboard navigation.
- [ ] **Audio Feedback Engine**:
  - Web Audio API synthesizer generating low-latency (<5ms) synthesized chimes and error tones.
- [ ] **Ticket Detail & Station Config (`/site/kitchen/settings`)**:
  - Station routing (Grill, Salad, Fryer, Expedite).
  - Hardware calibration and bump bar profile selector (KB9000 vs Numpad).
**Exit Criteria**: Orders placed in Restaurant zone appear on KDS in real time without refresh and can be bumped via physical keyboard or virtual bump bar popup.

---

### Phase 3: Catalog, Floor Plan, Reservations & Walk-In Queue
**Goal**: Provide operational floor management, dining room seating, waitlist orchestration, and 86'd inventory controls.
**Target Zone**: `/site/restaurant/menu`, `/tables`, `/reservations`, `/queue`
**Deliverables**:
- [ ] **Menu Availability Manager (`/site/restaurant/menu`)**:
  - Catalog browser by Category and Sub-category.
  - 86'd Out-of-Stock instant toggle (invalidates menu cache across terminals).
  - Temporary price modifier and ingredient substitution indicator.
- [ ] **Interactive Dining Floor Plan (`/site/restaurant/tables`)**:
  - Visual table layout grid reflecting Table position (X/Y), capacity, and shape.
  - Table state indicators: `Available`, `Occupied`, `Reserved`, `Needs Cleaning`.
  - Merged tables support (`MergedTables` cluster visualization).
  - Quick actions: One-tap party seating, click-through to active order, or "New Order" shortcut.
- [ ] **Walk-In Queue & Reservations (`/site/restaurant/queue`, `/reservations`)**:
  - Live waitlist with party size, quoted wait time, and notification status.
  - Reservation calendar with check-in, seat, and no-show actions (aligned with Catalog Hangfire background jobs).
**Exit Criteria**: 86'd items immediately disable in the Order Creation menu; seating a party from the floor plan navigates to Order Creation with table pre-selected.

---

### Phase 4: Multi-Brand Admin CRM & Governance
**Goal**: Transition `/site/admin` into a multi-brand, multi-restaurant enterprise governance platform.
**Target Zone**: `/site/admin/*`
**Synchronized Plan**: Incorporates [`admin-crm-zone.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/.agents/plans/admin-crm-zone/admin-crm-zone.md) (v2.2).
**Deliverables**:
- [ ] **Executive Admin Dashboard (`/site/admin`)**:
  - System KPIs: Total Active Locations, Platform Gross Volume, Open Staff Accounts, System Health probes (`/live` & `/ready`).
  - Note: "Platform Gross Volume" KPI depends on analytics endpoints shipped in Phase 5 — stub with a "Coming soon" tile until then.
- [ ] **Brand Management (`/site/admin/brands/*`)**:
  - First-class Brand entity CRUD (Name, Logo URL, Cuisine, Default Currencies).
  - Multi-tab Brand detail: Overview, Associated Restaurants, Assigned Staff, Settings, Audit.
- [ ] **Restaurant Location Governance (`/site/admin/restaurants/*`)**:
  - Location detail: physical address, operating hours, tax rate, estimated turnover minutes, auto-confirm flags.
- [ ] **Enterprise Staff, Roles & Audit (`/site/admin/roles`, `/audit`)**:
  - Roles × Permissions matrix viewer (displaying 25 seeded permissions).
  - Generic `<EntityAuditLog>` component powering Brand, Restaurant, and Staff audit trails.
- [ ] **Notification Bell (`/site/admin` header)**:
  - Wire the existing `src/app/api/notifications.ts` slice to the header notification dropdown. This slice is currently orphaned — this is the phase that gives it a UI owner.
**Exit Criteria**: SuperAdmin can create a new brand and restaurant location, configure operational settings, and inspect security audit trails.

---

### Phase 5: Operational Analytics, Customer Feedback & Production Hardening
**Goal**: Deliver data intelligence for restaurant managers and complete end-to-end quality validation.
**Target Zone**: `/site/restaurant/analytics`, `/feedback`, Cross-cutting E2E
**Deliverables**:
- [ ] **Operations Analytics Dashboard (`/site/restaurant/analytics`)**:
  - Hourly volume distribution (Recharts bar chart).
  - Category sales breakdown (Donut chart).
  - Ticket fulfillment speed & station bottleneck metrics (`OrderTimingAnalytics`).
- [ ] **Customer Feedback & Reward Portal (`/site/restaurant/feedback`)**:
  - Feedback rating stream (1–5 stars) with comments.
  - Auto-generated reward code tracking (Discount Service integration).
- [ ] **Production Quality Hardening**:
  - Automated Playwright E2E suite covering:
    1. Waiter creates order on table.
    2. Real-time ticket pops on KDS.
    3. Cook bumps ticket using virtual bump bar.
    4. Waiter settles split bill.
  - Automated axe-core accessibility audit across all modules (&ge; 95% pass).
  - Lighthouse performance audit on desktop and tablet viewport presets.
**Exit Criteria**: Full Playwright test suite passes against Dockerized backend services in both English and Spanish.

---

## 5. Security & Multi-Tenancy Guardrails

> [!CAUTION]
> Access tokens MUST NEVER be stored in `localStorage` or `sessionStorage`. They exist exclusively in Redux in-memory state. Refresh tokens ride exclusively on secure `httpOnly` cookies.

| Risk | Architecture Constraint |
|:---|:---|
| Cross-Tenant Data Leak | Every API call must supply or validate `restaurantId` matching the active tenant context. |
| Cart Spoofing | Body `UserId`/`RestaurantId` must be empty on client PUT to `/basket-api/v1/cart`; the endpoint enforces server JWT identity. |
| Double Checkout | `POST /basket-api/v1/cart/checkout` enforces an IETF UUID v4 `Idempotency-Key` header with 24h Redis TTL. |
| Open Redirect | All `returnTo` parameters must pass through `safeReturnPath()` before executing navigation. |
| Privilege Escalation | Leaf actions check fine-grained `usePermission()` in addition to zone-level `RequireRole`. |

---

## 6. Technical Considerations & Failure Modes

1. **SignalR Disconnect Handling**:
   - The KDS must render an unobtrusive amber warning banner when the WebSocket enters `Reconnecting` state.
   - Upon `Reconnected`, it must immediately dispatch a fresh `getKitchenQueue` query to avoid missing ticket events emitted during the outage.
2. **Optimistic Ticket Bumping**:
   - Ticket bump actions visually remove/advance the card immediately. If the API returns a 409 (e.g. ticket already cancelled or bumped by another line cook), the card rolls back with an explanatory Sonner warning.
3. **Multi-Tenant Context Switch**:
   - Changing the active restaurant in the top bar switcher resets local state, clears cart drafts, and invalidates all RTK Query tags scoped to `LIST-${oldRestaurantId}`.

---

## Changelog

### v1.2 (2026-10-17) — Gap Analysis Incorporation
- Added Phase 0 child plan link (`api-gateway-and-rtk-query-alignment.md`).
- Added parallel execution note: Phases 1–4 can run concurrently after Phase 0 exits.
- Expanded Phase 0 deliverables: `basketApi` flagged as highest effort, `mergeTables`/`splitTables` mutations added, shared primitives (`useElapsedTimer`, error boundaries, skeletons) added.
- Phase 4: Added notification bell ownership, admin dashboard KPI cross-dependency note, bumped synchronized plan version to v2.2.
- Cross-cutting: Clarified discount resolution is server-side; no `discountApi` slice needed.

### v1.1 (2026-10-16) — Architectural Restructuring & Child Plan Sync
- Added explicit `Basket.API` integration to Phase 1 (cart persistence, gRPC discount resolution, outbox checkout).
- Formally integrated existing specialized plans: [`kds-bump-bar-integration.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/.agents/plans/kds-bump-bar-integration.md) (Virtual Bump Bar & Web Audio) into Phase 2, and [`admin-crm-zone.md`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/.agents/plans/admin-crm-zone/admin-crm-zone.md) (Brands CRM & Generic Audit) into Phase 4.
- Incorporated smart anticipatory UX requirements (table context propagation, wake lock kiosk mode, progressive timer styling).
- Clarified client-side bill splitting strategy given lack of a dedicated Carter endpoint in `Ordering.API`.
- Updated microservice port and feature map against `current-architecture.md`.

### v1.0 (2026-10-16) — Initial Master Roadmap
- Initial creation of the 6-phase master roadmap based on `_template.md`.
