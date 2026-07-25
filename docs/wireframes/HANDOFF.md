# Wireframe Hand-off — for the Developer Rein

> Last updated: 2026-07-02 · Scope: all wireframes in `docs/wireframes/*.html`
> Pointer docs: `docs/website-spec.md` (behavior) · `docs/backend-architecture/architecture.md` (endpoints) · `docs/research/competitive-analysis-restaurant-crm.md` (rationale)

---

## 1 · Wireframe ↔ route ↔ zone quick map

| Wireframe | Routes covered | Zone | Personas (primary → secondary) |
|---|---|---|---|
| `wireframe-header-and-dock.html` | (all routes — 3-tier header is shell) | All | All |
| `wireframe-restaurant-orders.html` | `/site/restaurant/orders` | Restaurant | Manager → Waiter/Host/Cashier |
| `wireframe-order-detail.html` | `/site/restaurant/orders/:id` | Restaurant | Cashier → Waiter/Manager |
| `wireframe-split-bill.html` *(interactive)* | `/site/restaurant/orders/:id/split-bill` | Restaurant | Cashier → Waiter/Manager |
| `wireframe-dashboard.html` | `/site/restaurant` (2 layouts) | Restaurant | RestaurantAdmin (§A) / Shift-Manager (§B) → Waiter |
| `wireframe-kitchen-order-queue.html` | `/site/kitchen` | Kitchen | KitchenManager → KitchenStaff |

`/site/admin/*` (Staff mgmt, Activity, Multi-restaurant compare) — not yet wireframed. See §6 open work.

---

## 2 · Component inventory (deduped across wireframes)

> Build once, reuse everywhere. Each component has its host wireframe(s).

### Chrome — build first, blocks every screen

| Component | Wireframe(s) | Notes |
|---|---|---|
| `SystemBar` | D | 30 px. Apple-logo left + 5 menus + system tray right (`/hubs/notifications` badge, Cmd+K spotlight, theme toggle, fullscreen, clock, user) |
| `UtilityBar` | D, A, F, G | 36 px. Restaurant switcher + shift/live indicator + persona-scoped search + user menu + compare-with-toggle |
| `DockNav` | D, A, B, F, G | 60 px. Floating macOS-style dock, 9 icons (3 groups: Run / Guest / Settings), badges via `useDockCounts()` SignalR hook |

### Data primitives — build second

| Component | Wireframe(s) | Notes |
|---|---|---|
| `KpiCard` | H (§A) / `KpiCompact` (§B) | Variant prop `'cardgrid' \| 'compact'`. Props: `label`, `value`, `delta`, `sparkline`, `pills[]` |
| `Sparkline` | H (§A), B | Inline-SVG, color prop {mint, zinc, rose}. Last-point dot |
| `StatusPill` | A, B, F, G | spec §6.4 (8 variants). Always: left dot + label |
| `KdsTimeBar` | B | 3px bar with traffic-light color per spec §6.5 |
| `BumpButton` | B | 56pt on KDS-touched layout, 24pt on manager-view; haptic-ready |
| `ActivityRow` | H, F, G | Color-dot + actor + action + timestamp; variants for activity feed vs order row vs mod log |

### Form / table primitives

| Component | Wireframe(s) | Notes |
|---|---|---|
| `FilterChip` | A, H | status multi-select, click-to-toggle, count inside |
| `Table` (status-pill tables) | A, F | Sortable headers, monospace IDs/totals, status pills |
| `BulkActionBar` | A | Slot-in toolbar when ≥1 row selected |

### Domain components

| Component | Wireframe(s) | Notes |
|---|---|---|
| `OrderHeader` (status pill, action bar) | F | Big status pill + amber overdue flag + Print/Send-to-Cashier/Mark-Ready/Cancel |
| `OrderItemsTable` (modified-line tinting) | F | Post-fire additions get amber bg |
| `ApprovalBar` (in-place approval) | F | Yellow review bar with Approve/Reject/View-diff |
| `ActivityLog` (sticky right rail) | F | Color-coded event types; pending reviews inline |
| `SeatCard` (drag-drop target) | G | Drop highlight, per-seat totals, payment actions |
| `DragItem` | G | Carries modifiers + price; live total recalc on drop |
| `KdsCard` (BUMP grid) | B | 4-col grid, station filter, flash-new animation |
| `GrandTotals` | G | Sticky command bar showing recon to bill total |

---

## 3 · State, data layer, signals

### Redux Toolkit slices

```
app/ui/         → SystemBar { theme, timeRange, sidebarCollapsed }
                 → DockNav   { activeRoute, badges (signalR-driven) }
                 → UtilityBar { restaurantId, shift }
auth/           → user, persona claims (from JWT) ← drives role-based UI
restaurant/     → selectedRestaurant, menus (cached in RTKQ)
orders/         → table filters, bulk selection, last-seen idx
kds/            → station, manager-view toggle
ui/             → notifications feed, modals, drawers
```

### RTK Query endpoints (group by slice)

```
/api/identity (port 5007)        — login, refresh, me, users
/api/catalog  (port 5001)        — restaurants, menus, tables
/api/order    (port 5004)        — orders, orderItems, modifications
/api/basket   (port 5003)        — price calc, discounts, taxes
/api/discount (port 5002)        — promo codes, rewards
/api/kitchen  (port 5005)        — KDS aggregation
/api/notifications (port 5006)   — feed of cross-domain events
```

### SignalR hubs

| Hub | Endpoint | Consumed in | Events |
|---|---|---|---|
| `/hubs/orders` | `wss://…/hubs/orders` | A (bulk bar count), F (per-order subscribe), G (split-bill reconcile), H §B (live orders panel) | `orderCreated`, `orderStatusChanged`, `itemAdded`, `itemRemoved`, `orderCancelled`, `kitchenBumped` |
| `/hubs/notifications` | `wss://…/hubs/notifications` | SystemBar (badge), H (§A activity feed) | `info`, `warn`, `approval`, `system` |

Backend URL base: `VITE_API_BASE_URL` (default `http://localhost:5000` via Ocelot).
Dev note: in production, NEVER call Identity directly — always through the gateway.

---

## 4 · Design tokens (lock with Tailwind)

### Status palette (Spec §6.4)

| State | Tailwind | Hex | Where used |
|---|---|---|---|
| Ordering | `bg-blue-100 / text-blue-800 / dot bg-blue-600` | `#3B82F6` | tables, lists |
| Confirmed | `bg-amber-100 / text-amber-800 / dot bg-amber-600` | `#F59E0B` | lists |
| Preparing | `bg-yellow-100 / text-yellow-800` | `#EAB308` | lists + KDS |
| Ready | `bg-emerald-100 / text-emerald-800` | `#10B981` | lists + KDS |
| Delivered | `bg-teal-100 / text-teal-800` | `#14B8A6` | lists |
| Completed | `bg-zinc-100 / text-zinc-800` | `#6B7280` | lists |
| Cancelled | `bg-rose-100 / text-rose-800` | `#EF4444` | lists |
| On hold | `bg-purple-100 / text-purple-800` | `#A855F7` | lists |

### KDS time palette (Spec §6.5)

| Threshold | Hex | Where |
|---|---|---|
| ≤ 15 min (on track) | `#10B981` green | KDS time bar + KDS card |
| 15–20 min (approaching) | `#EAB308` yellow + ⚠ | KDS |
| > 20 min (overdue) | `#EF4444` red + ⚠⚠ | KDS + Order Detail flag |

### Dock badges (decision pending)

| Color | Use | Tokens |
|---|---|---|
| Red `#EF4444` | FOH urgency (orders, tables) | unhandled-count, pending-approval |
| Green `#10B981` | BOH activity (kitchen tickets active) | active tickets, success-state |
| Cyan `#0EA5E9` | System notification (reserve) | TBD — only used for system events |

### Header tier heights (Decided 2026-07-02)

```
system bar  30 px    (macOS Apple-menu equivalent · NEW)
utility     36 px    (restaurant context)
dock        60 px    (navigation)
─────────────────────
total      126 px
```

### Typography

- Body: `Outfit` 400–800 (Google Fonts)
- Numerals/IDs/timestamps: `JetBrains Mono` 400–600
- Heading tracking: `-0.01em` for h1/h2, `tracking-tight` (Tailwind utility)

---

## 5 · Permission matrix (RBAC from JWT claims)

| Route | SuperAdmin | RestaurantAdmin | Manager | Waiter | Cashier | Host | KitchenMgr | KitchenStaff |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `/site/restaurant` | ✓ | ✓ | ✓ | own-section | ✓ | — | — | — |
| `/site/restaurant/orders` | ✓ | ✓ | ✓ | own-section | ✓ | ✓ | read | read |
| `/site/restaurant/orders/:id` | ✓ | ✓ | ✓ | own | own-section | — | read | read |
| `/site/restaurant/orders/:id/split-bill` | ✓ | ✓ | ✓ | assist | ✓ | — | — | — |
| `/site/kitchen` | ✓ | ✓ | ✓ | — | — | — | ✓ | ✓ |
| `/site/admin/staff` (not built) | ✓ | ✓ | read | — | — | — | — | — |
| Apply discount > $5 | ✓ | ✓ | ✓ | ✗ (submit) | ✗ (submit) | — | — | — |

Apply-discount threshold of $5 needs hard config. Above that → fires `ApprovalRequested` event into `/hubs/notifications` for managers.

---

## 6 · Open work / not wireframed yet

| Item | Owner | Notes |
|---|---|---|
| `/site/admin/staff` (list + detail + role-preview modal) | design-next | research §8 P2 #8. Role-change-diff is research §4.3 #4 gap. |
| `/site/admin/activity` (cross-domain activity log) | design-V2 | research §8 P3. Currently the mod-log activity feed on Order Detail (F) covers a single order; this route aggregates globally. |
| `/site/restaurant/reservations` | design-V2 | research §8 P3 #9 |
| `/site/restaurant/analytics` (with compare toggle) | design-V2 | research §8 P3 #10 |
| Multi-restaurant compare (`Compare with…`) | component | Ghost button lives in utility bar across all wireframes but the destination route/screen is unspecified. |
| App shell composite (3 zones side-by-side) | component | Spec §4 zone model + 3-tier header on each. Reference image for design-review. |
| Restaurant switcher (dedicated component spec) | component | Currently embedded in utility bar. Has 1-screen exploration value if the UX of the dropdown is non-trivial (multi-restaurant search? "all restaurants" virtual group?). |

---

## 7 · Spec open questions — answered (carry over to `website-spec.md`)

Pulled from `research §7` and confirmed during wireframing:

| # | Question | Answer | Source wireframe |
|---|---|---|---|
| 1 | Single restaurant or multi at MVP? | **Multi** — switcher is in utility bar, all dashboards respect it | D, H |
| 2 | Dark mode default for KDS? | **Yes** — both light canvas (FOH) and dark canvas (KDS) ship | B, D §1b |
| 3 | Bulk-action panel on Orders list? | **Yes** — slots in above table when ≥ 1 row selected | A |
| 4 | Inline approval queue? | **Yes** — on the Order Detail (per-order), not separate inbox | F |
| 5 | Inline audit log UI? | **Yes** — sticky right rail on Order Detail | F *(biggest research §4.3 differentiator)* |
| 6 | KDS full-screen only? | **Both** — default full-screen, Manager-view toggle | B |
| 7 | Cross-zone dashboard for SuperAdmin? | **Yes** — `/site/admin` reserved; per-restaurant KPI cards coming | H informs |
| 8 | Comparison toggle multi-restaurant analytics? | **Yes** — in utility bar as ghost button; full UI in V2 | H §A A8 |
| 9 | Role-change preview/diff before submit? | **Yes** — modal step on Staff detail page (TBD wireframe) | not built yet |
| 10 | In-app manager log / activity feed? | **Defer to V2** — but route `/site/admin/activity` is reserved | F (per-order); §A A7 (per-restaurant) |

---

## 8 · Accessibility notes (a11y)

- Every interactive element is a real `<button>` / `<a>` (no `<div onClick>`)
- Dock items: `aria-label="Orders"`, `aria-current="page"` when active
- Status pills: `aria-label="Status: confirmed"`
- Keyboard: Tab cycles headers → main; arrow keys cycle dock items; `Esc` closes any open dropdown
- Modal traps focus; Tab cycles within modal only
- All color-coded states have a parallel text or icon (don't rely on color alone — e.g. overdue = red AND ⚠)
- Focus rings preserved (no `outline: none` without replacement)

---

## 9 · Performance budget (lazy-load priorities)

| Priority | Routes / components | Notes |
|---|---|---|
| **Critical (above the fold)** | SystemBar, UtilityBar, DockNav, KpiCard | Bundle with initial route |
| **High** | OrderList table, KdsCard, ActivityFeed | Code-split per route |
| **Medium** | OrderDetail, ApprovalBar, SplitBill | Loaded on demand |
| **Low** | Modals, tooltips, dropdowns | Lazy + dynamic import |

---

## 10 · Quick win: Storybook index

When the dev sprint starts, recommended Storybook entry order for component review:

1. `SystemBar` → `UtilityBar` → `DockNav` *(chrome — 70% of every screen)*
2. `StatusPill` → `KpiCard` → `Sparkline` *(data primitives — used by 4+ screens)*
3. `KdsCard` *(highest-risk UX — build before any other KDS work)*
4. `OrderHeader` → `OrderItemsTable` → `ApprovalBar` → `ActivityLog` *(the Order Detail is the most-referenced modal pattern)*
5. `SeatCard` + `DragItem` *(small, isolated, can be done in any order)*
6. `ActivityRow` (used in 3 places: live activity feed, recent events, order rows — consolidate)

---

## 11 · File index (delivery)

```
docs/wireframes/
├── HANDOFF.md                              ← this file
├── wireframe-header-and-dock.html          · D · 72 KB · 3-tier header exploration
├── wireframe-restaurant-orders.html        · A · 38 KB · Orders list (no sidebar)
├── wireframe-order-detail.html             · F · 48 KB · Order detail + mod log
├── wireframe-split-bill.html               · G · 49 KB · Split-bill (interactive)
├── wireframe-dashboard.html                · H · ~95 KB · Combined dashboard (Card Grid §A + Overview §B)
└── wireframe-kitchen-order-queue.html      · B · 41 KB · KDS order queue
```

Open any of them in a browser — Tailwind via CDN, Google Fonts via CDN, no build step. Pin annotations are clickable; hover for scale feedback.

---

**Next owner action:** Hand to developer rein for sprint planning. Tech lead should walk through §1 → §4 with the team; §6 (open work) goes into the backlog.
