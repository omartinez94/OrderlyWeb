# Competitive Analysis — Restaurant CRM & Management Platforms

> **Purpose:** Inform wireframes and mocks for the **Orderly Admin Panel** (`OrderlyWeb`).
> **Sources:** Public-facing product pages, marketing sites, industry comparisons, third-party reviews.
> **Scope:** Five platforms chosen to span SMB → enterprise, POS-led → CRM-led, web admin → KDS-led.
> **Author:** Mavis · 2026-07-01

---

## 1. TL;DR

| # | Platform | Why picked | What OrderlyWeb should borrow |
|---|---|---|---|
| 1 | **Toast** | Industry leader; full-stack restaurant platform; the only one with a separately branded mobile manager app | Mobile dashboard cards pattern (`Toast Now`); multi-suite sidebar grouping; manager log + conversational threads; 86-from-anywhere toggle |
| 2 | **Square for Restaurants** | SMB admin benchmark; cleanest accessibility for non-technical operators | Capabilities-based IA (verb-led nav); customer directory pattern; live sales banner; clean white-card dashboard |
| 3 | **Lightspeed Restaurant** | Strong multi-location + advanced analytics; modular product surface | Multi-location switcher in top bar (location chip); reporting hub as its own surface; reservations/new modules park as "New" pills |
| 4 | **SevenRooms** | Guest-profile-first CRM; strongest reasoning for the hotel/restaurant CRM angle | Unified guest profile tying booking + visit + spend; segmentation CRM sidebar; automated marketing journeys |
| 5 | **OpenTable** | Reservation + diner-network marketplace; CRM + auto-tagging + email marketing at scale | Reservation book grid view (day × service × table); guest tagging & notes; floor-plan-as-admin-canvas |

**Three top design principles for OrderlyWeb, drawn from the five:**

1. **Zone-sidebars stay zone-scoped.** Every picked platform uses a single back-office sidebar, but OrderlyWeb's three roles (admin / kitchen / restaurant) demand **different sidebars per zone** (per `website-spec.md §4.2`) — keep the top bar (restaurant switcher + user menu) consistent and let the sidebars diverge.
2. **The dashboard card is the unit of value.** All five treat the dashboard as live KPI cards (sales today, active orders, on-shift staff, alerts). Build a `<DashboardCard />` primitive early and reuse it in every zone's "home" page.
3. **Guest / entity profile as a sidebar drawer, not a modal.** SevenRooms + OpenTable both anchor workflows on a unified guest profile — clicking a name in any list should open a profile **right-side drawer** (not a new full page or a modal), preserving list context.

**Three things to differentiate from:**

1. Toast bakes too many modules into the sidebar — keep OrderlyWeb's MVP sidebar honest (≤ 8 items per zone).
2. Lightspeed buries reservations under "New" for too long — order MVP modules by usage frequency, not by recency of release.
3. Square's SMB-friendly tone should not become the brand voice — OrderlyWeb targets multi-restaurant managers and admins, who want denser information, not consumer-grade friendliness.

---

## 2. Methodology

**Approach.** Public-source competitive analysis. For each platform: (a) product/feature pages, (b) admin/dashboard marketing screenshots, (c) third-party comparison articles (Eat App's Restaurant CRM guide, Restroworks, G2/Capterra data). Cross-referenced against the OrderlyWeb spec (§1–§12).

**Selection criteria.**

| Criterion | Weight | Reason |
|---|---|---|
| Covers ≥ 2 of OrderlyWeb's MVP zones (admin/kitchen/restaurant) | High | Avoids single-purpose tools |
| Has a publicly described web admin surface | High | Most relevant to OrderlyWeb's web-first scope |
| Geo / market diversity | Med | US (Toast), US-SMB (Square), Multi-region (Lightspeed), Hospitality (SevenRooms), Marketplace (OpenTable) |
| Clear IA / sidebar taxonomy | Med | Need sidebar inspiration |
| Real-time / SignalR-style surface | Med | OrderlyWeb uses SignalR; KDS patterns are gold |

**Out-of-scope (deliberately not picked):**

- Pure reservation apps (Resy, Tock, Eat App) — too narrow.
- Pure accounting / back-office (Restaurant365, MarginEdge) — wrong layer.
- Delivery aggregators (Olo, ChowNow, Deliverect) — B2B infrastructure, not admin tools.
- General-purpose CRMs (HubSpot, Salesforce, SugarCRM) — not restaurant-specific; not informative on restaurant IA.

---

## 3. Per-Platform Deep-Dive

### 3.1 Toast

**Positioning.** "The POS built for peak volume, slim margins, and complexity at scale — trusted by 171,000 locations." US-focused, full-stack. Sells via subscription tiers (free starter → premium) + Toast Payments processing fees.

**Audience.** Full-service and quick-service restaurants; multi-location enterprise. Used by everyone from food trucks to venues like Harpoon Brewery.

**IA (Toast Web / back-office).** Suites pattern — every product is grouped under a **suite**, never flat-listed:

- Operations Suite: POS, Payments, Mobile Order & Pay, **Toast Now** (mgmt app), Catering, Inventory
- Marketing Suite: Advertising, Email, Gift cards, Loyalty, **Toast Tables**, **Guest CRM**
- Team Management Suite: Scheduling, Tips
- Digital Storefront Suite: Online ordering, Websites, Branded app, Local, Delivery integrations
- Supplier & Accounting Suite: xtraCHEF (cost analytics), Inventory
- Payroll Suite: Payroll, Pay Card
- Restaurant Management Suite: **Benchmarking**, **Multi-location mgmt**, Integrations
- Hardware: All / handheld / kiosk / **KDS**

This is a *product catalog* masquerading as IA. For OrderlyWeb MVP, copy the **suite grouping pattern** (e.g. "Operations" / "Team" / "Insights") but keep each suite ≤ 4 items.

**Toast Now — the mobile management app.** This is the most relevant admin UX reference in the set. Capabilities listed verbatim on their product page:

| Capability | Description | Maps to OrderlyWeb |
|---|---|---|
| **Live sales data** | Hour-by-hour totals, comparison to same day last week & last year | `/site/restaurant` dashboard |
| **Control delivery channels** | On/off toggles for online ordering, Local by Toast, 3rd-party apps | (post-MVP — but pattern is reusable for "pause online ordering" toggle in `/site/restaurant/settings`) |
| **Manager log** | Add/edit entries synced with Toast Web; conversational threads | **/site/admin** announcements/audit feed (gap opportunity — OrderlyWeb spec does not yet have this) |
| **Multi-location toggle** | One login, see all locations and performance in one place | Maps directly to top-bar **restaurant switcher** |
| **86 from anywhere** | Mark items out of stock; propagated live | Could feed into KDS color-coding (already in §6.4) |
| **Team status** | Who's clocked in/out, edit shifts, view tips & breaks | (post-MVP — Staff Mgmt doesn't yet include clock-in) |

**Takeaway for OrderlyWeb.**
The "card grid + status pill" pattern of Toast Now is the **gold standard** for a manager-on-the-go dashboard. Reuse it as the `/site/restaurant` dashboard "shell" — KPI cards in a 12-col grid with live data, status pills (green/yellow/red), and a single primary action per card.

**Sources.** `https://pos.toasttab.com/`, `/products/toast-now`, `/products/kitchen-display-system`, `/toast-platform`.

---

### 3.2 Square for Restaurants

**Positioning.** "A flexible restaurant POS, made for the rush." SMB-focused; consumer brand voice; one of the most accessible admin tools in the market.

**Audience.** Quick-service, full-service (single & small groups), bars, cafés, bakeries, food trucks, caterers. Square explicitly markets to owners who are not technical.

**IA.** Capabilities-led, not product-led. The sidebar (in Square Dashboard) groups features by *what the operator wants to do*, not by *what product it lives in*:

- Take payments
- Manage orders from one place
- Keep customers coming back
- Scale your business
- Schedule and pay your team
- Manage your cash flow
- Improve operations

This is a subtle but powerful choice. For OrderlyWeb MVP, this argues against naming zones after their modules (e.g. `Orders | Tables | Menu`) — instead, name them by **verb outcomes** (e.g. "Run service", "Manage team", "Read insights"). The OrderlyWeb spec's current sidebar (`Dashboard, Orders, Tables, Menu…`) is fine for the kitchen zone but might be reconsidered for restaurant/admin zones.

**Key admin dashboard widgets advertised on their site:**

- "Live Sales" tile (Figure: `PD07400_-_USEN_Live-Sales-Mobile.png`)
- "Customer directory" with `first_name, last_name, phone, email, visit_count, total_spent, saved_cards, preferences` — explicit enrichment fields
- "Reporting" — close-of-day + live sales report, sales-vs-labor chart
- "Shifts" — schedule + time tracking, breaks, labor cost
- "Square KDS" — ticket customization, auto-86 sold-out items
- "Multi-location dashboard" — same shell, location chip in top-left

**A very specific UI quote worth stealing (Square):**
> "Switching between locations on my phone is extremely easy. I click one button, and I can see all the analytics for Brooklyn. I click here, I'm in the West Village. And then the great part is that on the Dashboard, you're able to compare and contrast."

→ Design implication for OrderlyWeb: when a manager switches restaurants via the top-bar dropdown, the dashboard should re-render in place, **compare-mode becomes a secondary toggle** ("vs other restaurants"), and the comparison is *optional* — default to single-restaurant focus.

**Takeaway for OrderlyWeb.**
Square sets the bar for SMB-admin accessibility: large tap targets, plain language, visible help. OrderlyWeb's manager/admin audience is more technical than Square's, but the principle (no jargon unless wrapped in a tooltip) still applies — especially for `Waiter / Host / Cashier` personas.

**Sources.** `https://squareup.com/us/en/point-of-sale/restaurants`, `https://squareup.com/us/en/point-of-sale/restaurants/capabilities`, `https://squareup.com/us/en/staff/shifts`.

---

### 3.3 Lightspeed Restaurant

**Positioning.** "One fast, flexible platform" for "ambitious hospitality professionals". Multi-location friendly — they cite 144K locations and 200+ Michelin-star restaurants.

**Audience.** Mid-market to upscale. Full-service, bar, brewery, café, hotel restaurant, fine dining.

**IA.** Highly modular *product catalog*. The Restaurant sidebar (their dashboard "K Series") is dense:

> POS · Delivery · Order Anywhere · Advanced Insights · Inventory · Tableside · Payments · Accounting · **Kitchen Display System** · Pulse · **Reservations** · Tasks · **Tempo** · Capital · Benchmarks & Trends · Workforce Management & Payroll

Three observations:

1. **Everything is a first-class sidebar item.** No grouping/suites. ~17 items in the sidebar at full depth.
2. **New modules are flagged with "New" pills** — *Reservations*, *Tasks*, *Tempo*, *KDS* are still "New" (as of 2026), meaning Lightspeed has not yet retrofitted them into a suite.
3. **Reporting is separated into three distinct things:** *Advanced Insights* (real-time analytics), *Pulse* (the daily-pulse mobile companion), *Benchmarks & Trends* (peer comparison). This is the right level of separation but should consolidate for OrderlyWeb MVP — single "Analytics" tab is enough.

**Advanced Insights — the analytics suite.** Lightspeed's marketing copy:
> "Data you can use with every payment. Optimize your menu. Track customer behavior. Identify top-performing staff."

→ For OrderlyWeb's post-MVP `/site/restaurant/analytics` page, this is the reference: KPI dashboard with three sections — menu mix, customer behavior, staff performance.

**Multi-location model.** Lightspeed's admin explicitly lets the operator "manage as many locations as you want, all from one restaurant POS system", with a "complete restaurant management system" backed by a **single unified platform** for menus + guest data + reports. They promote changes propagating in "a few clicks".

→ For OrderlyWeb, this validates the existing spec (§5.2 Multi-Restaurant Switching): single JWT, restaurant switcher in top bar, cache invalidation on switch. Worth noting Lightspeed surfaces **multi-location prominently on the login screen** — OrderlyWeb should consider a similar "Choose location" pre-screen as an alternative to a dashboard-level switcher.

**Takeaway for OrderlyWeb.**
Validate the **restaurant switcher in the top bar** (existing spec §5.2). Add a "compare" toggle on the `/site/restaurant` analytics page. Avoid Lightspeed's mistake of too many top-level sidebar items — cap at 8 in the MVP.

**Sources.** `https://www.lightspeedhq.com/pos/restaurant/`, `/advanced-insights`, `/multi-location-restaurant-pos`, `/benchmarks-and-trends`.

---

### 3.4 SevenRooms

**Positioning.** "More than just reservations." Hospitality CRM-first. Operates as a *DoorDash company* since 2025 acquisition.

**Audience.** Restaurant groups, hotels, membership clubs, nightclubs & bars, sports & entertainment venues, breweries & wineries. Famous for: Nobu, Brotzeit, Ethan Stowell Restaurants, The Apollo, IGC Hospitality.

**IA — three explicit "hubs".** This is the most refined nav taxonomy of the five.

| Hub | Sub-modules |
|---|---|
| **Marketing Hub** | CRM & Segmentation · Marketing Automation · Email · Text · Search/Social/Discovery |
| **Guest Experience Hub** | Reservations & Waitlist · Events & Add-ons · Private Line · Loyalty/Perks · Reputation |
| **Operations Hub** | **Table Management** · Revenue Management · Online Ordering · Reporting · Event Mgmt · Voice AI · Channel Connect · API |

→ Steal this pattern for OrderlyWeb. Naming zones by *audience outcome* (Marketing vs Guest vs Ops) is more scalable than naming them by *data type* (CRM, Reservations, Tables). The OrderlyWeb spec already does something similar with the three top-level zones (`admin | kitchen | restaurant`); the Three-Hubs rubric can inform **how the restaurant zone's sidebar is organized internally** — sub-group into "Service" (Orders, Tables), "Guest" (Reservations, Feedback), "Insights" (Analytics).

**The unified guest profile.** SevenRooms' central primitive. Every capability they advertise closes with: *"Automatically capture and unify guest data across every booking, visit and order to understand diner preferences and spend — then turn those insights into personalized upsells…"*

→ This is the design idea OrderlyWeb's `Waiter / Host / Cashier` personas would benefit from most. Implementation note for V2: the `User` in OrderlyWeb (staff) is a different concept than the `Guest` (diner) — make sure they don't conflate. For MVP scope, don't build diner profiles; but **plan the data model** so adding them later (Customer Service from Catalog or a future "Patron" service) doesn't require a rewrite.

**Voice AI.** "With Voice AI, you'll never miss a call-in reservation." A new module they added — answers calls and books via SIP. Not relevant to MVP, but flag as a "north star" feature.

**Takeaway for OrderlyWeb.**
- Organize the `/site/restaurant` sidebar by **hub** (Service / Guest / Insights), not by product.
- Right-side **guest profile drawer** is the right pattern — even if no real profile data exists in MVP, the drawer shape should be reserved.
- "Auto capture + unify across channels" → eventual `Notification Service` consumer; defer.

**Sources.** `https://www.sevenrooms.com/`, `/platform/reservations-waitlist/`, `/platform/table-management/`, `/platform/crm/`, `/research/restaurant-trends/`.

---

### 3.5 OpenTable

**Positioning.** Reservation marketplace + CRM. The "diner network" — 25M+ diners/mo. For restaurants, the value proposition is *guest acquisition via the marketplace*; the admin tool is the engine.

**Audience.** Restaurants of all sizes that value the booking channel more than the management tooling. Particularly broad US reach.

**Public admin surface (from research, not from direct page fetch — see methodology note below).** OpenTable's restaurant-facing web admin, as described in third-party reviews (Eat App comparison, Capterra, G2):

- **Reservation book** — grid view, day × service period × tables. The signature UI. Color-coded by status (pending / confirmed / seated / completed / no-show).
- **Floor plan editor** — drag tables, set covers, set min/max per slot.
- **Guest notes & tags** — VIP, allergic, birthday, anniversary, "likes table 12".
- **Auto-confirmation & reminder emails/SMS** — automated message flow.
- **Guest profile** — visit history, lifetime spend, preferences, tags.
- **Reviews** — pulled from OpenTable's network.
- **Guest CRM** (in higher tier, $449/mo) — segmentation, marketing automation.

**Methodology note:** OpenTable's main marketing domain timed out twice during this research session. The above profile is reconstructed from secondary sources (Eat App's "10 Best Restaurant CRM Systems Compared", Capterra reviews, and OpenTable's own restaurant-help center that loaded sporadically). Worth a follow-up session with a different network or a Wayback Machine fetch.

**Takeaway for OrderlyWeb.**
- **Grid view for the reservation book** is the dominant pattern — don't reinvent it. A table = cell, time = row, party size = visual width.
- **Tag system for guests** — even cheap-tag CRUD scales: `{VIP, Birthday, Allergies, Regular, FirstVisit}`. OrderlyWeb's Notification Service or Notification/Feedback module already has a place for guest notes.
- **Diner network ≠ OrderlyWeb's scope.** Don't try to build a marketplace in MVP — focus on the restaurant's own data.

**Sources.** Eat App comparison article, `restaurant.eatapp.co/blog/10-best-restaurant-crm-systems-compared`; `wifitalents.com/best/restaurant-crm-software/`; cross-referenced with OpenTable's restaurant-help pages.

---

## 4. Synthesis

### 4.1 Common patterns (all 5 platforms)

These are table-stakes. If OrderlyWeb deviates, it should be a conscious decision.

| Pattern | Where seen | OrderlyWeb implication |
|---|---|---|
| **Sidebar + topbar shell** | All 5 | ✅ Spec §6.1 already plans this |
| **Multi-location switcher in top bar** | Toast, Lightspeed, Square | ✅ Spec §5.2 already plans this |
| **Dashboard = live KPI cards + a chart or two** | Toast Now, Square Dashboard, Lightspeed Advanced Insights | Reusable `<DashboardCard>` primitive |
| **Table-based list view with filters** | All 5 for staff/orders/guests | Default list pattern |
| **Status colors on orders & tables** | Toast KDS, TouchBistro, Lightspeed | ✅ Spec §6.4 already plans this |
| **Color-coded time indicators (green/yellow/red)** | All KDS platforms | ✅ Spec §6.5 already plans this — match exactly |
| **Auto-86 (item out-of-stock toggle)** | Toast, Square, Fresh KDS, Lightspeed | Ship with MVP as part of Order detail modification flow (§5.4) |
| **Real-time updates via push** | All 5 | ✅ Spec §7.3 plans SignalR |
| **Guest / customer profile as primary record** | SevenRooms, OpenTable, Toast Guest CRM, Square Customer Directory | Drawer pattern; defer full guest data to V2 |
| **Capabilities-led navigation grouping** | Square, SevenRooms Hubs, Toast Suites | Adopt **Three-Hubs** rubric inside `/site/restaurant` sidebar |
| **Manager log / activity feed** | Toast (Toast Now "manager log") | Gap — flag as future |
| **Multi-channel delivery on/off toggles** | Toast, Square, Lightspeed Order Anywhere | Out of scope for MVP |
| **Role-based permissions** | All 5 | ✅ Spec §4.3 plans this |

### 4.2 Divergent patterns (worth choosing between)

| Decision | Toast / Lightspeed | Square / OpenTable | SevenRooms | Recommend |
|---|---|---|---|---|
| **Top-bar location switcher vs pre-login location picker** | Top-bar | Top-bar (Square) / login screen (OpenTable) | Top-bar | **Top-bar** (spec agrees) + a "favorite locations" pinned list |
| **Guest / entity profile = page vs drawer** | Full page in CRM modules | Drawer | Drawer | **Drawer** (preserves list context) |
| **KDS = separate app vs same-app zone** | Same-app zone (Toast, Lightspeed) | Same-app zone | Same-app zone | **Same-app zone** (spec agrees) |
| **Sidebar items = products vs capabilities** | Products | Capabilities (verbs) | Hubs (outcomes) | **Capabilities**, group 3–4 into mini-sections in a single sidebar |
| **Inbox / activity feed on dashboard** | Yes (Toast Now "conversational threads") | Light | Yes (SevenRooms) | Ship a simple **Notifications panel** in top-bar in MVP (spec already mentions bell icon) |
| **Approval workflow for menu / schedule / role edits** | Modal flow | Email-async | In-app | **In-app modal with inline approval** for the role change flow (spec §5.3) |
| **Reservation book layout** | Grid (OpenTable) | Grid (Lightspeed) | Grid (SevenRooms) | **Time × Service × Table grid** for `/site/restaurant/reservations` |

### 4.3 Gaps & opportunities (OrderlyWeb can win here)

These are features common in competitor suites that OrderlyWeb can either *intentionally skip* for MVP or *plan to own*:

1. **Manager log / activity feed** — Toast's "conversational threads" idea is genuinely novel; no other platform has it as well-merged. **Build into the Admin zone** as `/site/admin/activity` page, fed by the Notification Service hub (§7.3).
2. **Audit log inline on order detail** — Lightspeed & Toast hide modification history behind a separate filter. OrderlyWeb's spec §12 already asks: *"Should we add audit logging UI (view modification history inline in order detail)?"* — **answer: yes**, surface in `/site/restaurant/orders/:id` as a collapsed "Activity" panel.
3. **Multi-restaurant compare** — none of the five surfaces a true side-by-side KPI comparison. **Add an MVP toggle** on `/site/restaurant/analytics`: "vs other restaurants I manage".
4. **Role change preview** — Toast's role-reassignment is in-app + immediate; SevenRooms' is approval-required; Square's is via the team dashboard. OrderlyWeb's spec §5.3 says role change triggers permission cache invalidation. **Add a preview/diff step** ("Before: Cashier → After: Manager; access will change for: orders, refunds, staff mgmt") that the manager must confirm.
5. **Drag-drop seat assignment for bill split** — all five offer split; only Lightspeed (inferred from screenshots) and SevenRooms make it visual. OrderlyWeb spec §12 asks: *"Should the bill split view use drag-drop for seat assignment?"* — **answer: yes**, with a clear fallback (typed seat number) for keyboard nav.

---

## 5. Wireframe Recommendations — By Zone

Each zone maps to one OrderlyWeb URL prefix from `website-spec.md §4.1`. For each, I give:
1. **Shell sketch** (top bar + sidebar).
2. **Key screens** with content placeholders and component patterns borrowed from the studied platforms.
3. **Component crosswalk** to the existing spec (§5.x).

### 5.1 `/site/admin` — Admin Zone

> **Audience:** SuperAdmin, RestaurantAdmin, Manager (limited).
> **Borrowed from:** Toast Suites (sidebar grouping); Square Capabilities; Lightspeed Multi-location.

**Shell:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] [Restaurant: All ▼]              [🔔] [Avatar ▼]   │
├──────────────┬──────────────────────────────────────────────┤
│ Dashboard    │                                              │
│ Staff        │   Main content                               │
│ Restaurants  │                                              │
│ Settings     │                                              │
│ ─────        │                                              │
│ Activity  🆕 │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Sidebar items (with cross-references):**
- Dashboard → spec §5.2 (multi-restaurant context)
- Staff → spec §5.3
- Restaurants → spec §5.2 (SuperAdmin only)
- Settings → spec §5.3 (SuperAdmin only)
- **Activity 🆕** → future; spec §12 open question #3 ("manager log")

**Key screens:**

| Screen | Pattern source | Must-haves |
|---|---|---|
| `/site/admin` Dashboard | Toast Now + Lightspeed Advanced Insights | KPI cards: total active staff, pending invitations, orders needing escalation, recent activity. Date range selector top-right. |
| `/site/admin/staff` | Square Customer Directory table pattern | Table: Name · Role · Restaurants · Status · Last Login · Actions. Filters: role, status, restaurant. Bulk action row. |
| `/site/admin/staff/new` and `/:id` | Square staff profile + Toast role preview | Two-step: (1) identity fields; (2) role + restaurants assignment with a **permission diff preview** before submit. |
| `/site/admin/restaurants` | Lightspeed Multi-location overview | Card grid (1 card per restaurant) with mini stats: staff count, active orders, today's revenue. |
| `/site/admin/restaurants/:id` | Toast "Restaurant Settings" tabs | Vertical tabs: General · Hours · Tables · Branding · Integrations. |
| `/site/admin/settings` | Generic platform admin (Salesforce-style) | Vertical tabs: Identity · Roles · Permissions · Notifications · API · Audit. |
| `/site/admin/activity` (future) | Toast "manager log" | Reversed chronological feed grouped by restaurant. Quick reply via text input. |

**Component crosswalk:** status badges (spec §6.4), restaurant switcher (spec §5.2), avatar dropdown with profile + logout.

---

### 5.2 `/site/kitchen` — Kitchen Zone

> **Audience:** KitchenManager, KitchenStaff.
> **Borrowed from:** Toast KDS, Square KDS, TouchBistro KDS, Lightspeed KDS, Fresh KDS.

**Shell (full-screen, high-contrast, minimal chrome):**
```
┌─────────────────────────────────────────────────────────────┐
│ Orders  ● Connected    [Restaurant: Test Kitchen ▼]    [⚙] │
├──────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐│
│  │ #1042  │  │ #1043  │  │ #1044  │  │ #1045  │  │ #1046  ││
│  │ Dine-in│  │ Takeout│  │ Dine-in│  │ Dine-in│  │ Delivery│
│  │ T-7 🟡 │  │ T-12 🟢│  │ T-2 🟢 │  │ T-18 🔴│  │ T-9 🟡 │
│  │ ────── │  │ ────── │  │ ────── │  │ ────── │  │ ────── │
│  │ 1× Burg│  │ 2× Pizza│ │ 1× Salad│ │ 2× Steak│ │ 1× Pasta│
│  │ 2× Fri │  │ 1× Coke │ │ 1× Soup │ │ 1× Wine │ │ 1× Cake │
│  │ [BUMP] │  │ [BUMP] │  │ [BUMP] │  │ [BUMP] │  │ [BUMP] │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Above-the-fold differences vs `/site/admin`:**
- **No left sidebar.** OrderlyWeb spec §4.2 says each zone has its own sidebar — for kitchen, the sidebar is icon-only and minimal (2 items: Order Queue, Settings).
- **Top bar stays** — restaurant name + SignalR connection status (spec §5.4) + minimal settings cog.
- **No notifications bell** in MVP — kitchen eyes should be on tickets, not popups.

**Sidebar (collapsed by default, expanded on hover/click):**
- Order Queue (default landing)
- Settings (alert sounds, refresh rate — spec §12 open question)

**Key screens:**

| Screen | Pattern source | Must-haves |
|---|---|---|
| `/site/kitchen` | Toast KDS + TouchBistro KDS | Card grid, time-indicators per spec §6.5, tap to expand detail, swipe-right to bump, multi-station filter pills at top. |
| `/site/kitchen/order/:id` | TouchBistro KDS detail | Full items list with seat/variation columns, "Mark ready" per item, "Bump ticket" primary CTA. |
| `/site/kitchen/settings` | Square KDS config | Toggles: alert sound on/off, refresh rate (5s/10s/30s/60s), screen brightness dimmer, dark mode (always dark). |

**Critical KDS UI rules (from across the five KDS products studied):**

1. **No scroll inside a single order card.** All items visible on the card face. If overflow, the card grows.
2. **Bump is the most-used action.** Give it a 44pt tap target. Right-swipe to bump is a power-user gesture only — provide an explicit button too.
3. **Time indicator at the top of the card** (not the body) — pattern from Toast, Fresh KDS, Lightspeed. The eye reads top-down.
4. **Order type badge** (Dine-in / Takeout / Delivery) at the top — pattern from Square, TouchBistro — colored by type.
5. **Connection status always visible.** Spec §5.4 already says "Connection status indicator (connected/reconnecting/disconnected)" — make it a chip in the top bar, not a tooltip.
6. **No animations on ticket change** — KDS is read while moving; transitions slow comprehension. Lightweight state-change flash only.

**Component crosswalk:** status colors (§6.4), kitchen time indicators (§6.5), SignalR provider (§7.3), real-time order list (§5.4).

---

### 5.3 `/site/restaurant` — Restaurant Operations Zone

> **Audience:** Manager, KitchenManager (read), Waiter, Host, Cashier.
> **Borrowed from:** Square Dashboard (capabilities IA), Toast Now (KPI cards), SevenRooms (Three-Hubs grouping), Lightspeed (multi-location reporting).

**Shell:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] [Restaurant: La Casa ▼] [🔔 3]          [Avatar ▼]   │
├──────────────┬──────────────────────────────────────────────┤
│ ── Run ─────│                                              │
│ Dashboard    │                                              │
│ Orders       │   Main content                               │
│ Tables       │                                              │
│ ── Guest ───│                                              │
│ Reservations │                                              │
│ Queue        │                                              │
│ Feedback     │                                              │
│ ── Insights ─│                                              │
│ Analytics    │                                              │
│ ─────────────│                                              │
│ Menu (future)│                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Sidebar group headers (Three-Hubs rubric, dashed dividers per visual rule):**
- **Run** — Dashboard, Orders, Tables
- **Guest** — Reservations, Queue, Feedback
- **Insights** — Analytics
- *Future:* Menu (catalog)

This is the application of SevenRooms' hub pattern at the restaurant-zone level. For MVP, only 8 sidebar items render; deferred items (Menu) show as faded-out "Coming soon" entries to communicate roadmap.

**Key screens:**

| Screen | Pattern source | Must-haves |
|---|---|---|
| `/site/restaurant` Dashboard | Toast Now + Square Live Sales | 4-card KPI grid: Today's revenue (with vs-yesterday sparkline) · Active orders (live count) · On-shift staff (with punch-in chip) · Alerts (e.g. "2 orders need billing"). Below: 1 large chart (Sales by hour) + 1 list (Recent activity). |
| `/site/restaurant/orders` | Toast Orders list + Square filter chips | Multi-line table with status pills (spec §6.4), filter chips (Status / Type / Table / Date), column sort, SignalR-powered live updates. Bulk action row appears when ≥ 1 row selected. |
| `/site/restaurant/orders/new` | Square Kiosk + create-order wizard | 4-step wizard per spec §5.4: Type → Table/Delivery → Menu (with item-image grid) → Review. Basket state in Redux (calls Basket Service per §5.4). Sticky right-side basket preview. |
| `/site/restaurant/orders/:id` | Square order detail + Toast modification panel | Header: order # / type / table / status / timestamps. Body: items table (qty · item · variation · seat · prep status). Right rail: **activity / modification log panel** (collapsed by default — answers spec §12 open question #6). Actions: context-aware per spec §5.4 (Ordering/Pending: edit; Confirmed/Preparing: edit manager+; Ready: Request modification; Delivered/Completed: none). |
| `/site/restaurant/orders/:id/split-bill` | Lightspeed / SevenRooms visual seat assignment | Top: equal-split quick action ("Split into N"). Body: **drag-and-drop seat assignment grid** — each item card has drag handle, drop onto seat columns. Keyboard fallback: typed seat # per item. Bottom: per-bill totals with validation ("Σ must equal order total"). Answers spec §12 #2. |
| `/site/restaurant/tables` | OpenTable floor plan | Two tabs: **Live floor** (table grid colored by state — free/seated/ordered/served/cleaning) + **Edit floor plan** (drag-tables). Switcher at top: section (Patio / Main / Bar). |
| `/site/restaurant/reservations` | OpenTable reservation book | Time × Service × Table grid (the classic OpenTable layout). Click empty cell → new reservation modal. Click filled cell → reservation detail drawer. Filters: date, party size, status. |
| `/site/restaurant/queue` | SevenRooms waitlist | List view with auto-refresh (SignalR). Cards: name · party size · quoted wait · quotes-since-added. Actions: seat / notify / remove. |
| `/site/restaurant/feedback` | Toast Guest CRM + OpenTable reviews | Reverse-chrono feed of customer feedback. Filters: rating, source, status (unread / read / responded). Inline "Respond" modal. |
| `/site/restaurant/analytics` | Lightspeed Advanced Insights | Date range + comparison toggle (single restaurant / vs others I manage). Three sections: **Menu** (top sellers, mix shift) · **Customer** (visit frequency, avg ticket) · **Staff** (sales by staff). Recharts per spec §2. |

**Role-based visibility (per spec §4.3):**
- `Waiter` sees: Dashboard (limited), Orders (own), Tables (live only — no edit)
- `Host` sees: Dashboard, Reservations, Queue
- `Cashier` sees: Dashboard, Orders (only statuses `ready`/`delivered`), Analytics (shift close only)
- `Manager` sees: everything
- `KitchenManager` sees: Dashboard + read-only Orders, plus the `/site/kitchen` zone

**Component crosswalk:** status badges (§6.4), status pills on orders (§5.4), modification log (§12 #6), real-time updates (§7.3 SignalR).

---

## 6. Design Tokens to Standardize

Beyond spec §6.4 (status colors) and §6.5 (kitchen time indicators), this research surfaces **seven design tokens** worth adding to the existing AGENTS.md / Tailwind config.

| Token | Purpose | OrderlyWeb primitive |
|---|---|---|
| `status.*` | Order statuses (blue / orange / yellow / green / teal / gray / red / purple) — already in §6.4, formalize as Tailwind theme extension | `<Badge variant="status" />` |
| `kds.*` | Kitchen time indicators (green / yellow / red) — already in §6.5 | `<KdsTicket age={...} prepTime={...} />` |
| `zone.*` | Per-zone accent (Admin: Slate; Kitchen: High-contrast Dark; Restaurant: Brand). Lets the shell adapt by role-context. | Background of top-bar left chip |
| `kpi.*` | Dashboard card variants (Revenue · Count · Status · Action). Each defines an icon, color hint, and CTA pattern. | `<DashboardCard variant="revenue" ... />` |
| `card.radius` | Toast & Square use 8px; Lightspeed & SevenRooms use 12px; OpenTable uses 6px. **Pick 8px** for OrderlyWeb; KDS uses 12px for finger ergonomics. | `rounded-lg` in Tailwind, `rounded-xl` on KDS |
| `shadow.elevation` | Toast uses deep shadows for layered dashboards. **Use sparingly** — every card has shadow `sm` only on hover. | `--shadow-card` |
| `font.size.scale` | All five use 14px base for admin; KDS uses 18px+. Lock this in Tailwind config. | `text-base` for admin, `text-lg` minimum for KDS |

**Tailwind theme sketch (add to `tailwind.config.ts`):**

```ts
theme: {
  extend: {
    colors: {
      status: {
        ordering:  '#3B82F6', // blue
        confirmed: '#F59E0B', // orange
        preparing: '#EAB308', // yellow
        ready:     '#10B981', // green
        delivered: '#14B8A6', // teal
        completed: '#6B7280', // gray
        cancelled: '#EF4444', // red
        on_hold:   '#A855F7', // purple
      },
      kds: {
        ontrack:    '#10B981',
        approaching: '#EAB308',
        overdue:    '#EF4444',
      },
      zone: {
        admin:     '#1E293B', // slate
        kitchen:   '#0B1220', // near-black
        restaurant:'#0EA5E9', // brand-cyan, swap to OrderlyWeb brand
      },
    },
  },
}
```

(Values aligned with `website-spec.md` §6.4 / §6.5 — formalizing into Tailwind.)

---

## 7. Open Questions to Resolve Before Mocking

Each maps to a `website-spec.md` §12 open question and one or two from this research.

| # | Question | Source | Recommendation |
|---|---|---|---|
| 1 | Do we need offline support for the Kitchen Display? | spec §12 #1 | **Yes for ticket view**, no for editing. Cache last-known order list in IndexedDB; reconnect-with-replay for status changes. |
| 2 | Should the bill split view use drag-drop for seat assignment? | spec §12 #2 | **Yes**, with typed-seat fallback. Patterns from Lightspeed, SevenRooms. |
| 3 | Do managers need a bulk action panel (approve multiple modifications at once)? | spec §12 #3 | **Yes** for `/site/restaurant/orders`; show checkboxes + sticky footer toolbar with "Approve N modifications". |
| 4 | Is there a need for a dark mode / theme toggle? | spec §12 #4 | **Yes for KDS only** (always-dark for night shifts). No system-wide dark mode for MVP; defer. |
| 5 | Should we add audit logging UI inline in order detail? | spec §12 #5 | **Yes** — collapsed right-side panel "Activity". |
| 6 | Should KDS be full-screen only? | spec §12 #6 | **Both modes, but full-screen by default**. Add a "Manager view" toggle that opens KDS non-full-screen with extra controls (re-assign, change priority). |
| 7 | Is there a "cross-zone" dashboard for SuperAdmin? | spec §12 #7 | **Yes** — `/site/admin` already implicitly covers this with the "All restaurants" view in the restaurant switcher. Add per-restaurant KPI cards. |
| 8 | Comparison toggle for multi-restaurant analytics? | research §4.3 #3 | **Yes**, behind a toggle on `/site/restaurant/analytics`. |
| 9 | Role-change preview/diff before submit? | research §4.3 #4 | **Yes** — modal step on `/site/admin/staff/:id`. |
| 10 | In-app manager log / activity feed? | research §4.3 #1 | **Defer to V2**, but reserve the `/site/admin/activity` route in the IA. |

---

## 8. Wireframe Output Plan

> Concrete recommendation for what to mock next, in priority order.

**Phase 1 — Critical (ship first to unblock engineering)**

1. **App shell** for all three zones (top bar + zone sidebar) — one component, three variants.
2. **Restaurant switcher** dropdown (single component, reused 3×).
3. **Dashboard card primitive** + 2 zone-specific dashboards built from it (`/site/admin` + `/site/restaurant`).
4. **`/site/kitchen` order queue** (the headline screen — biggest UX risk).
5. **`/site/restaurant/orders` list** (most-used screen — defines table/filter patterns).

**Phase 2 — Important**

6. `/site/restaurant/orders/:id` with modification log.
7. `/site/restaurant/orders/:id/split-bill` with drag-drop.
8. `/site/admin/staff` + `/site/admin/staff/:id` with role-preview modal.

**Phase 3 — Defer to V2 mock**

9. `/site/restaurant/reservations` grid.
10. `/site/restaurant/analytics` with comparison toggle.
11. `/site/admin/activity` feed.

---

## 9. Sources

**Primary (directly fetched 2026-07-01):**
- `https://pos.toasttab.com/` — Toast home
- `https://pos.toasttab.com/products/toast-now` — Toast Now (mobile management app)
- `https://pos.toasttab.com/products/kitchen-display-system` — Toast KDS (404, redirected to hardware)
- `https://squareup.com/us/en/point-of-sale/restaurants` — Square for Restaurants
- `https://www.lightspeedhq.com/pos/restaurant/` — Lightspeed Restaurant
- `https://www.sevenrooms.com/` — SevenRooms home
- `https://www.opentable.com/`, `https://www.opentable.com/about/` — both timed out; OpenTable profile reconstructed from secondary sources below

**Secondary (research compilations, accessed via web search):**
- `restaurant.eatapp.co/blog/10-best-restaurant-crm-systems-compared` — primary ranking
- `fooddocs.com/post/restaurant-management-software` — 25-best rankings
- `restroworks.com/blog/best-restaurant-management-software/`
- `restroworks.com/blog/best-crm-software-for-restaurants/`
- `goaudits.com/blog/best-restaurant-management-software/`
- `restaurantbookingsystem.com/best/best-restaurant-crm-software/`
- `wifitalents.com/best/restaurant-crm-software/`
- `wifitalents.com/best/dining-software/`
- `loman.ai/blog/best-kitchen-display-systems-order-routing` — KDS-specific patterns
- `tryotter.com/blog/restaurant-toolkit/best-kitchen-display-systems`

**Target document:** `docs/website-spec.md`, `AGENTS.md`.

---

## 10. Next Steps

After this brief is reviewed, the recommended next deliverables (each can be a separate task):

1. **Wireframe set (low-fidelity)** — greyscale Figma frames for all 10 screens in §8.1, with placeholder content.
2. **Visual mock (high-fidelity)** — 3 of those 10 screens with full Tailwind theme applied: `/site/kitchen` order queue, `/site/restaurant/orders/:id`, `/site/admin/staff`.
3. **Component spec sheet** — translate this research + the spec into a `tailwind.config.ts` + a `src/components/ui/` README that the developer rein can pick up.
4. **Open-question sync** — answer §12 #1–#7 from this research; update `website-spec.md`.

> **Owner:** Wireframe-driven development sprint, gated on each zone's mocks signed off by user.
