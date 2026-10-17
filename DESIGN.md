---
name: Orderly Admin Panel
description: A staff-facing operations console for restaurant teams — real-time, role-based, three-zone.
colors:
  primary: "#0F172A"
  primary-hover: "#1E293B"
  primary-foreground: "#F8FAFC"
  accent: "#EA580C"
  accent-hover: "#C2410C"
  accent-foreground: "#FFFFFF"
  ink: "#0F172A"
  ink-muted: "#475569"
  ink-subtle: "#64748B"
  surface: "#F1F5F9"
  surface-elevated: "#FFFFFF"
  surface-overlay: "#FFFFFF"
  border-subtle: "#E2E8F0"
  border-strong: "#94A3B8"
  service-deep: "#1D4ED8"
  service-teal: "#0284C7"
  service-aqua: "#0D9488"
  service-amber: "#D97706"
  service-tangerine: "#EA580C"
  success: "#059669"
  warning: "#D97706"
  danger: "#DC2626"
  info: "#0284C7"
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
  control: "6px"
  card: "8px"
  panel: "10px"
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

**Creative North Star: "The Stainless Line" (Sleek Industrial Kitchen)**

"The Stainless Line" embodies the surgical precision, high heat, and uncompromising hygiene of a modern Michelin-star culinary line. Surfaces emulate brushed stainless steel, cold-rolled titanium, and cast iron under task lighting. Gone is the muted sage-green palette; in its place is a high-contrast, razor-sharp operational environment engineered for distance readability, fast decisions, and high-heat ticket throughput.

Status is the visual hero. Every screen is engineered so that the state of an order, a station, or a ticket can be read instantly across the pass: cold station blue (`#1D4ED8`), station-accepted cyan (`#0284C7`), range teal (`#0D9488`), sauté amber (`#D97706`), and searing induction flame (`#EA580C`).

**Key Characteristics:**

- **Two high-performance themes.**
  - **Light Theme (Day Prep & Pass):** Crisp brushed stainless steel (`#F1F5F9`), surgical porcelain cards (`#FFFFFF`), cold smoked graphite ink (`#0F172A`), and machined hairline borders (`#E2E8F0`).
  - **Dark Theme (Night Shift & Cast Iron):** Deep cast iron carbon (`#0B0F14`), smoked titanium elevated panels (`#141B22`), polished chrome text (`#F8FAFC`), laser-precise cyan primary CTAs (`#38BDF8`), and electric induction flame accents (`#FB923C`).
- **Machined, industrial geometry.** Tightly chamfered 6px controls and 8px cards replace soft bubbly radii, conveying surgical instrument precision.
- **Searing heat for urgency.** Induction flame orange is reserved for the active pass, fire orders, and critical CTAs (≤10% of any view).
- **Two type families with monospace telemetry.** Urbanist for high-efficiency reading; MuseoModerno for impactful station titles; system mono for ticket timers, table tokens, and order IDs.

## Colors

The palette is anchored in raw industrial kitchen materials: brushed stainless, titanium sheet, cold cast iron, and induction heat.

### Primary

- **Gunmetal Steel (Light: `#0F172A`) / Cyan-Steel (Dark: `#38BDF8`):** Uncompromising contrast and clarity. Primary actions, active navigation states, and focus rings.
- **Primary Hover (`#1E293B` / dark `#7DD3FC`):** Tactile mechanical response on hover/press.

### Accent

- **Induction Flame Orange (`#EA580C` / dark `#FB923C`):** High-heat urgency. Plating, ready tickets, callouts, and urgent CTAs.
- **Accent Hover (`#C2410C` / dark `#FDBA74`):** Intense ember hover.

### Neutral

- **Smoked Graphite Ink (`#0F172A` / dark `#F8FAFC`):** Primary text with razor-sharp contrast.
- **Muted Slate Ink (`#475569` / dark `#94A3B8`):** Descriptions, metadata, and ticket details.
- **Subtle Wire Ink (`#64748B` / dark `#64748B`):** Timestamps, elapsed time labels, tertiary text.
- **Stainless Surface (`#F1F5F9` / dark `#0B0F14`):** Page background. Cool brushed steel in light; deep dense cast iron in dark.
- **Stainless Elevated (`#FFFFFF` / dark `#141B22`):** Cards, station containers, tables.
- **Stainless Overlay (`#FFFFFF` / dark `#1C2530`):** Modals, popovers, flyouts.
- **Machined Hairline Border (`#E2E8F0` / dark `#212C37`):** Precision 1px dividers.
- **Brushed Strong Border (`#94A3B8` / dark `#374756`):** Control perimeters, interactive outlines.

### Service Hues (5-Stop Kitchen Line Sequence)

1. **Cold Station Blue** (`#1D4ED8` / dark `#60A5FA`): New ticket placed, untouched.
2. **Station Cyan** (`#0284C7` / dark `#38BDF8`): Acknowledged & claimed by line cook.
3. **Line Teal** (`#0D9488` / dark `#2DD4BF`): In preparation, calm rhythm.
4. **Range Amber** (`#D97706` / dark `#FBBF24`): Plating & finishing touches.
5. **Induction Flame** (`#EA580C` / dark `#FB923C`): Ready for runner / hot pass.

### Semantic States

- **Clean Station Emerald** (`#059669` / dark `#34D399`): Success, verified orders.
- **Range Amber** (`#D97706` / dark `#FBBF24`): Warnings, modifiers, dietary alerts.
- **Flame Red** (`#DC2626` / dark `#F87171`): Voids, 86'd items, critical errors.
- **Console Cyan** (`#0284C7` / dark `#38BDF8`): Info, notices.

### Gradients

- **`bg-gradient-service-cool`**: Cold Station Blue → Station Cyan → Line Teal.
- **`bg-gradient-service-warm`**: Surface Stainless → Range Amber → Induction Flame.
- **`bg-gradient-primary`**: Gunmetal Steel → Induction Flame.

### Named Rules

**The Service-Flow Rule.** Service hues belong strictly to order status. They never appear as meaningless decoration.
**The High-Heat Rule.** Induction Flame appears on ≤10% of any screen for maximum contrast and instantaneous glanceability.
**The Machined-Edge Rule.** Hairline 1px borders define structure cleanly. No fuzzy or muddy drop-shadows on flat work surfaces.

## Typography

- **Display / Headline / Title:** MuseoModerno (bold geometric presence for station titles and headers).
- **Body / Content:** Urbanist (clean geometric sans with crisp legibility).
- **Label / Telemetry:** System monospace (timestamps, ticket elapsed counters, order IDs, table numbers).

## Elevation & Depth

1. **Flat & Machined Surfaces.** Tonal steps define hierarchy without artificial drop shadows.
2. **Subtle Inset Highlights.** Dark mode panels leverage hairline inset borders (`rgba(255, 255, 255, 0.05)`) mimicking chamfered metallic edges.
3. **Induction Glows.** Glow is strictly reserved for urgent/hot-pass KDS orders (`shadow-glow-accent`) and active station focus (`shadow-glow-primary`).

## Shapes

- **Control:** 6px (0.375rem) — machined, tactile, precision feel.
- **Card:** 8px (0.5rem) — structured order tickets and data cards.
- **Control:** 6px (0.375rem) — machined, tactile, precision feel.
- **Card:** 8px (0.5rem) — structured order tickets and data cards.
- **Panel:** 10px (0.625rem) — section containers and operational bays.
- **Pill:** 999px — ticket badges, station pills.

## Components

### Buttons

- **Shape:** Machined control radius (6px / 0.375rem) with crisp tactile response.
- **Primary:** Gunmetal Steel (`#0F172A`) in light mode; high-contrast Cyan-Steel (`#38BDF8`) in dark mode. Used for the single affirmative action on a screen — submit, save, fire order.
- **Accent:** High-heat Induction Orange (`#EA580C` light / `#FB923C` dark). Used for high-heat kitchen actions — "Fire Ticket", "Mark Ready".
- **Outline:** Transparent ground, Brushed Strong border, Smoked Graphite label.
- **Ghost:** Transparent ground, Muted Slate label. Tertiary action — cancel, dismiss.
- **States:** 150ms ease transition. Active state uses `transform: scale(0.97)` for mechanical tactile feedback. Focus-visible uses a 2px Gunmetal/Cyan ring with 2px offset.

### Status Pill / Badge

- **Shape:** Fully rounded pill (999px) or precision ticket badge.
- **Style:** 12% tint of the service hue as background, full service hue foreground, 30% border.
- **Dot:** 0.5rem (8px) filled LED indicator.
- **States:** Six status variants: `new` (Cold Station Blue), `acknowledged` (Station Cyan), `preparing` (Line Teal), `plating` (Range Amber), `ready` (Induction Flame), `served` (Muted Slate).

### Card / Container

- **Corner Style:** Machined card radius (8px / 0.5rem).
- **Background:** Crisp Stainless Elevated (`#FFFFFF` light / `#141B22` dark) with hairline border (`#E2E8F0` / `#212C37`).
- **Internal Padding:** 1.5rem default.
- **Internal Hierarchy:** Title in `text-ink font-bold` or `text-primary font-bold` at the top, telemetry/elapsed timer in monospace, content in `text-ink-muted`.

### Theme Toggle

- **Shape:** 6px radius, 2.25rem / 36px square.
- **Style:** Stainless Elevated ground, Smoked Graphite icon, Hairline border. Hover lifts to Stainless Overlay with Strong border.

### Navigation

- **Top Bar:** Fixed at the top of every zone layout. Crisp brushed stainless ground (`#F1F5F9` light / `#0B0F14` dark) with 1px hairline bottom border (`#E2E8F0` / `#212C37`).
- **Zone Sidebars:** Stainless elevated surface, 240px width, hairline right border. Active item: Primary label with subtle left indicator rail.

## Do's and Don'ts

### Do:

- **Do** consume colors by semantic name (`bg-primary`, `text-ink`, `border-border-subtle`) via Tailwind utilities.
- **Do** use Induction Flame Orange sparingly — on ≤10% of any given screen.
- **Do** let the service hue sequence tell the kitchen story: Cold Station Blue → Station Cyan → Line Teal → Range Amber → Induction Flame.
- **Do** layer surfaces by tone and crisp hairline borders rather than heavy fuzzy drop shadows.
- **Do** use monospace for time, tickets, table numbers, and quantities.
- **Do** maintain high contrast in both day shift (light) and night shift (dark) environments.

### Don't:

- **Don't** reintroduce muddy olive/sage tones. Surfaces are clean brushed stainless steel and cast iron.
- **Don't** use bubbly, oversized border radii. Keep corners machined and tight (6px–8px).
- **Don't** use colored drop-shadows except for the active station glow and hot-pass urgency glow.
- **Don't** set body copy in MuseoModerno or titles in Urbanist. The Two-Family Rule binds the role split.
