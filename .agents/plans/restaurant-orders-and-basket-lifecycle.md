# Restaurant Operations: Orders & Basket Lifecycle — Implementation Plan

> Scope: Deliver complete end-to-end transactional workflows for the Order Operations module in OrderlyWeb (`/site/restaurant/orders/*`), covering live order monitoring, smart cart drafting via Basket.API, order creation, chronological activity timeline, and bill splitting/settlement.

---

## Status

> **Plan version**: `v1.0` (2026-10-16) — Initial Phase 1 plan derived from `master-web-development-plan.md`.
> **Current state**: ⏸ Ready for kickoff (depends on Phase 0 API alignment).

| Phase | Name | Target Deliverables | Status |
|:-----:|---|---|:-----:|
| 1 | Order List View & Multi-Filter Query Engine | `/site/restaurant/orders`, `OrderListTable`, filter chips | ✅ Done |
| 2 | Smart Order & Basket Creator | `/site/restaurant/orders/new`, catalog picker, cart sidebar | ⏸ Pending |
| 3 | Order Detail View & Chronological Activity Feed | `/site/restaurant/orders/:id`, `OrderTimeline`, item actions | 🔒 Blocked |
| 4 | Order Modification & Item Cancellation Workflows | Status gating, item removal, manager approval dialog | 🔒 Blocked |
| 5 | Interactive Bill Splitting & Settlement Simulation | `/site/restaurant/orders/:id/split-bill`, receipt modal | 🔒 Blocked |
| 6 | Bilingual Verification & Visual Regression Sweeps | en/es i18n keys, `pnpm test`, jest-axe audit | 🔒 Blocked |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat(orders):`, `fix(orders):`, `docs(orders):`, `test(orders):`, `chore(orders):`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: On every phase completion, the plan MUST be updated in the same commit group as the phase work.

---

## 0. Skill & Documentation Conventions

### 0.1 Skill Mandate — `impeccable`, `markdown-lint`, `shadcn-ui`
- All screens and forms must adhere to "The Stainless Line" design system in `OrderlyWeb/DESIGN.md`:
  - 5-stop service hue gradient strictly for ticket status badges (`New` Blue → `Confirmed` Cyan → `Preparing` Teal → `Plating` Amber → `Ready` Induction Flame).
  - Induction Flame Orange (`#EA580C`) strictly reserved for urgency and hot CTAs (≤10% of any screen).
  - Typography: `MuseoModerno` for headlines/titles, `Urbanist` for body/descriptions, System monospace for order numbers, timestamps, and amounts.
- All markdown documentation must strictly conform to `markdown-lint` rules (sequential headers, blank line buffers, language specifiers on fences).

### 0.2 Code-Quality Guard Rails
- **TypeScript strict mode**: No `any` outside generated DTO shims.
- **Styling**: TailwindCSS 4 utility-first + design tokens in `src/index.css`. No inline `style={{}}` on JSX unless dynamic.
- **Components**: Primitives MUST come from `src/components/ui/` (Radix UI / shadcn path).
- **Icons**: Named exports from `lucide-react` only. No emojis, no hand-rolled SVGs.
- **Toasts**: Sonner notifications exclusively (`import { toast } from "@/components/ui/sonner"`).
- **Currency & Dates**: Always `formatCurrency` (`src/utils/currency.ts`) and `date-fns` wrappers (`src/utils/date.ts`).
- **Minimum viewport**: All restaurant zone screens must be fully functional at **768px width** (10" tablet portrait). The two-column POS layout (menu + cart sidebar) collapses to a single column with a sticky cart drawer at ≤768px.
- **`useElapsedTimer`**: Import from `src/hooks/useElapsedTimer.ts` (created in Phase 0 exit). Do NOT create a local copy.

---

## 1. Context

Waiters, Cashiers, and Floor Managers spend their entire shift managing the lifecycle of orders:
1. Taking the customer's order and tailoring item variations (sizes, cooking temps, dietary modifications).
2. Monitoring kitchen fulfillment progress across stations.
3. Handling customer change requests (adding side dishes, voiding mistaken items).
4. Splitting and settling the bill across multiple guests at the table.

Today, `/site/restaurant/orders` and all its child routes render static `<ZoneSplash />` placeholders. The underlying microservice architecture is ready: `Ordering.API` models the Clean Architecture `Order` aggregate with outbox transitions and activity timelines (`order_activities`), while `Basket.API` handles multi-tenant shopping cart persistence with coupon resolution against `Discount.Grpc`.

---

## 2. Goal

Build an anticipatory, high-speed transactional Order Operations module in OrderlyWeb:
- **Order Queue**: High-density table with instant search, pagination, order type badges, and real-time status progression.
- **Smart Order Creation**: Fast catalog picker with table pre-selection, live cart calculation via `Basket.API`, and atomic checkout.
- **Order Detail & Audit**: Comprehensive ticket inspection with item-level prep states and an append-only timeline feed.
- **Order Modifications**: Status-gated item modifications with role-permission checks (`orders:modify_ordering`, `orders:modify_confirmed`).
- **Bill Splitting**: Visual seat and item allocation supporting both equal and custom splits with cash/card settlement simulation.

---

## 3. Out of Scope

- Customer-facing public delivery storefront (internal staff POS only).
- Direct ESC/POS hardware printer integration (browser print dialog / PDF receipt output used).
- Physical credit card EMV terminal drivers (mock payment settlement simulator used).
- Real-time kitchen ticket bumping (handled by KDS in Phase 2).

---

## 4. Tech Decisions

| Decision | Choice | Reason |
|:---|:---|:---|
| Cart State Persistence | `Basket.API` (`/basket-api/v1/cart`) | Survives accidental tablet browser refreshes; leverages server-side gRPC discount calculation and inventory validation. |
| Checkout Idempotency | Client UUID v4 in `Idempotency-Key` header | Enforced by `BasketIdempotencyFilter`; guarantees atomic order creation without duplicate charges. |
| Bill Splitting Architecture | Client-side split calculation + multi-bill settlement | `Ordering.API` schema carries `OrderBill` but lacks a dedicated Carter split endpoint; frontend orchestrates split math and writes settlements. |
| Anticipatory Defaults | URL query propagation (`?tableId=X&guestCount=Y`) | Seating a party from the floor plan instantly drafts the correct order type and pre-allocates table capacity. |
| Form Management | `react-hook-form` + `zod` | High performance uncontrolled inputs with instant validation feedback for fast order intake. |

---

## 5. Folder Layout

```text
OrderlyWeb/src/
├── features/orders/
│   ├── components/
│   │   ├── OrderListTable.tsx         # High-density data table with sortable columns
│   │   ├── OrderStatusBadge.tsx       # 5-stop service hue status badge
│   │   ├── OrderFilterBar.tsx         # Multi-select status chips, order type, date filters
│   │   ├── CatalogItemPicker.tsx      # Category-based menu grid with item cards
│   │   ├── CartSidebar.tsx            # Live cart preview with running total and coupon input
│   │   ├── ItemModifierModal.tsx      # Modal for item variations, toppings, and notes
│   │   ├── OrderTimeline.tsx          # Chronological feed powered by order_activities
│   │   ├── OrderActionToolbar.tsx     # Role-gated actions (Confirm, Start Prep, Cancel)
│   │   ├── SplitBillAssignment.tsx    # Drag-and-drop or checklist item assignment per payer
│   │   └── ReceiptModal.tsx           # Printable thermal-style receipt preview
│   ├── hooks/
│   │   ├── useOrderFilters.ts         # URL-synced search and filter state
│   │   ├── useOrderDraft.ts           # Interacts with basketApi for drafting and checkout
│   │   ├── useCheckoutPoller.ts       # Polls for order creation after outbox checkout (10s max)
│   │   └── useSplitBill.ts            # Mathematical split balancing and payment state
│   └── types/
│       └── split.ts                   # PayerAssignment, BillSplitCalculation contracts
├── locales/
│   ├── en/orders.json                 # English translations
│   └── es/orders.json                 # Spanish translations
└── routes/site/restaurant/
    ├── OrderListPage.tsx              # /site/restaurant/orders
    ├── OrderCreatePage.tsx            # /site/restaurant/orders/new
    ├── OrderDetailPage.tsx            # /site/restaurant/orders/:id
    └── OrderSplitBillPage.tsx         # /site/restaurant/orders/:id/split-bill
```

---

## 6. Detailed Specification

### 6.1 Order List & Filtering (`/site/restaurant/orders`)

- **Telemetry & Density**: High-density table displaying:
  - Order # (`system-mono font-bold`)
  - Order Type (`DineIn`, `Takeout`, `Delivery`) with distinct icons (`UtensilsCrossed`, `ShoppingBag`, `Bike`)
  - Table # / Customer Name
  - Status Badge (5-stop service hue: Cold Blue → Cyan → Teal → Amber → Induction Flame)
  - Items summary (e.g. "3 items: 2x Burger, 1x Fries")
  - Elapsed Time / Placed At (`date-fns` relative format)
  - Total Amount (`formatCurrency`)
- **Filter Bar**:
  - Multi-select status pill chips (`All`, `New`, `Confirmed`, `Preparing`, `Ready`, `Delivered`, `Cancelled`).
  - Order type toggle group.
  - Search input with debounce (searches Order Number or Customer Name).
  - Pagination controls (15, 30, 50 rows per page).

### 6.2 Smart Order Creation & Basket Staging (`/site/restaurant/orders/new`)

- **Context Auto-Detection**:
  - Inspects URL query params `?tableId=...&orderType=...`. If present, locks table assignment and pre-fills party size.
- **Two-Column Touch POS Layout**:
  - **Left (Menu Catalog)**:
    - Sticky category horizontal carousel (Starters, Mains, Desserts, Beverages).
    - Responsive card grid with high-resolution imagery, base price, and availability badge (disabled if 86'd).
    - Tapping an item opens `ItemModifierModal` if item has variations/customizations, or directly increments cart.
  - **Right (Cart Sidebar)**:
    - Persistent draft backed by `basketApi` (`PUT /basket-api/v1/cart`).
    - Quantity steppers (`+` / `-`), modification summary text, and item removal button.
    - Discount code input with instant gRPC validation feedback.
    - Financial breakdown: Subtotal, Tax Rate (per restaurant configuration), Discounts, and Grand Total.
    - Primary CTA: **"Send to Kitchen"** (`Induction Flame Orange`, generates UUID v4 `Idempotency-Key` and executes checkout).
  - **Outbox Confirmation Polling**: After `checkoutCart` returns 200, the cart is cleared but no Order ID is available yet (it's created asynchronously via the outbox). The UI must poll `GET /ordering-api/v1/orders?page=1&pageSize=1&status=pending` (with the `Idempotency-Key` as a correlation hint) for up to 10 seconds, showing an animated "Sending to Kitchen…" state. On success: navigate to `/site/restaurant/orders/:id`. On timeout after 10s: show a Sonner warning toast (`t("orders:checkout.delayedWarning")`) and navigate to the orders list — the order will appear momentarily.

### 6.3 Order Detail & Chronological Activity Feed (`/site/restaurant/orders/:id`)

- **Header Card**:
  - Order token, status badge, created by staff name, table / delivery destination.
  - Time tracking: Placed At, Confirmed At, Ready At, Delivered At.
- **Item Breakdown**:
  - Item list displaying individual item prep statuses (`Pending`, `Preparing`, `Ready`).
  - Seat number indicators (e.g. "Seat 1", "Seat 2").
  - Special kitchen notes (highlighted with amber alert styling).
- **Chronological Activity Timeline (`order_activities`)**:
  - Visual vertical step timeline showing every lifecycle event.
  - Stamps actor user, precise timestamp, state delta, and correlation ID for tracing.

### 6.4 Order Modification & Cancellation Workflows

- **Role & Status Gating**:
  - If status is `Ordering` or `Pending`: Staff can add or remove items directly.
  - If status is `Confirmed` or `Preparing`: Modifying or cancelling requires Manager confirmation (`orders:modify_confirmed`).
  - If status is `Ready` or `Delivered`: Item cancellations are locked; requires void reason dialog.
- **Cancel Dialog**:
  - Mandatory cancellation reason dropdown (`Customer Request`, `Kitchen Out of Stock`, `Accidental Duplicate`, `Other`) with notes.
  - Dispatches `POST /ordering-api/v1/orders/{id}/cancel`.

### 6.5 Bill Splitting & Settlement (`/site/restaurant/orders/:id/split-bill`)

- **Split Modes**:
  1. **Equal Split**: Operator selects number of ways (2 to 10). System automatically splits subtotal, tax, and total evenly, balancing rounding cents on the final bill.
  2. **Custom / By Seat Split**: Operator adds N payer columns and checks off items assigned to each payer. Unassigned items prompt warning banner.
- **Validation Balance Engine**:
  - Sum of payer bills must strictly match Order total amount (&plusmn;0.00). Discrepancies block settlement buttons.
- **Settlement Dialog**:
  - Per-bill payment method selection: `Cash`, `Credit Card`, `Debit`, `Room Charge`.
  - Cash payment includes quick tender calculator (suggested bills: $20, $50, $100) and change due readout.
  - Mark Paid triggers thermal receipt preview modal with print shortcut (`Cmd+P` / `Ctrl+P`).

---

## 7. Development Phases & Verification Checklist

### Phase 1: Order List View & Multi-Filter Query Engine
- [x] Implement `OrderListTable.tsx` and `OrderStatusBadge.tsx` with 5-stop service hues.
- [x] Implement `OrderFilterBar.tsx` and URL query hook `useOrderFilters.ts`.
- [x] Mount in `src/routes/site/restaurant/OrderListPage.tsx` replacing `ZoneSplash`.
- [x] Verification: `pnpm test:run src/features/orders/components/OrderListTable.test.tsx` passes.

### Phase 2: Smart Order & Basket Creator
- [ ] Build `CatalogItemPicker.tsx` and `ItemModifierModal.tsx`.
- [ ] Build `CartSidebar.tsx` wired to `useOrderDraft` hook and `basketApi`.
- [ ] Implement `useCheckoutPoller.ts` — polls for order after outbox checkout; shows animated pending state; navigates on success or shows delayed-warning toast on 10s timeout.
- [ ] Support URL query pre-population (`tableId`, `orderType`).
- [ ] Mount in `src/routes/site/restaurant/OrderCreatePage.tsx`.
- [ ] Verification: Order creation fires `checkoutCart` with `Idempotency-Key` header AND poller correctly transitions to order detail on success.

### Phase 3: Order Detail View & Chronological Activity Feed
- [ ] Build `OrderDetailPage.tsx` with header metadata and item prep status indicators.
- [ ] Implement `OrderTimeline.tsx` consuming `order.activities` array.
- [ ] Add item status tags and seat allocation readouts.
- [ ] Verification: Unit tests verify chronological activity rendering in stable order.

### Phase 4: Order Modification & Item Cancellation Workflows
- [ ] Implement `OrderActionToolbar.tsx` with role-permission predicates.
- [ ] Add `CancelOrderDialog.tsx` with mandatory reason validation.
- [ ] Add item removal/modification flow with manager override gate.
- [ ] Verification: 409 transition errors properly catch and surface Sonner error toasts.

### Phase 5: Interactive Bill Splitting & Settlement Simulation
- [ ] Implement `SplitBillAssignment.tsx` supporting Equal and Custom splits.
- [ ] Implement `useSplitBill.ts` with cent-balanced rounding logic.
- [ ] Implement `ReceiptModal.tsx` with clean print styling.
- [ ] Mount in `src/routes/site/restaurant/OrderSplitBillPage.tsx`.
- [ ] Verification: Unit test verifies that sum of split amounts equals total order amount.

### Phase 6: Bilingual Verification & Visual Regression Sweeps
- [ ] Populate all order translation keys in `src/locales/en/orders.json` and `es/orders.json`.
- [ ] Run automated axe-core accessibility audit on all four order routes.
- [ ] Execute `pnpm ui:check` (typecheck + lint + unit tests).

---

## Changelog

### v1.1 (2026-10-17) — Gap Analysis Incorporation
- Added outbox confirmation polling UX: animated pending state, 10s timeout, delayed-warning toast.
- Added `useCheckoutPoller.ts` hook to folder layout and Phase 2 checklist.
- Added 768px minimum tablet viewport constraint and collapsed POS layout rule.
- Added `useElapsedTimer` import-from-shared directive.

### v1.0 (2026-10-16) — Initial Phase 1 Plan
- Formalized Orders & Basket Lifecycle plan following `_template.md`.
- Specified smart POS order drafting via `Basket.API`, timeline activity feeds, and client-side bill splitting.
- Enforced "The Stainless Line" industrial design guidelines and bilingual requirement.
