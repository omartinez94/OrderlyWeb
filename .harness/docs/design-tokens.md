# Design Tokens

Tailwind tokens for the Orderly Admin Panel. All status colors, spacing, and
typography live here — never hardcode hex in components.

Source of truth for the visual design: [`docs/website-spec.md`](../website-spec.md) §6.

## Status colors (Order / Order Status)

Per `docs/website-spec.md` §6.4. Each status has a background, foreground, and
border token. Use the `<StatusBadge>` primitive from `src/components/ui/` — don't
hand-roll `<span>`s.

| Status | Background | Foreground | Border | Hex (reference) |
|---|---|---|---|---|
| `ordering`, `pending` | `bg-status-ordering` | `text-status-ordering-fg` | `border-status-ordering` | Blue |
| `confirmed` | `bg-status-confirmed` | `text-status-confirmed-fg` | `border-status-confirmed` | Orange |
| `preparing` | `bg-status-preparing` | `text-status-preparing-fg` | `border-status-preparing` | Yellow |
| `ready` | `bg-status-ready` | `text-status-ready-fg` | `border-status-ready` | Green |
| `delivered` | `bg-status-delivered` | `text-status-delivered-fg` | `border-status-delivered` | Teal |
| `completed` | `bg-status-completed` | `text-status-completed-fg` | `border-status-completed` | Gray |
| `cancelled` | `bg-status-cancelled` | `text-status-cancelled-fg` | `border-status-cancelled` | Red |
| `on_hold` | `bg-status-on-hold` | `text-status-on-hold-fg` | `border-status-on-hold` | Purple |

WCAG AA contrast minimum enforced at the token level (foreground picked to hit
≥4.5:1 against background).

## Kitchen time indicators (KDS)

Per `docs/website-spec.md` §6.5. Apply via the dedicated `<KitchenTimer>`
component — never inline `setInterval` with raw color logic in feature code.

| Condition | Color | Token | Meaning |
|---|---|---|---|
| `orderAge < prepTime × 0.8` | 🟢 Green | `kitchen-timer-ok` | On track |
| `prepTime × 0.8 ≤ orderAge < prepTime` | 🟡 Yellow | `kitchen-timer-warn` | Approaching deadline |
| `orderAge ≥ prepTime` | 🔴 Red | `kitchen-timer-overdue` | Overdue |

The boundary at exactly `0.8×` is **inclusive of warn** (red threshold is
inclusive of overdue). The `<KitchenTimer>` component owns the boundary logic;
write tests against the boundary cases, not the implementation.

## KDS layout constraints

Hard requirements — kitchen ops, not nice-to-haves:

- **Full-screen only** (kiosk mode on `/site/kitchen`). No scrolling on the
  order queue viewport.
- **High contrast** — WCAG AA minimum, AAA preferred for kitchen lighting.
- **Touch targets ≥44×44px** (kitchen gloves, wet hands).
- **Monospace font for timers** (`font-mono` token, e.g. JetBrains Mono).
- **No animations on KDS** — kitchen staff are scanning, not admiring.
- **Sound alerts** are opt-in via KDS settings page; uses Web Audio API, gated
  by user preference.

## Typography

| Token | Use | Reference |
|---|---|---|
| `font-sans` | Body, UI | Inter (default Tailwind) |
| `font-mono` | Timers, order numbers, IDs | JetBrains Mono or system mono |
| `text-xs` | Helper text, badges | 0.75rem |
| `text-sm` | Default body | 0.875rem |
| `text-base` | Emphasized body | 1rem |
| `text-lg` | Page section headers | 1.125rem |
| `text-xl` | Page titles | 1.25rem |
| `text-2xl` | Zone landing headers | 1.5rem |

## Spacing

Default Tailwind scale. Common KDS-specific overrides:

- `p-kds-card` — generous card padding for touch (1.5rem / `p-6`)
- `gap-kds-grid` — gap between KDS queue items (1rem / `gap-4`)

## Responsive shell breakpoints

| Breakpoint | Min-width | Behavior |
|---|---|---|
| Mobile | 0 | (Out of scope for MVP — admin tools are tablet+) |
| Tablet | 768px | Collapsible sidebar, top bar persists |
| Desktop | 1280px | Full sidebar + top bar |
| KDS | any | Sidebar hidden; only restaurant name + connection status + user menu in top bar |

## Dark mode

Not in MVP scope (`docs/website-spec.md` §12 open question). If added later,
all status tokens must be re-checked for contrast against the dark surface.

## Adding a new token

1. Add the token to `tailwind.config.ts` with the WCAG-AA-compliant pair.
2. Add a row to this table (don't leave docs out of sync with code).
3. If it's a status color → wire it into `<StatusBadge>`'s lookup table.
4. If it's a KDS color → wire it into `<KitchenTimer>`'s threshold logic.
5. Run `pnpm lint` and `pnpm test` before committing.