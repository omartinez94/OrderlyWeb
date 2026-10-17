# API Gateway & RTK Query Alignment — Implementation Plan

> Scope: Align all OrderlyWeb RTK Query slices and MSW test handlers with YARP Gateway route transforms and .NET 10 Carter Minimal API endpoints across Ordering, Kitchen, Basket, and Catalog services.

---

## Status

> **Plan version**: `v1.0` (2026-10-16) — Initial Phase 0 plan derived from `master-web-development-plan.md`.
> **Current state**: ⏸ Ready for kickoff.

| Phase | Name | Target Deliverables | Status |
|:-----:|---|---|:-----:|
| 1 | Ordering API Route & DTO Synchronization | `src/app/api/orders.ts`, `src/types/order.ts` | ⏸ Pending |
| 2 | Kitchen API Route & Endpoint Harmonization | `src/app/api/kitchen.ts`, `src/types/kitchen.ts` | 🔒 Blocked |
| 3 | Basket & Cart Slice Implementation | `src/app/api/basket.ts`, `src/types/basket.ts` | 🔒 Blocked |
| 4 | Catalog API Operations Alignment | `src/app/api/catalog.ts`, Table & Menu routes | 🔒 Blocked |
| 5 | MSW Test Handlers Synchronization & Regression Gates | `src/test/handlers/*`, `src/test/handlers/index.ts` | 🔒 Blocked |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat(api):`, `fix(api):`, `docs(api):`, `test(api):`, `chore(api):`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: On every phase completion, the plan MUST be updated in the same commit group as the phase work.

---

## 0. Skill & Documentation Conventions

### 0.1 Skill Mandate — `markdown-lint` & `add-rtk-query-slice`
- All markdown documentation must strictly conform to standard markdownlint rules (sequential headers, fenced code blocks with language specifiers, no trailing blank lines).
- All RTK Query additions must adhere to the `add-rtk-query-slice` architectural conventions: typed endpoint builders, cache tagging with `LIST-${restaurantId}`, optimistic mutation handling, and typed error responses (`ApiError`).

### 0.2 Code-Quality Guard Rails
- **TypeScript strict mode**: No `any` outside generated DTO shims.
- **Linters and formatters**: Must pass `pnpm lint` (`oxlint`) and `pnpm format:check` (`oxfmt`).
- **Test coverage**: Every aligned slice must have colocated test coverage and pass `pnpm test:run` with zero unhandled MSW request errors.
- **Imports**: Barrel imports mandatory (`from "@/app/store"`, `from "@/types/auth"`).

---

## 1. Context

In `OrderlyMicroservices`, the YARP API Gateway proxies upstream requests through kebab-case route prefixes with prefix stripping:
- `/ordering-api/{**}` → `ordering-cluster` (`Ordering.API:8080`)
- `/kitchen-api/{**}` → `kitchen-cluster` (`Kitchen.API:8080`)
- `/basket-api/{**}` → `basket-cluster` (`Basket.API:8080`)
- `/catalog-api/{**}` → `catalog-cluster` (`Catalog.API:8080`)

All backend microservices register Carter modules with group prefix `/v1`. However, several existing frontend slices in `OrderlyWeb/src/app/api/` were written with obsolete or mismatched paths (e.g., `/order-api/orders` instead of `/ordering-api/v1/orders`, and `/kitchen-api/kds/:restaurantId/queue` instead of `/kitchen-api/v1/kitchen/queue`). Furthermore, `Basket.API` (`/basket-api/v1/cart`) is currently completely missing from the frontend data layer, preventing atomic checkout and discount calculation.

---

## 2. Goal

Harmonize the entire frontend data client layer with the production backend before assembling UI views:
1. **Ordering API**: Update `ordersApi` to `/ordering-api/v1/orders`, supporting full paginated results, status queries, and activity timelines (`order_activities`).
2. **Kitchen API**: Update `kitchenApi` to `/kitchen-api/v1/kitchen/queue` and align mutation routes (`/bump`, `/accept`, `/cancel`, `/recall`).
3. **Basket API** ⚠️ **HIGHEST EFFORT**: Create a dedicated `basketApi` slice (net-new file, not a refactor) supporting token-bound `GET /basket-api/v1/cart`, `PUT /basket-api/v1/cart`, `DELETE /basket-api/v1/cart`, and `POST /basket-api/v1/cart/checkout` with `Idempotency-Key`. Carries the most complex contract: ETag/If-None-Match caching, body field nulling for token-bound identity, and idempotent checkout.
4. **Catalog API**: Validate and update table layout endpoints (`/catalog-api/v1/restaurants/{id}/tables`, `/catalog-api/v1/restaurants/{id}/merged-tables`) and menu availability toggle paths. Add `mergeTables` / `splitTables` RTK mutations (backend endpoints already exist in `Catalog.API`).
5. **MSW Mocks**: Synchronize all test handlers in `src/test/handlers/` so test suites pass without unhandled request warnings.

---

## 3. Out of Scope

- Building UI presentation components (Order forms, KDS cards, Table layouts) — deferred to Phases 1–4.
- SignalR WebSocket hub subscriptions — deferred to Phase 2 (KDS).
- Modifying backend Carter endpoints or database schemas in `OrderlyMicroservices`.

---

## 4. Tech Decisions

| Decision | Choice | Reason |
|:---|:---|:---|
| HTTP Path Schema | `${env.apiBaseUrl}/<service>-api/v1/<resource>` | Exact mirror of YARP Gateway route tables and Carter Minimal API route groups. |
| Basket Client Binding | Token-bound `/basket-api/v1/cart` | Backend Basket service derives `UserId` and `RestaurantId` strictly from JWT claims; prevents cart spoofing. |
| Checkout Idempotency | Client UUID v4 in `Idempotency-Key` header | Enforced by `BasketIdempotencyFilter` in backend; prevents double-billing on network re-tries. |
| Cache Tag Topology | `LIST-${restaurantId}` tag pattern | Ensures tenant switcher in top bar instantly invalidates and refetches data across microservices. |
| Test Mocking | MSW v2 `http.*` handlers | Provides deterministic network interception for Vitest and Playwright without live Docker dependency. |

---

## 5. Folder Layout

```text
OrderlyWeb/src/
├── app/
│   ├── api/
│   │   ├── base.ts                    # dynamicBaseQuery with auth injection & 401 exclusion
│   │   ├── basket.ts                  # NEW: basketApi slice for cart & checkout
│   │   ├── catalog.ts                 # EXTEND: catalogApi with tables & merged tables
│   │   ├── identity.ts                # (existing) identityApi slice
│   │   ├── kitchen.ts                 # REFACTOR: kitchenApi aligned to /kitchen-api/v1/kitchen/queue
│   │   ├── notifications.ts           # (existing) notificationsApi slice
│   │   └── orders.ts                  # REFACTOR: ordersApi aligned to /ordering-api/v1/orders
│   └── store.ts                       # Register basketApi reducer and middleware
├── test/
│   └── handlers/
│       ├── basket.ts                  # NEW: MSW handlers for /basket-api/v1/cart*
│       ├── catalog.ts                 # EXTEND: MSW handlers for tables and menu availability
│       ├── index.ts                   # Export consolidated handlers array
│       ├── kitchen.ts                 # NEW: MSW handlers for /kitchen-api/v1/kitchen/*
│       └── orders.ts                  # REFACTOR: MSW handlers for /ordering-api/v1/orders*
└── types/
    ├── basket.ts                      # NEW: Cart, CartItem, Checkout DTOs
    ├── catalog.ts                     # EXTEND: Table, MergedTable, MenuAvailability DTOs
    ├── kitchen.ts                     # REFACTOR: KitchenTicket, Station, Bump DTOs
    └── order.ts                       # EXTEND: PaginatedOrderResult, OrderActivity DTOs
```

---

## 6. Detailed Specification

### 6.1 Ordering API Synchronization (`src/app/api/orders.ts`)

Endpoints to align:
- `getOrders`: `GET ${env.apiBaseUrl}/ordering-api/v1/orders?page={page}&pageSize={pageSize}`
  - Supports query filters: `status`, `orderType`, `tableId`, `customerId`.
  - Response shape: `PaginatedResult<OrderDto>`.
- `getOrderById`: `GET ${env.apiBaseUrl}/ordering-api/v1/orders/{id}`
  - Response includes `activities: OrderActivityDto[]` (chronological audit feed).
- `getOrderActivities`: `GET ${env.apiBaseUrl}/ordering-api/v1/orders/{id}/activities`
  - Paginated standalone activity log.
- `createOrder`: `POST ${env.apiBaseUrl}/ordering-api/v1/orders`
  - Payload: `{ order: OrderDto }`. Returns: `{ id: string }`.
- `cancelOrder`: `POST ${env.apiBaseUrl}/ordering-api/v1/orders/{id}/cancel`
  - Payload: `{ reason: string }`.
- `confirmOrder`: `POST ${env.apiBaseUrl}/ordering-api/v1/orders/{id}/confirm`
- `startOrderPrep`: `POST ${env.apiBaseUrl}/ordering-api/v1/orders/{id}/start-prep`
- `markOrderReady`: `POST ${env.apiBaseUrl}/ordering-api/v1/orders/{id}/mark-ready`
- `markOrderDelivered`: `POST ${env.apiBaseUrl}/ordering-api/v1/orders/{id}/mark-delivered`

### 6.2 Kitchen API Synchronization (`src/app/api/kitchen.ts`)

Endpoints to align:
- `getKitchenQueue`: `GET ${env.apiBaseUrl}/kitchen-api/v1/kitchen/queue`
  - Requires permission: `kitchen:view_orders`.
  - Tagged with: `{ type: "KitchenQueue", id: "LIST-${restaurantId}" }`.
- `getTicketDetail`: `GET ${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/{id}`
- `acceptOrder`: `POST ${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/{id}/accept`
- `startItemPrep`: `POST ${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/{id}/items/{itemId}/start`
- `markItemReady`: `POST ${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/{id}/items/{itemId}/ready`
- `markTicketReady`: `POST ${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/{id}/mark-ready`
- `bumpOrder`: `POST ${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/{id}/bump`
- `recallOrder`: `POST ${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/{id}/recall`
- `cancelTicket`: `POST ${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/{id}/cancel`
  - Payload: `{ reason: string }`.

### 6.3 Basket API Implementation (`src/app/api/basket.ts`)

New slice communicating with `Basket.API`:
- `getCart`: `GET ${env.apiBaseUrl}/basket-api/v1/cart`
  - Returns current user cart for active tenant. Returns empty cart body if nonexistent (never 404).
  - Handles `ETag` and `If-None-Match` caching headers.
- `updateCart`: `PUT ${env.apiBaseUrl}/basket-api/v1/cart`
  - Upserts cart items, variations, and customizations.
  - Body `userId` and `restaurantId` must be `Guid.Empty` (overwritten by backend JWT claims).
- `clearCart`: `DELETE ${env.apiBaseUrl}/basket-api/v1/cart`
  - Empties active cart.
- `checkoutCart`: `POST ${env.apiBaseUrl}/basket-api/v1/cart/checkout`
  - Enforces `Idempotency-Key` header with client-generated UUID v4.
  - Triggers transactional outbox publish (`BasketCheckoutEvent`).

> [!NOTE]
> **Discount resolution is entirely server-side.** `Discount.Grpc` is called by `Basket.API` internally when the cart is updated. The frontend does NOT call `/discount-api/` directly. Applying a coupon code = `PUT /basket-api/v1/cart` with `couponCode` in the body; the response cart already carries the resolved `discountAmount`. No `discountApi` RTK slice is needed.

### 6.4 Catalog API Operational Routes (`src/app/api/catalog.ts`)

Extensions to existing `catalogApi`:
- `getTables`: `GET ${env.apiBaseUrl}/catalog-api/v1/restaurants/{restaurantId}/tables`
  - Retrieves floor tables with X/Y position, capacity, shape, and status (`Available`, `Occupied`, `Reserved`).
- `getMergedTables`: `GET ${env.apiBaseUrl}/catalog-api/v1/restaurants/{restaurantId}/merged-tables`
  - Retrieves active grouped table clusters.
- `updateMenuItemAvailability`: `PUT ${env.apiBaseUrl}/catalog-api/v1/menu-items/{id}/availability`
  - Instant "86'd" item out-of-stock toggle. Invalidates `Menu` tags.
- `mergeTables`: `POST ${env.apiBaseUrl}/catalog-api/v1/restaurants/{restaurantId}/merged-tables`
  - Payload: `{ parentTableId: string; childTableId: string }`. Returns: `{ id: string }`.
  - Invalidates `Tables` and `MergedTables` tags.
- `splitTables`: `DELETE ${env.apiBaseUrl}/catalog-api/v1/restaurants/{restaurantId}/merged-tables/{mergedTableId}`
  - Dissolves a merged table cluster. Invalidates `Tables` and `MergedTables` tags.

> [!NOTE]
> Both `MergeTables` and `SplitTables` Carter endpoints **already exist** in `Catalog.API`. These are confirmed backend endpoints — this is a frontend slice addition only.

---

## 7. Development Phases & Verification Checklist

### Phase 1: Ordering API Route & DTO Synchronization
- [ ] Refactor `src/app/api/orders.ts` to consume `/ordering-api/v1/orders`.
- [ ] Add `OrderActivityDto` and timeline query endpoints.
- [ ] Update `src/types/order.ts` with complete backend contract mirrors.
- [ ] Verification: `pnpm typecheck` passes with zero ordering DTO errors.

### Phase 2: Kitchen API Route & Endpoint Harmonization
- [ ] Refactor `src/app/api/kitchen.ts` to `/kitchen-api/v1/kitchen/queue`.
- [ ] Implement all 7 Carter kitchen lifecycle mutation endpoints (`accept`, `bump`, `recall`, `mark-ready`, etc.).
- [ ] Update `src/types/kitchen.ts`.
- [ ] Verification: `pnpm typecheck` passes with zero kitchen DTO errors.

### Phase 3: Basket & Cart Slice Implementation
- [ ] Create `src/types/basket.ts` mirroring `Basket.API` contracts.
- [ ] Create `src/app/api/basket.ts` with `getCart`, `updateCart`, `clearCart`, `checkoutCart`.
- [ ] Register `basketApi` in `src/app/store.ts`.
- [ ] Verification: Unit tests in `src/app/api/basket.test.ts` pass.

### Phase 4: Catalog API Operations Alignment
- [ ] Extend `src/app/api/catalog.ts` with tables, merged tables, and menu availability endpoints.
- [ ] Update `src/types/catalog.ts`.
- [ ] Verification: `pnpm typecheck` passes with updated table models.

### Phase 5: MSW Test Handlers Synchronization, Shared Primitives & Regression Gates
- [ ] Create `src/test/handlers/kitchen.ts` and `src/test/handlers/basket.ts`.
- [ ] Update `src/test/handlers/orders.ts` to `/ordering-api/v1/orders`.
- [ ] Update `src/test/handlers/index.ts` to export all new handlers.
- [ ] Create shared `src/hooks/useElapsedTimer.ts` — elapsed time hook used by both Phase 2 (KDS timers) and Phase 3 (waitlist timers). Build once here to prevent duplication.
- [ ] Add zone-level React Error Boundaries in `AdminZoneLayout`, `KitchenZoneLayout`, and `RestaurantZoneLayout` — catches render errors without blanking the entire app.
- [ ] Add `<DataTableSkeleton />`, `<KpiCardSkeleton />`, and `<TicketCardSkeleton />` to `src/components/ui/` — shared loading placeholders used across all feature zones.
- [ ] Verification: `pnpm test:run` passes with zero unhandled network call warnings.
- [ ] Run full gate: `pnpm ui:check` (typecheck + lint + test).

---

## Changelog

### v1.1 (2026-10-17) — Gap Analysis Incorporation
- Flagged `basket.ts` as highest-effort deliverable (net-new, complex contract).
- Clarified discount resolution is server-side only — no `discountApi` slice needed.
- Added `mergeTables` / `splitTables` mutations to Catalog API section (backend endpoints confirmed present).
- Added shared primitives: `useElapsedTimer`, zone error boundaries, skeleton components.

### v1.0 (2026-10-16) — Initial Phase 0 Plan
- Formalized API Gateway and RTK Query alignment plan based on `_template.md`.
- Mapped all Carter endpoints from `Ordering.API`, `Kitchen.API`, `Basket.API`, and `Catalog.API`.
- Defined MSW synchronization and idempotency header requirements.
