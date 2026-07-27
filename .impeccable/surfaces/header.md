# Surface Brief: App Header (`/components/header`)

> A persistent top bar consumed by all three zone layouts (admin, kitchen, restaurant). Anchors orientation, carries the multi-restaurant switcher, surfaces live operational data on the floor and kitchen, hosts the notifications bell, and gates account / theme controls. Built once, used everywhere.

## Reference wireframe

[`docs/wireframes/wireframe-header-and-dock.html`](../../docs/wireframes/wireframe-header-and-dock.html) — a hand-built static HTML wireframe that sketches the header's slot order, the macOS-style system bar treatment, and the dock nav. Treat the wireframe as a visual companion to this brief: it shows the proposed composition, this brief explains the bindings, the states, and the open decisions. Where they disagree, the brief wins.

---

## 1. Job and audience

**Who arrives:** any authenticated staff member — SuperAdmin, RestaurantAdmin, Manager, KitchenManager, KitchenStaff, Waiter, Host, Cashier. Same header for all eight roles, all three zones.

**What they need to do in under a second:** know which restaurant they are working in, which zone they are in, how to switch either, and (on floor and kitchen only) how many orders are in motion.

**Visitor mode:** Operate. The header is a tool, not a destination — its job is to get out of the way once it has delivered orientation and to stay calm under the heat of a rush.

## 2. Outcome and proof

- **Always-orient.** A user lands on any page, any zone, any role — they can read restaurant and zone in one glance without scrolling.
- **Switch in one click.** Multi-restaurant users change context without losing their place. Single-restaurant users see no switcher at all.
- **Live awareness on the floor.** On `/site/restaurant` and `/site/kitchen`, an open-order count is always visible. The number updates via SignalR — the wedge the product is built on.
- **Unified inbox.** A single notifications bell across the entire app. Backend wiring lives on the `/hubs/notifications` SignalR hub (per `docs/website-spec.md` §2).

## 3. Selected direction

**Visual authority:** the DESIGN.md "Top Bar" entry — Sage Linen ground, hairline Linen Edge bottom border, fixed at the top of the viewport, full width. The header is the project's quiet anchor; it does not announce itself.

**Structural thesis:** a six-slot horizontal flex. Left to right:

```
[ Restaurant switcher | breadcrumb | spacer | ops badge (floor & kitchen only) | bell | theme | user menu ]
```

- **Restaurant switcher** — leftmost, dominant. Always visible; collapses to a static label when the user has access to a single restaurant.
- **Breadcrumb** — center-left, informational. Format: `Orderly / {Restaurant Name} / {Zone}`. Three segments, two separators. The "Orderly" segment is the product brand mark; the restaurant segment mirrors the switcher; the zone segment reflects the active route.
- **Ops badge** — between breadcrumb and the right cluster, **only on `/site/restaurant` and `/site/kitchen`**. Hidden on `/site/admin`. Shows the live count of in-progress orders (acknowledged + preparing + plating), color-coded by load: neutral by default, Saffron Amber when > 5, Burnt Tangerine when > 10. Service-Flow Rule: this is the one place tangerine is allowed to shout.
- **Notifications bell** — always present. Default bell icon. Unread count badge in Tilled Teal when > 0, hidden at 0. Cap visual at "99+". Opens a popover with a vertical list of notifications (MVP: empty state + a single placeholder "You're all caught up").
- **Theme toggle** — the existing `ThemeToggle` component, unchanged.
- **User menu** — rightmost. Avatar circle (initials) → dropdown (Profile, Logout). Logout clears the in-memory JWT and the httpOnly refresh cookie, then routes to `/login`.

**Focal moment:** the ops badge on the floor. The whole header is built so that badge is the visual climax on a busy shift. When a kitchen is slammed, the badge is what the eye lands on.

**Implementation consequence:** a single `<Header />` component, mounted by each of the three zone layouts, fed three things: the current restaurant (from Redux + `?restaurantId=`), the current zone (from React Router), and a feature flag for "show ops badge." Bell and ops badge subscribe to live RTK Query / SignalR slices; everything else is a derived prop.

## 4. Scope and boundaries

**Fidelity:** production-ready. This is the first thing every user sees across the entire app — it must be perfect.

**Breadth:** a single component. No drawer, no slide-out, no mobile-dedicated variant for MVP. On narrow viewports the header collapses the breadcrumb to just the zone segment; the restaurant switcher remains.

**Interactivity:** click / keyboard / touch. The Header is the highest-touch surface in the app — every control has hover, focus-visible, active, and disabled states.

**What stays untouched:** the rest of the navigation system. Zone sidebars are a separate component. The top bar does not own the zone sidebar.

**Anti-goals:**

- No marketing — the header is a tool, not a brand surface. The `bg-gradient-primary` brand signature does not appear here.
- No tangerine CTA — the One-Voice Rule still binds. Tangerine earns its place only on the ops badge under load.
- No notifications management (mark-as-read, filters) in MVP — the bell opens a placeholder popover. Wiring the full inbox is post-MVP.

## 5. States and ranges

### Restaurant switcher

- **Single restaurant:** static label, no chevron, no dropdown. The control is not a button — it is a text label.
- **Multi-restaurant (1–5):** dropdown, no search. Restaurant names + a small role tag (`Owner`, `Manager`, `Staff`).
- **Multi-restaurant (6+):** dropdown with a typeahead input at the top. Same row layout, search filters the list live.
- **Switching:** click selects, dropdown closes, restaurant ID is written to Redux + `?restaurantId=` URL param, RTK Query cache invalidates for the new context, all dependent queries refetch. While the switch is in flight, the switcher is disabled and shows a small inline spinner (Tilled Teal, 14px).

### Breadcrumb

- Always three segments when restaurant is set, two segments when restaurant is not yet resolved (loading).
- Restaurant segment text wraps at one line, truncated with ellipsis if the name is long.
- "Orderly" segment is a link to `/` (the role's default zone).
- Restaurant segment is a button that opens the same dropdown as the switcher (synchronized state).
- Zone segment is a static label — the user is already there; clicking it would be noise.

### Notifications bell

- **0 unread:** bell icon only, no badge. Hover lifts the ground to Sage Linen High.
- **1–99 unread:** Tilled Teal circle (20px) anchored to the bell's top-right, white label with the count, semibold.
- **99+ unread:** same circle, label "99+".
- **Open:** popover anchored bottom-right, 360px wide, max 480px tall, scrolls internally. HeadlessUI Popover.
- **Empty state:** centered icon + "You're all caught up" + Carbon Ink body. No actions.
- **Loading state:** skeleton list (3 rows, Sage Linen High ground, animated shimmer — token-friendly, 200ms linear).
- **Error state:** Smoked Brick border-left (1px) + Carbon Ink body + retry button. Recovery-first copy.

### Ops badge (floor and kitchen only)

- **0 in-progress:** hidden entirely — empty state is no badge, not "0".
- **1–5 in-progress:** neutral — Carbon Ink label, "1 in progress" / "12 in progress". Sage Linen High pill.
- **6–10 in-progress:** Saffron Amber pill (12% tint, full-amber label, 28% amber border). Same copy.
- **11+ in-progress:** Burnt Tangerine pill. Same copy.
- **Hover:** subtle ground lift to Sage Linen Overlay; cursor: pointer; click routes to the zone's order list.
- **KDS variant:** on `/site/kitchen`, the badge counts in-kitchen orders (preparing + plating + ready) instead of all in-progress. Tighter lens for the kitchen context.
- **Floor variant:** on `/site/restaurant`, the badge counts acknowledged + preparing + plating across all tables. The floor cares about all open work, not just one section.

### User menu

- **Logged in:** avatar circle with initials, dropdown on click — Profile, Logout.
- **Loading user:** avatar circle is a 36px Sage Linen High skeleton, no dropdown.
- **Error:** no avatar (hidden), the theme toggle shifts right; user can sign out via a recovery link in the global error boundary.

### Theme toggle

- Unchanged from the existing `ThemeToggle` component. Sun in dark mode, moon in light mode.

## 6. Interaction and layout

**Container:** fixed top, full width, 64px tall, z-index above zone sidebars and content. Sage Linen ground. Hairline Linen Edge bottom border (1px solid). On scroll, the bar stays put — no shadow appears until content scrolls underneath.

**Topology:**

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Restaurant] / [Orderly] / [Zone]   [Ops Badge]   [Bell] [Theme] [Av] │
└────────────────────────────────────────────────────────────────────────┘
```

**Slots (left → right):**

1. **Restaurant switcher / label** — leftmost. Min-width 200px, max-width 280px. Tilled Teal label (MuseoModerno, 600, 0.875rem) on rest, deepens on hover.
2. **Breadcrumb** — center-left. Muted Ink separator (`/`), Carbon Ink segment labels. The "Orderly" segment uses MuseoModerno (the brand word). Restaurant and zone segments use Urbanist. This is the one place a breadcrumb segment carries contrasting weight.
3. **Ops badge** — floor / kitchen only. Hidden on admin. Right of breadcrumb, with a 16px gap.
4. **Spacer** — `flex: 1` between ops badge and the right cluster.
5. **Notifications bell** — 36px square button, Sage Linen High ground, Linen Edge border. Badge anchored top-right at -4px / -4px.
6. **Theme toggle** — 36px square, the existing component.
7. **User menu** — 36px avatar circle. Initials in Carbon Ink on Sage Linen High. Linen Edge Strong border on hover.

**Typography:**

- Restaurant name: MuseoModerno 600, 0.875rem. Titles and contrasting text.
- Breadcrumb: "Orderly" in MuseoModerno 600; restaurant and zone in Urbanist 500, 0.875rem. Per the Two-Family Rule.
- Ops badge label: Urbanist 600, 0.75rem, mono sub-variant for the count itself.
- Bell badge: Urbanist 700, 0.7rem.
- User menu items: Urbanist 500, 0.875rem.

**Responsiveness:**

- ≥ 1024px: full layout as drawn.
- 768–1023px: breadcrumb drops the restaurant segment ("Orderly / Zone"), switcher still on the left.
- < 768px: switcher becomes an icon (utensils-style glyph), user menu becomes icon-only, ops badge remains visible. Breadcrumb becomes a back button + zone label. No hamburger — the zone sidebar already handles mobile navigation.

**Motion:**

- Dropdown open: HeadlessUI default (no override).
- Bell popover: 150ms ease-out, opacity + 4px translateY.
- Ops badge color transitions (e.g. neutral → amber when count crosses 5): 300ms ease.
- No motion on the bar itself — it is fixed and present.

**Feedback:**

- Every button has hover (ground lift), active (scale 0.96), and focus-visible (2px Tilled Teal outline, 2px offset).
- The active restaurant in the switcher carries a Tilled Teal label + a left rail.
- A toast appears on restaurant switch ("Switched to {name} — loading orders…").

## 7. Constraints and open decisions

**Binding constraints (from PRODUCT.md / DESIGN.md / spec):**

- React 19 + TypeScript + TailwindCSS + HeadlessUI + Redux Toolkit + RTK Query + SignalR. No ad-hoc `fetch`.
- All API calls via `VITE_API_BASE_URL` (the Ocelot API Gateway, port 5000).
- JWT access token in Redux memory only; auto-refresh on 401.
- Two-family font rule: MuseoModerno for the brand word "Orderly" and the restaurant name (titles and contrasting text); Urbanist for breadcrumb, ops badge label, and user menu items (body and small UI). Mono reserved for the ops count and timestamps inside the notification popover.
- All colors via Tailwind tokens (`bg-surface`, `text-ink`, `border-border-subtle`); no raw hex.
- The bell badge and ops badge are the two surfaces where brand color (Tilled Teal / Burnt Tangerine) is allowed to carry meaning.
- The Service-Flow Rule binds the ops badge: it can use Saffron Amber and Burnt Tangerine because they are service hues carrying order status, not decoration.
- Hybrid elevation: the header is flat (tonal layering) — no shadow, no glass.

**Reusable components to lean on:**

- `ThemeToggle` (existing) — slot 6.
- `StatusPill` (existing) — for the ops badge, refactored into a 12% / 28% tint over a non-status-color ground. Or a new component if StatusPill's color rules don't bend.
- `HeadlessUI Menu` for the restaurant switcher and the user menu.
- `HeadlessUI Popover` for the notifications popover.

**Choices a builder must not invent:**

- The header's height (64px) and the slot order (switcher / breadcrumb / ops / bell / theme / user).
- The breadcrumb format (`Orderly / {Restaurant} / {Zone}`).
- The ops badge thresholds (5 → amber, 10 → tangerine) and the lens (kitchen: in-kitchen orders; floor: all open work).
- The bell badge color (Tilled Teal, capped at 99+).
- The "no ops badge on admin" rule.
- The fixed top behavior — no shadow until scroll, no sticky-on-scroll.

**Open decisions (flagged, not invented):**

- **Notifications popover width / scroll behavior.** 360px is the MVP guess. Confirm after the first user interview.
- **Empty-state copy on the bell.** "You're all caught up" is a placeholder — voice is professional / neutral, so this fits. The exact line is a copy call.
- **Restaurant switcher typeahead threshold.** 6+ restaurants gets a search input. If real user data shows the threshold is 3 or 10, update.
- **Ops badge click target.** Routes to the zone's order list. If the floor has multiple order views, the destination needs a tiny routing decision (default → today's orders).
- **Avatar image vs. initials.** MVP is initials. If the backend ships a profile-picture URL, swap in `<img>` with a fallback to initials.
- **Notification mark-as-read interaction.** Not in MVP. When added, single-click on a row marks it read and decrements the count.
