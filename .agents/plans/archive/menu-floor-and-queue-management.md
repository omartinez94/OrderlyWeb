# Menu, Floor Plan & Queue Management — Implementation Plan

> Scope: Deliver operational dining room floor management, visual table maps (supporting merged table clusters), 86'd inventory menu toggles, walk-in waitlist queue, and reservation check-ins for OrderlyWeb (`/site/restaurant/menu`, `/tables`, `/reservations`, `/queue`).

---

## Status

> **Plan version**: `v1.2` (2026-10-18) — Completed Phase 3 execution across all 6 subphases.
> **Current state**: ✅ All 6 sub-phases completed, tested, and verified.

| Phase | Name | Target Deliverables | Status |
|:-----:|---|---|:-----:|
| 1 | Menu Catalog & Instant 86'd Inventory Management | `/site/restaurant/menu`, availability toggle, category tabs | ✅ Done |
| 2 | Interactive Dining Floor Plan & Table Grid | `/site/restaurant/tables`, X/Y spatial grid, status indicators | ✅ Done |
| 3 | Table Clustering & Merged Tables Operations | Merged table parent-child associations, cluster cards | ✅ Done |
| 4 | Walk-In Queue & Guest Waitlist Management | `/site/restaurant/queue`, SMS notification triggers | ✅ Done |
| 5 | Reservation Calendar & Seating Coordination | `/site/restaurant/reservations`, check-in, no-show actions | ✅ Done |
| 6 | Bilingual Verification & Visual Regression Sweeps | en/es i18n keys, `pnpm test`, jest-axe audit | ✅ Done |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat(floor):`, `fix(floor):`, `docs(floor):`, `test(floor):`, `chore(floor):`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: On every phase completion, the plan MUST be updated in the same commit group as the phase work.

---

## 0. Skill & Documentation Conventions

### 0.1 Skill Mandate — `impeccable`, `markdown-lint`, `shadcn-ui`
- Visual styling must adhere to "The Stainless Line" design system in `OrderlyWeb/DESIGN.md`:
  - Table statuses: `Available` (Emerald Green `#059669`), `Occupied` (Cold Station Blue `#1D4ED8`), `Reserved` (Range Amber `#D97706`), `Needs Cleaning` (Muted Slate `#475569`).
  - Chamfered controls (6px) and structured table cards (8px).
  - Telemetry: Monospace font for table tokens, party sizes, and wait timers.
- Markdown documentation must strictly conform to `markdown-lint` rules.

### 0.2 Code-Quality Guard Rails
- **TypeScript strict mode**: No `any` outside generated DTO shims.
- **Styling**: TailwindCSS 4 utility-first + design tokens in `src/index.css`. No inline `style={{}}` on JSX unless purely dynamic (e.g. table coordinate positioning).
- **Components**: Primitives MUST come from `src/components/ui/`.
- **Localization**: All copy MUST go through `react-i18next` with typed keys in both `en` and `es` dictionaries under the `restaurant` namespace.
- **Minimum viewport**: All floor plan and queue screens must be fully functional at **768px width** (10" tablet portrait). The floor plan grid must scale to fit without horizontal scroll at this breakpoint.
- **`useElapsedTimer`**: Import from `src/hooks/useElapsedTimer.ts` (shared hook created in Phase 0 exit). Do NOT define a local copy.
- **Merged Table mutations**: `mergeTables` and `splitTables` RTK mutations are defined in `src/app/api/catalog.ts` (added in Phase 0). Phase 3 sub-phase 3 depends on these being available.

---

## 1. Context

Restaurant Floor Managers and Hosts direct the dining room:
1. They monitor table turnover and seat parties quickly.
2. They merge physical tables when large parties arrive.
3. They manage the walk-in waitlist during peak rush hours and check in reservations.
4. They coordinate with the kitchen by "86-ing" (marking out of stock) menu items when ingredients run out.

In the backend, `Catalog.API` already models all of these entities in relational Postgres storage:
- `Table` carries spatial coordinates (`PositionX`, `PositionY`), `Capacity`, `Shape` (Round, Square, Booth), and `Status`.
- `MergedTable` links parent-child tables.
- `Reservation` and `WalkInQueue` maintain wait times, party sizes, and lifecycle status (coordinated by Hangfire background jobs).
- `MenuItem` supports real-time availability updates via the Ingredient Availability Engine.

---

## 2. Goal

Build an integrated dining floor and menu availability suite:
- **Menu Availability Manager**: High-speed category catalog browser with instantaneous 86'd out-of-stock toggles.
- **Interactive Floor Plan**: Responsive spatial table map supporting drag placement and real-time occupancy color states.
- **Merged Tables**: Visual union of adjacent tables for large parties with combined capacity calculations.
- **Walk-In Waitlist**: Live queue management with party size, quoted wait times, and direct party seating shortcuts.
- **Reservation Calendar**: Day/shift view of upcoming reservations with automated check-in and table pre-allocation.

---

## 3. Out of Scope

- Customer-facing online reservation booking engine (internal staff floor management only).
- Direct SMS telecom provider gateways (simulated notification triggers used).
- Drag-and-drop structural floor architectural CAD editing (fixed grid coordinate layout used for MVP).

---

## 4. Tech Decisions

| Decision | Choice | Reason |
|:---|:---|:---|
| Table Layout Engine | CSS Grid + Absolute Coordinate Projection | Balances fixed tablet responsive scaling with precise dining room X/Y positions. |
| Cache Invalidation | Immediate RTK Query tag invalidation (`Menu`, `Tables`) | Toggling an item 86'd immediately disables it in the POS order screen without a manual page refresh. |
| Floor-to-Order Routing | URL Parameter Passing (`/orders/new?tableId=X`) | Seating an occupied table immediately opens order intake with table capacity pre-selected. |
| Waitlist Time Tracking | Client interval hook (`useElapsedTimer`) with `date-fns` | Accurately calculates wait time elapsed without hammering the backend with polling requests. |

---

## 5. Folder Layout

```text
OrderlyWeb/src/
├── features/tables/
│   ├── components/
│   │   ├── FloorPlanGrid.tsx          # Spatial canvas rendering tables by PositionX/Y
│   │   ├── TableCard.tsx              # Interactive table element with status and capacity
│   │   ├── MergedTableGroup.tsx       # Visual cluster boundary for combined tables
│   │   ├── TableSeatModal.tsx         # Quick dialog to seat party or view active order
│   │   └── TableStatusLegend.tsx      # Color state reference bar
│   ├── hooks/
│   │   └── useFloorPlan.ts            # Table positioning, filtering, and merge operations
│   └── types/
│       └── floor.ts                   # TableShape, FloorCoordinates, TableFilterState
├── features/menu/
│   ├── components/
│   │   ├── MenuAvailabilityGrid.tsx   # Item card grid with instant 86'd switch
│   │   ├── CategoryTabList.tsx        # Horizontal category navigation
│   │   └── IngredientWarningBadge.tsx # Visual tag indicating limited ingredient availability
│   └── hooks/
│       └── useMenuAvailability.ts     # Handles optimistic 86'd toggle mutations
├── features/queue/
│   ├── components/
│   │   ├── WaitlistTable.tsx          # Active queue with party sizes and wait times
│   │   ├── AddWalkInDialog.tsx        # Fast modal to add party to waitlist
│   │   ├── ReservationList.tsx        # Timeline of confirmed reservations
│   │   └── CheckInDialog.tsx          # Match party to available table
│   └── hooks/
│       └── useWaitlist.ts             # Quoted wait time calculator
└── routes/site/restaurant/
    ├── MenuPage.tsx                   # /site/restaurant/menu
    ├── TablesPage.tsx                 # /site/restaurant/tables
    ├── QueuePage.tsx                  # /site/restaurant/queue
    └── ReservationsPage.tsx           # /site/restaurant/reservations
```

---

## 6. Detailed Specification

### 6.1 Menu Availability Manager (`/site/restaurant/menu`)

- **Category Navigation**:
  - Horizontal tab bar with count of total vs 86'd items.
  - Search bar filtering item names and ingredient keywords.
- **Item Availability Card**:
  - Item name, thumbnail, base price, and current availability status.
  - **Instant 86'd Switch**: One-tap toggle dispatching `updateMenuItemAvailability`. Optimistically flips UI and immediately invalidates `Menu` RTK Query tags across terminals.
  - Ingredient badge: Highlights if an item is available via auto-substitution (Ingredient Availability Engine integration).

### 6.2 Interactive Dining Floor Plan (`/site/restaurant/tables`)

- **Spatial Layout Grid**:
  - Renders tables positioned by `PositionX` and `PositionY` coordinates.
  - Dynamic table shapes: `Square` (2–4 tops), `Round` (4–6 tops), `Booth` (booth seating), `Long` (banquet).
- **Occupancy Color States**:
  - `Available` (Emerald Green `#059669`): Tapping opens **Seat Party** or **Create Order** modal.
  - `Occupied` (Cold Station Blue `#1D4ED8`): Shows current elapsed time and active order token. Tapping navigates to `/site/restaurant/orders/:orderId`.
    - To resolve the active order for an occupied table: use `getOrders({ tableId, status: 'active', pageSize: 1 })` from `ordersApi` — the first result is the active order. No separate `getActiveOrderByTable` endpoint is needed.
  - `Reserved` (Range Amber `#D97706`): Displays reserved party name and reservation time.
  - `Needs Cleaning` (Muted Slate `#475569`): One-tap "Mark Cleaned" button restores state to `Available`.
- **Merged Tables**:
  - Displays visual outline encompassing parent and child tables (`MergedTables`).
  - Displays unified capacity (e.g., Table 4 + Table 5 = 8 seats).

### 6.3 Walk-In Waitlist & Reservations (`/site/restaurant/queue`, `/reservations`)

- **Walk-In Queue View**:
  - Guest party queue ordered by arrival time.
  - Columns: Position #, Guest Name, Party Size, Phone, Quoted Wait Time, Elapsed Time, Status (`Waiting`, `Notified`, `Seated`).
  - Actions:
    - `Notify`: Triggers simulated SMS text when table becomes available.
    - `Seat`: Opens table picker pre-filtered to tables with matching capacity.
    - `No Show`: Cancels party from waitlist.
- **Reservation Coordination**:
  - Date and meal period picker (Lunch / Dinner).
  - List of upcoming reservations with party notes and special requests (anniversary, high chair).
  - One-tap "Check In" allocates reserved table and transitions status to `Confirmed`.

---

## 7. Development Phases & Verification Checklist

### Phase 1: Menu Catalog & Instant 86'd Inventory Management
- [x] Build `MenuAvailabilityGrid.tsx` and `CategoryTabList.tsx`.
- [x] Connect instant toggle to `updateMenuItemAvailability` mutation with optimistic updates.
- [x] Mount in `src/routes/site/restaurant/MenuPage.tsx`.
- [x] Verification: Toggling an item 86'd immediately invalidates `Menu` tags and updates card status.

### Phase 2: Interactive Dining Floor Plan & Table Grid
- [x] Build `FloorPlanGrid.tsx` and `TableCard.tsx` supporting `Square`, `Round`, and `Booth` shapes.
- [x] Implement occupancy color states and status filter buttons.
- [x] Mount in `src/routes/site/restaurant/TablesPage.tsx`.
- [x] Verification: Table card click routing correctly branches between Order Creation and Order Detail.

### Phase 3: Table Clustering & Merged Tables Operations
- [x] Build `MergedTableGroup.tsx` rendering visual boundaries around merged tables.
- [x] Implement merge table dialog: select two adjacent available tables → dispatches `mergeTables` RTK mutation (`POST /catalog-api/v1/restaurants/{id}/merged-tables`).
- [x] Implement split (unmerge) action on merged cluster card → dispatches `splitTables` mutation (`DELETE /catalog-api/v1/restaurants/{id}/merged-tables/{mergedTableId}`).

> [!NOTE]
> Both `MergeTables` and `SplitTables` Carter endpoints are **confirmed present** in `Catalog.API` and their RTK mutations are defined in Phase 0. This sub-phase is RTK wiring + UI only.

- [x] Verification: Merged tables display combined capacity correctly; splitting restores individual table status.

### Phase 4: Walk-In Queue & Guest Waitlist Management
- [x] Build `WaitlistTable.tsx` and `AddWalkInDialog.tsx`.
- [x] Implement live elapsed wait timers using `date-fns`.
- [x] Mount in `src/routes/site/restaurant/QueuePage.tsx`.
- [x] Verification: Seating a waitlist party updates queue status and frees capacity.

### Phase 5: Reservation Calendar & Seating Coordination
- [x] Build `ReservationList.tsx` and check-in workflows.
- [x] Mount in `src/routes/site/restaurant/ReservationsPage.tsx`.
- [x] Verification: Check-in actions properly transition status to Confirmed.

### Phase 6: Bilingual Verification & Visual Regression Sweeps
- [x] Populate all floor plan, menu, and waitlist keys in `src/locales/en/restaurant.json` and `es/restaurant.json`.
- [x] Run automated axe-core accessibility audit across all four routes.
- [x] Execute `pnpm ui:check` (typecheck + lint + unit tests).

---

## Changelog

### v1.2 (2026-10-18) — Phase 3 Complete
- Completed dining floor plan (`/site/restaurant/tables`), table status management, and table clustering/merging dialogs.
- Completed walk-in waitlist queue (`/site/restaurant/queue`) and SMS/table allocation dialogs.
- Completed reservation calendar and seating management (`/site/restaurant/reservations`).
- Full bilingual coverage (`en` / `es`) with zero a11y violations across all routes (367 passing tests).

### v1.1 (2026-10-17) — Gap Analysis Incorporation
- Added `useElapsedTimer` shared hook import directive (prevents duplication with Phase 2).
- Added `mergeTables`/`splitTables` RTK mutation dependency note and confirmed backend endpoints.
- Added active order resolution pattern: `getOrders({ tableId, status: 'active', pageSize: 1 })`.
- Added 768px minimum tablet viewport constraint.
- Expanded Phase 3 sub-phase 3 merge/unmerge dialog spec.

### v1.0 (2026-10-16) — Initial Phase 3 Plan
- Formalized Menu, Floor Plan & Queue Management plan adhering to `_template.md`.
- Specified spatial table mapping, merged table clusters, instantaneous 86'd toggles, and waitlist management.
- Integrated design system standards from `DESIGN.md`.
