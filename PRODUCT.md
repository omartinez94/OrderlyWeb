# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Orderly serves eight staff roles across three operational zones, with no single primary hero — each zone is its own context.

- **Admin zone** (`/site/admin`) — SuperAdmin, RestaurantAdmin, Manager. Multi-restaurant oversight, staff management, platform settings.
- **Kitchen zone** (`/site/kitchen`) — KitchenManager, KitchenStaff. Real-time order queue and prep status, full-screen on large touch displays.
- **Restaurant zone** (`/site/restaurant`) — Manager, Waiter, Cashier, Host. Order lifecycle, tables, split-bills, queue, feedback, analytics.

A user can hold multiple roles; on login, the app routes them to their default zone based on the roles in their JWT. Role-based guards enforce the per-zone access matrix in `docs/website-spec.md` §4.3.

## Product Purpose

Orderly is a unified, role-based web app for restaurant operators to run day-to-day operations — staff, orders, tables, kitchen, analytics — from a single interface that adapts to whoever is using it and which restaurant they are working in.

It exists because restaurant teams work in three physically different rooms (kitchen, floor, back office) and the system of record that connects them has historically been too slow, fragmented, or hard to switch between. Success means one source of truth that each role can act on without leaving their context.

## Positioning

Real-time operations is the wedge. The product's edge is the speed and coherence of what every role sees at the same moment — a ticket that pings the kitchen the instant it is placed, a status change that updates the floor and the dashboard simultaneously, a manager reading the same number the cashier is about to print. SignalR-backed live updates are not a feature; they are the central nervous system.

The mechanism a neighboring platform (Toast, Square, Lightspeed) could not truthfully copy is cross-zone, cross-restaurant, sub-second shared state that holds while each role works in their own UI.

## Operating Context

The product runs in three environments the UI must respect:

- **Kitchen** — heat, noise, distance reading, gloved hands, touch input, no keyboard. Status colors must be legible across the pass; errors must be recoverable without reading fine text.
- **Floor / front-of-house** — dirty screens, fast keyboard, table context, time pressure. Loops are short; latency must be sub-second.
- **Back office / admin** — multi-window, multi-restaurant oversight, data density, longer sessions. Hierarchy and scanability outrank decoration.

Restaurant vocabulary in product copy: orders, tables, courses, modifiers, split bills, tips, voids, comps, no-shows, walk-ins, covers, prep stations, pass, ticket.

## Capabilities and Constraints

### MVP scope

- **Staff Management** — list, create, edit, deactivate; role and restaurant assignment; permissions auto-derived from role (not manually assignable in MVP).
- **Orders** — list with filters, create, detail with modification panel, split-bill, status tracking, modification approval workflow.

### Future modules (post-MVP, declared in spec)

Menu Management, Kitchen Display, Tables & Floor Plan, Reservations, Walk-in Queue, Reports & Analytics, Customer Feedback, Settings.

### Architectural constraints

- React 19 + TypeScript + Vite + TailwindCSS + HeadlessUI. Redux Toolkit + RTK Query for all server state (no ad-hoc `fetch`). React Router v6.
- SignalR Client for `/hubs/orders` and `/hubs/notifications`.
- All API calls go through the Ocelot API Gateway on port 5000; no direct service calls from the frontend.
- JWT access token lives in Redux memory only (15-min TTL). Refresh token is an httpOnly cookie (7 days). Auto-refresh on 401.
- Multi-restaurant switching: changes reload RTK Query cache and reset context. Persisted in Redux + `?restaurantId=` URL param.
- Three-zone routes (`/site/admin`, `/site/kitchen`, `/site/restaurant`) with role-based guards. Root `/` redirects to the role's default zone.
- No `any` outside generated DTO shims. Prettier 2-space, single quotes, 100-char width.

### Order status flow

`new` → `acknowledged` → `preparing` → `plating` → `ready` → `served`. Modifications can be proposed after acknowledgement and require approval before they reach the kitchen.

## Brand Commitments

- **Visual identity is locked.** Blue-teal primary (`#1F4254` light / `#4A8B98` dark), tangerine accent (`#F26A3A` light / `#FF8A5A` dark), sage-tinted surface (`#EFF1ED` light / `#0E141A` dark). All tokens live in `src/index.css` (CSS variables) and `src/lib/tokens.ts` (typed constants). Components consume Tailwind utilities by semantic name (`bg-primary`, `text-ink`) — raw hex does not leave the token files.
- **Typography is a two-family system.** **Urbanist** for descriptions, body copy, and any long-form content. **MuseoModerno** for titles and any text that should contrast with body (display, headline, title). System mono remains reserved for timestamps, IDs, and numeric readouts. Both webfonts ship as Fontsource variable-font packages (`@fontsource-variable/urbanist` and `@fontsource-variable/museomoderno`) and are imported in `src/main.tsx` so Vite bundles the woff2 files — no third-party CDN at runtime. The rule binds the visual system; component code consumes it via the `--font-body`, `--font-display`, and `--font-mono` tokens.
- **Service-hue gradient** maps to status flow: cool (deep → teal → aqua) for received/acknowledged/preparing; warm (surface → amber → tangerine) for plating/ready.
- **Glass effects** are reserved for overlays that sit on busy backgrounds; flat surfaces stay flat.
- **Themes.** Light, dark, plus a system-following default. Switching repaints via the `data-theme` attribute on `<html>` with no JS re-render.
- **Voice: professional / neutral.** Calm, factual, no flourish. The product states outcomes plainly; brand lives in precision, not personality.
- **Internal tool only.** No customer-facing portal, no public reservations, no public menus. MVP excludes customer-facing flows.

## Evidence on Hand

Pre-implementation. No beta users, no production traffic, no testimonials, no screenshots from real restaurants, no benchmark data, no customer references. Future work must not fabricate any of these.

What does exist: the locked visual token set, the design-system showcase page (`src/App.tsx`), the architecture spec (`docs/backend-architecture/architecture.md`), and the website spec (`docs/website-spec.md`, v1.1, 2026-06-27). The Orderly Microservices backend is a sibling repo; the frontend's only contact with it is via the API Gateway.

## Product Principles

1. **Real-time is the wedge.** Shared state across roles is the product, not a feature. Every surface optimizes for "the same number at the same time."
2. **Zone before feature.** The three zones are contexts, not feature buckets. Design each on its own physical and cognitive terms; do not blur them.
3. **Tokens before pixels.** The design system in `src/index.css` and `src/lib/tokens.ts` is the contract. Components consume tokens by semantic name; raw hex values do not leave those files.
4. **Professional voice.** Calm, factual copy. Precision is the personality.
5. **Spec is the source of truth.** `docs/website-spec.md` and `docs/backend-architecture/architecture.md` are the contract for behavior. Implementation must cite the spec section it implements.

## Accessibility & Inclusion

The spec does not name a formal accessibility standard. Inferred from the physical operating contexts above:

- **Kitchen** must push beyond web norms: large touch targets, high contrast for distance reading, status colors that survive warm pass-light glare, errors recoverable without reading fine text.
- **Floor** is keyboard-first for cashier and waiter speed; focus indicators must remain visible on dirty touchscreens.
- **Admin** preserves dense data with strong hierarchy and predictable table semantics.

A formal WCAG level has not been committed — open decision for the product owner to set once MVP launches and the real user base is observed.
