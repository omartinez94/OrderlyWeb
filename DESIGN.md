---
name: Orderly Admin Panel
description: A staff-facing operations console for restaurant teams — real-time, role-based, three-zone.
colors:
  primary: "#1F4254"
  primary-hover: "#16303D"
  primary-foreground: "#FFFFFF"
  accent: "#F26A3A"
  accent-hover: "#D8582C"
  accent-foreground: "#FFFFFF"
  ink: "#0E141A"
  ink-muted: "#4A5560"
  ink-subtle: "#7A8590"
  surface: "#EFF1ED"
  surface-elevated: "#F6F8F4"
  surface-overlay: "#FFFFFF"
  border-subtle: "#D8DED5"
  border-strong: "#B8C0B2"
  service-deep: "#1F4254"
  service-teal: "#4A8B98"
  service-aqua: "#7AB89E"
  service-amber: "#E8A340"
  service-tangerine: "#F26A3A"
  success: "#4A8870"
  warning: "#E8A340"
  danger: "#C84A3A"
  info: "#4A8B98"
typography:
  display:
    fontFamily: "'MuseoModerno', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'MuseoModerno', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'MuseoModerno', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  control: "8px"
  card: "12px"
  panel: "16px"
  pill: "999px"
spacing:
  control-y: "0.75rem"
  control-x: "1.5rem"
  card: "1.5rem"
  panel: "2rem"
  section: "2.5rem"
  grid-gap: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-y} {spacing.control-x}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-y} {spacing.control-x}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-y} {spacing.control-x}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-y} {spacing.control-x}"
  status-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.7rem"
  card-surface:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  theme-toggle:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "2.25rem"
---

# Design System: Orderly Admin Panel

## Overview

**Creative North Star: "The Quiet Workshop"**

The Quiet Workshop is a tool-first room. Surfaces exist to do work, not to be admired. Nothing on screen competes with the status of an order, the data on a dashboard, or the next action a staff member needs to take. The visual system earns its place by being quiet, accurate, and fast to read in every operating environment — the heat of a kitchen pass, the rush of a floor, the longer sessions of a back office. The product's brand lives in precision, not in personality.

Status is the visual hero. Every screen is engineered so that the state of an order, a table, or a queue can be read at a glance — across the pass, from a cashier's terminal, from a manager's monitor. The five-stop service gradient is not decoration; it is the visual grammar of the order lifecycle (`new` → `acknowledged` → `preparing` → `plating` → `ready`), and it owns those colors exclusively.

**Key Characteristics:**

- **Two themes, both functional.** Light is the day shift; dark is the night shift. Both are first-class, both run by default on `system` preference, and both share the same sage-tinted surface — no pure white anywhere on a content page.
- **Status is the only thing allowed to shout.** Tilled teal for calm authority, burnt tangerine for warm urgency, a five-step service gradient that maps to the order lifecycle. Every other surface stays out of the way.
- **Flat by default, lifted for overlays, glowing for emphasis.** Hybrid depth: content surfaces are flat, overlays carry a soft shadow, and only status elements earn the brand glow.
- **Two type families, no role-swap.** Urbanist carries the body and any long-form text. MuseoModerno carries titles and any text that should contrast with body. The split is the personality — body for living in, title for landing on.

## Colors

The palette is a two-voice system: tilled teal for calm authority, burnt tangerine for warm urgency, anchored to a sage-tinted surface and a five-step service gradient that carries the order lifecycle. Every other color in the system is a working surface or a status signal — nothing is decorative.

### Primary

- **Tilled Teal** (`#1F4254` / dark `#4A8B98`): The deep blue-teal that carries calm authority. Primary CTAs, active nav state, primary links, the cool side of the service gradient, focus rings. Reads as quiet competence — the color of a hand on a wheel, not a hand on a horn.
- **Tilled Teal Hover** (`#16303D` / dark `#5FA0AE`): Slightly deeper in light, lifted in dark. The button-press moment.

### Secondary

- **Burnt Tangerine** (`#F26A3A` / dark `#FF8A5A`): The single warm voice. Reserved for in-progress states, urgent CTAs, the warm side of the service gradient, and any time the product needs to say "now." Use it sparingly — its rarity is the point.
- **Burnt Tangerine Hover** (`#D8582C` / dark `#FFA478`): The tangerine pressed.

### Neutral

- **Carbon Ink** (`#0E141A` / dark `#ECF0F2`): Body text, the dominant ink. Near-black in light, near-white in dark, with a cool tint in both — never neutral gray.
- **Muted Ink** (`#4A5560` / dark `#A8B2BC`): Secondary text, descriptions, helper copy, the body of an order card.
- **Subtle Ink** (`#7A8590` / dark `#6E7984`): Tertiary text, timestamps, "elapsed" labels, anything that should recede.
- **Sage Linen** (`#EFF1ED` / dark `#0E141A`): The page background. Sage-tinted in light, deep cool in dark. The only off-white surface color in the system.
- **Sage Linen High** (`#F6F8F4` / dark `#152028`): Elevated cards, panels, anything that needs to lift off the page without shadows.
- **Linen Overlay** (`#FFFFFF` / dark `#1C2832`): The only true white. Reserved for modals, popovers, and overlays that must sit above everything else.
- **Linen Edge** (`#D8DED5` / dark `#1F2A33`): Hairline borders, dividers, the quiet edge between two surfaces.
- **Linen Edge Strong** (`#B8C0B2` / dark `#2F3D48`): Emphasized borders, button outlines in resting state, the edge that says "this is interactive."

### Service Hues (status / order flow)

The five service hues are a closed set. They map 1:1 to order statuses and are the only colors allowed to carry that meaning.

- **Tilled Teal** (`#1F4254` / dark `#4A8B98`) — `new`. The ticket has just landed, untouched.
- **Hushed Teal** (`#4A8B98` / dark `#6BA5B0`) — `acknowledged`. Someone has claimed it.
- **Patina Aqua** (`#7AB89E` / dark `#98C9B0`) — `preparing`. In progress, calm.
- **Saffron Amber** (`#E8A340` / dark `#F0B560`) — `plating`. Almost there.
- **Burnt Tangerine** (`#F26A3A` / dark `#FF8A5A`) — `ready`. Waiting to be served. The single moment of urgency.

### Semantic States

- **Muted Forest** (`#4A8870` / dark `#6BA88E`) — `success`. Confirmations, completed actions.
- **Saffron Amber** (`#E8A340` / dark `#F0B560`) — `warning`. Reuses the service amber so the eye recognizes it.
- **Smoked Brick** (`#C84A3A` / dark `#E87060`) — `danger`. Errors, destructive actions, things that have gone wrong.
- **Hushed Teal** (`#4A8B98` / dark `#6BA5B0`) — `info`. Reuses the service teal — the system already knows what that color means.

### Gradients

Three gradients, three colors each, two of them are subsets of the service hues.

- **`bg-gradient-service-cool`** — `Tilled Teal → Hushed Teal → Patina Aqua`. The received flow. Default for the KDS calm state, the order queue at rest, anywhere the eye needs to see the journey without urgency.
- **`bg-gradient-service-warm`** — `Sage Linen → Saffron Amber → Burnt Tangerine`. The ready flow. Default for the KDS urgent state, "your food is on its way" moments, anywhere a status is escalating.
- **`bg-gradient-primary`** — `Tilled Teal → Burnt Tangerine`. The brand signature. Hero sections, login, the splash. Used once per screen, never as a content background.

### Named Rules

**The Service-Flow Rule.** The five service hues (Tilled Teal, Hushed Teal, Patina Aqua, Saffron Amber, Burnt Tangerine) are reserved for order status. They do not appear as decoration, marketing flourishes, or chart series. The order lifecycle owns these colors; everyone else borrows neutral or brand.

**The One-Voice Rule.** Burnt Tangerine appears on ≤10% of any given screen. Its rarity is the point. If tangerine is everywhere, urgency is nowhere.

**The No-Pure-White Rule.** The page background is Sage Linen (`#EFF1ED` / `#0E141A`), never `#FFFFFF`. The only true white in the system is Linen Overlay, reserved for modals and popovers. If a content surface needs to be white, it has earned the right to be a modal.

## Typography

**Display / Headline / Title Font:** **MuseoModerno** (with system-sans fallback for FOIT/FOUT)
**Body / Description / Long Content Font:** **Urbanist** (with system-sans fallback)
**Label / Mono Font:** System monospace (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`)

**Character:** Two families with a clear job split. **Urbanist** is a clean, modern, geometric sans — it carries descriptions, table cells, helper copy, and any long-form text that the eye has to live in. **MuseoModerno** is a higher-contrast display sans with rounded geometric forms — it carries titles and any text that should contrast with body (display heroes, headlines, card titles, section headers). The two never swap roles. A title never sets in Urbanist; a paragraph never sets in MuseoModerno. System mono is reserved for timestamps, order IDs, time-elapsed counters, and any value that should read as measurement, not as copy.

The fonts ship as Fontsource variable-font packages (`@fontsource-variable/urbanist` and `@fontsource-variable/museomoderno`) and are imported as CSS in `src/main.tsx` (`@fontsource-variable/urbanist/wght.css` and `@fontsource-variable/museomoderno/wght.css`). The variable axis supports weights 100–900 from a single woff2 file per family. Vite bundles the files — no third-party CDN at runtime, no FOUT, no privacy leak. The families are wired into Tailwind through the `--font-display`, `--font-sans` (set to `--font-body`), and `--font-mono` tokens in `src/index.css`. Components reference the tokens via Tailwind's `font-display` / `font-sans` / `font-mono` utilities — no component imports a font directly.

### Hierarchy

- **Display** (**MuseoModerno**, 800 weight, `clamp(2.5rem, 5vw, 3rem)`, line-height 1.1, tracking `-0.02em`): Page-level heroes — the design system title, a restaurant name on the top bar, anything that earns the room. Reserved for surfaces where one number or one word has to land.
- **Headline** (**MuseoModerno**, 700, 1.5rem, line-height 1.2, tracking `-0.01em`): Section headers, card titles, the lead label on a panel. The dominant text on a screen that is not a hero.
- **Title** (**MuseoModerno**, 700, 1.125rem, line-height 1.3): Within-card emphasis — the order number on an order card, the staff member's name in a list row.
- **Body** (**Urbanist**, 400, 0.875rem, line-height 1.55): Description copy, helper text, table cells, long-form content. Measure should stay inside 65–75ch where it can.
- **Label** (Urbanist 600, 0.75rem, tracking `0.04em`, often uppercase): Small UI text — buttons, table column headers, form labels, status pills. The mono sub-variant (system mono, same size and weight) is reserved for timestamps, order IDs, and measurement readouts.

### Named Rules

**The Two-Family Rule.** Two typefaces, two jobs. **Urbanist** is for descriptions, body copy, and any long-form content. **MuseoModerno** is for titles and any text that should contrast with body (display, headline, title). They never swap roles. A body paragraph in MuseoModerno is a misuse; a card title in Urbanist is a downgrade.

**The Mono-Is-Measurement Rule.** Monospace is reserved for time, IDs, and numeric readouts. Body copy in mono is a costume the system does not wear.

**The No-Raw-Family Rule.** Components do not import or reference a font family directly. They consume the `font-display`, `font-sans`, and `font-mono` Tailwind utilities, which resolve to the `--font-display`, `--font-body`, and `--font-mono` tokens. A component that hard-codes `'Urbanist'` in its style is a bug.

## Layout

The layout is a 12-column grid with a sage-tinted page background, a 6xl max-width container on showcase surfaces, and 1rem (16px) default grid gap. Density adapts by zone: the KDS is generous and touch-first, the back office is dense and data-rich, the floor is a hybrid tuned for fast keyboard and a clean read of the table at hand.

Surfaces stack by tonal layering: Sage Linen (page) → Sage Linen High (elevated card) → Linen Overlay (modal). Each level is one tonal step up — no shadow required to convey the lift on content surfaces.

**Container behavior:** A `max-w-6xl mx-auto` page frame on showcase and content surfaces; full-bleed on KDS and floor boards. The `?restaurantId=` query param is the canonical way to carry restaurant context across URLs; the in-Redux state mirrors it.

**Density:** 1rem default gap, 1.5rem card padding, 2rem panel padding. The KDS uses larger touch targets and wider gutters; the back office uses tighter rows and condensed tables.

**Responsive behavior:** The design system is mobile-web responsive via Tailwind's `repeat(auto-fit, minmax(...))` grid pattern. No mobile-specific layouts are committed yet — when KDS-grade mobile work begins, the touch-target and contrast rules from `PRODUCT.md` carry the design.

## Elevation & Depth

Elevation is hybrid. Three jobs, three treatments — never mixed.

1. **Content surfaces are flat.** Tonal layering (`Sage Linen` → `Sage Linen High` → `Linen Overlay`) carries the lift. No `box-shadow` on cards, panels, or content rows.
2. **Overlays lift with shadow + glass.** Modals, popovers, command palettes, and any element that sits on top of a busy surface gets `box-shadow` plus a `backdrop-filter: blur(24–40px)` glass treatment. Glass on a flat single-tone background is invisible — that is by design. Glass is reserved for overlays that actually need it.
3. **Status earns the glow.** The two brand-glow tokens (`shadow-glow-primary` and `shadow-glow-accent`) are reserved for in-progress states on the KDS — the urgent order that needs the line's attention. They are the only colored shadows in the system.

### Shadow Vocabulary

- **Ambient Overlay** (not yet defined in code, target: `0 8px 24px rgba(14, 20, 26, 0.08)`): Modals, popovers. The single ambient shadow.
- **Glow Primary** (`0 0 16px rgba(31, 66, 84, 0.25)` light / `0 0 20px rgba(74, 139, 152, 0.45)` dark): Tilled Teal glow. Used for KDS in-progress emphasis.
- **Glow Accent** (`0 0 16px rgba(242, 106, 58, 0.3)` light / `0 0 20px rgba(255, 138, 90, 0.5)` dark): Burnt Tangerine glow. Used for KDS ready-to-serve emphasis — the one moment the system is allowed to shout.

### Named Rules

**The Flat-By-Default Rule.** Content surfaces are flat at rest. Shadow appears only as a response to state (overlay, modal, focus), never as decoration on a card.

**The Glow-Belongs-To-Status Rule.** The brand glow is the status's voice. It is not used on buttons, icons, or marketing surfaces. A glowing button is a status pill, not a CTA.

## Shapes

The form language is softly rounded everywhere. There are no sharp corners in the system. Radii cluster into four steps, each tied to a role.

- **Control** (8px / 0.5rem) — buttons, inputs, small interactive controls. Compact, tactile, the radius of a fingertip.
- **Card** (12px / 0.75rem) — elevated cards, glass panels, surfaces that hold structured content. The default surface radius.
- **Panel** (16px / 1rem) — large panels, section blocks, gradient showcases. The radius that frames a room.
- **Pill** (999px) — status pills, tags, anything that should read as a chip. Fully rounded, never softened.

**Borders** are hairlines. 1px solid in `Linen Edge` for default separation, `Linen Edge Strong` for interactive emphasis. No 2px+ borders on content. The `border-left` / `border-right` accent stripe is reserved for status sidebars (e.g. a column in the KDS where every row carries a thin teal or tangerine left rail to read urgency at a glance) — never decorative on cards.

## Components

### Buttons

- **Shape:** Softly rounded control radius (8px / 0.5rem).
- **Primary:** Tilled Teal ground, white label. Hover deepens to Tilled Teal Hover. Used for the single affirmative action on a screen — submit, save, send.
- **Accent:** Burnt Tangerine ground, white label. Hover deepens to Burnt Tangerine Hover. Used sparingly — the moment the system needs urgency in a CTA (e.g. "Mark Ready", "Send to Kitchen").
- **Outline:** Transparent ground, Linen Edge Strong border, Carbon Ink label. Hover lifts the ground to Sage Linen High and the border to Tilled Teal. The secondary action.
- **Ghost:** Transparent ground, Muted Ink label. Hover lifts the ground to Sage Linen High and the label to Carbon Ink. The tertiary action — cancel, dismiss, anything that should not compete with the primary.
- **States:** All buttons transition color in 150ms ease. Active state uses `transform: scale(0.96)`. Focus-visible uses a 2px Tilled Teal outline with 2px offset.

### Status Pill

- **Shape:** Fully rounded pill (999px). 0.25rem / 0.7rem padding.
- **Style:** 12% tint of the service hue as the background, the full service hue as the foreground (text + dot), and a 28–34% tint as the 1px border. The pill never uses the service hue at full opacity — it whispers the status, it does not shout.
- **Dot:** 0.5rem / 8px filled circle in the foreground color, 0.4rem gap to the label. Optional via the `hideDot` prop.
- **States:** Six status variants — `new` (Tilled Teal), `acknowledged` (Hushed Teal), `preparing` (Patina Aqua), `plating` (Saffron Amber), `ready` (Burnt Tangerine), `served` (Muted Ink, terminal). The `served` state is the only one that uses the neutral palette, signaling completion.

### Card / Container

- **Corner Style:** Card radius (12px / 0.75rem).
- **Background:** Sage Linen High. No shadow.
- **Border:** Optional 1px Linen Edge Strong for emphasized cards (default off).
- **Internal Padding:** 1.5rem / 24px default, 2rem on showcase panels.
- **Internal Hierarchy:** Title in Tilled Teal (700) at the top, body in Muted Ink below, status or action in the footer.

### Theme Toggle

- **Shape:** 8px radius, 2.25rem / 36px square. The single small interactive control that is not a button.
- **Style:** Sage Linen High ground, Carbon Ink icon, Linen Edge border. Hover lifts the ground to Linen Overlay and the border to Linen Edge Strong.
- **Icon:** Inline sun (in dark mode) or moon (in light mode), 18px. No icon library.
- **Motion:** Active state uses `transform: scale(0.96)`. Transitions are 150ms for color, 100ms for transform.

### Navigation

- **Top Bar (built):** Six-slot composition at `src/components/Header/`. Restaurant name + switcher on the left, breadcrumb center-left, ops badge (floor and kitchen only) center-right, then notifications bell, theme toggle, and user menu on the right. Sage Linen ground, hairline Linen Edge bottom border, fixed at the top of every zone layout. The bell and ops badge subscribe to live state (Redux + RTK Query + SignalR) once the wiring layer lands. The component is a controlled prop API today; mock data lives in `src/components/Header/mockData.ts` for the design-system showcase. Implementation and full surface brief at `.impeccable/surfaces/header.md`.
- **Zone Sidebars (declared, not yet built):** Each zone has its own sidebar; switching zones replaces the sidebar entirely. Sage Linen High ground, 240px width, Linen Edge right border. Active item: Tilled Teal label, Linen Edge Strong left rail. Inactive item: Muted Ink label.

## Do's and Don'ts

### Do:

- **Do** consume colors by semantic name (`bg-primary`, `text-ink`, `border-border-subtle`) via Tailwind utilities. Components reference tokens, not raw hex.
- **Do** use Burnt Tangerine sparingly — on ≤10% of any given screen. Reserve it for urgency: in-progress states, "Mark Ready" CTAs, the ready flow gradient.
- **Do** let the service hue gradient tell the order story. Cool gradient (Tilled Teal → Hushed Teal → Patina Aqua) for received/acknowledged/preparing. Warm gradient (Sage Linen → Saffron Amber → Burnt Tangerine) for plating/ready.
- **Do** layer surfaces by tone, not by shadow. Sage Linen (page) → Sage Linen High (card) → Linen Overlay (modal). One tonal step up, no shadow.
- **Do** reach for glass effects on overlays that sit on busy backgrounds. Glass on a flat single-tone background is invisible; do not force it.
- **Do** set body, descriptions, and long-form content in **Urbanist**; set titles, display, headline, and any contrasting text in **MuseoModerno**. The two never swap roles.
- **Do** consume fonts via the `font-display` / `font-sans` / `font-mono` Tailwind utilities (which resolve to the `--font-display` / `--font-body` / `--font-mono` tokens). Do not reference a font family directly inside a component.
- **Do** keep body measure inside 65–75ch where it can.
- **Do** treat the five service hues as a closed set owned by order status. They do not appear in charts, illustrations, or marketing.

### Don't:

- **Don't** use pure white on a content page. The page background is Sage Linen (`#EFF1ED` light / `#0E141A` dark). Reserve `#FFFFFF` / `#1C2832` for Linen Overlay — modals and popovers only.
- **Don't** put Burnt Tangerine on a button unless the action is urgent. A tangerine CTA must earn the right to shout.
- **Don't** use colored shadows on buttons, icons, or marketing surfaces. The brand glow is the status's voice.
- **Don't** set body copy in **MuseoModerno** or titles in **Urbanist**. The two families have one job each. **The Two-Family Rule** binds the role split.
- **Don't** introduce a third typeface. Two families is the system. A third is a different visual world, not a refinement.
- **Don't** put a 1px+ colored `border-left` or `border-right` on cards, list items, callouts, or alerts as decoration. The only allowed colored rail is the sidebar active-item indicator.
- **Don't** split the source of truth. If a color is in `colors.X` in the frontmatter, the CSS variable and the TypeScript constant point to the same value. Tokens are the contract.
- **Don't** use `style={{}}` for static styling on JSX. Reach for a Tailwind utility or a class in a colocated `.css` file. The only acceptable inline-style exception is dynamic values that cannot be expressed in CSS (e.g. computed transforms, refs to `getBoundingClientRect()`).
- **Don't** invent a typography hierarchy outside the five-step scale. Display, Headline, Title, Body, Label — no seventh step.
