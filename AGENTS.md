# AGENTS.md

Orderly Admin Panel — staff-facing web app for restaurant operators (admin, kitchen, restaurant zones). Frontend companion to the Orderly Microservices backend (sibling repo).

> **Status:** Pre-implementation. Spec is the source of truth: [`docs/website-spec.md`](docs/website-spec.md) and [`docs/backend-architecture/architecture.md`](docs/backend-architecture/architecture.md).

## Setup commands

- Install deps: `pnpm install`
- Start dev:    `pnpm dev`               # Vite dev server (default port 5173)
- Build:        `pnpm build`             # Vite production build → `dist/`
- Preview:      `pnpm preview`
- Test:         `pnpm test`              # Vitest (unit/component)
- E2E test:     `pnpm test:e2e`          # Playwright
- Lint:         `pnpm lint`              # ESLint + Prettier
- Typecheck:    `pnpm typecheck`         # `tsc --noEmit`

> Scripts above are the **target** layout once `package.json` is scaffolded. Until then, bootstrap per the spec in `docs/website-spec.md` §11.

## Project layout

```
docs/                          # Specs & reference (already present)
  website-spec.md              # Frontend spec — source of truth for behavior
  backend-architecture/        # Backend contracts (architecture, DB model)
src/                           # App source (to be scaffolded)
  app/                         # Redux store, typed hooks
  features/                    # auth, orders, staff, restaurant (feature-sliced)
  components/                  # Layout, ui, RealTime (SignalR provider)
  lib/                         # apiClient, signalr, constants
  pages/                       # Route-level components
  types/                       # TS interfaces mirroring backend DTOs
  utils/                       # Formatters, validators
.harness/                      # AI agent team (this file's sibling)
  agent.md                     # Orchestrator (Harness) routing brain
  reins/                       # Project reins — developer, tester, …
  docs/                        # Shared standards linked from reins
```

## Code style

- TypeScript strict mode (`tsconfig.json: strict: true`); no `any` outside generated DTO shims
- React 19 functional components only; no class components
- Redux Toolkit slices + RTK Query for all server state (no ad-hoc `fetch`)
- **Styling rules**:
  - TailwindCSS for layout / spacing / responsive utilities only — not utility-first across the board. Component-specific styles (colors, complex hover states, animations, glass effects, brand-specific looks) live in `.css` files, colocated per-component or per-feature.
  - HeadlessUI for unstyled interactive primitives.
  - **No inline `style={{}}` on JSX** — always reach for a Tailwind utility class or a class defined in a `.css` file. The only acceptable exception is dynamic values that cannot be expressed in CSS (e.g. computed transforms, refs to `getBoundingClientRect()`); these should still be documented with a comment.
  - Enforce with ESLint: `react/forbid-component-props` with `forbid: ["style"]` (eslint-plugin-react).
- Prettier: 2-space indent, single quotes, 100-char width, trailing commas
- ESLint: `@typescript-eslint`, `react-hooks`, `jsx-a11y` rules enabled
- Run `pnpm lint --fix` before committing

## Design system

The visual system is locked in. Two themes, one source of truth in `src/index.css` and `src/lib/tokens.ts`. All tokens are exposed as Tailwind utilities via `@theme inline`, so components reference them by semantic name (`bg-primary`, `text-ink`, `bg-gradient-service-cool`, etc.) — never by raw hex. Hex values live in tokens only.

### Brand tokens

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `primary` | `#1F4254` | `#4A8B98` | Deep blue-teal — primary CTAs, active nav, links |
| `accent` | `#F26A3A` | `#FF8A5A` | Tangerine — in-progress states, urgent CTAs |
| `ink` | `#0E141A` | `#ECF0F2` | Body text |
| `surface` | `#EFF1ED` | `#0E141A` | Page background — **sage-tinted in light** (the only off-white surface color; no pure white anywhere in the system) |
| `surface-elevated` | `#F6F8F4` | `#152028` | Card backgrounds |
| `surface-overlay` | `#FFFFFF` | `#1C2832` | Modals, popovers |
| `border-subtle` | `#D8DED5` | `#1F2A33` | Hairline borders |
| `border-strong` | `#B8C0B2` | `#2F3D48` | Emphasized borders |

### Service hues (status / order flow)

5 stops. Each maps to one of the order statuses in the `StatusPill` component, and the two gradients below are subsets of these.

| Token | Light | Dark | StatusPill label |
|---|---|---|---|
| `service-deep` | `#1F4254` | `#4A8B98` | `new` |
| `service-teal` | `#4A8B98` | `#6BA5B0` | `acknowledged` |
| `service-aqua` | `#7AB89E` | `#98C9B0` | `preparing` |
| `service-amber` | `#E8A340` | `#F0B560` | `plating` |
| `service-tangerine` | `#F26A3A` | `#FF8A5A` | `ready` |

### Gradients (max 3 colors each)

| Utility | Stops | Use case |
|---|---|---|
| `bg-gradient-service-cool` | `deep → teal → aqua` | Received/acknowledged/preparing flow (KDS calm state) |
| `bg-gradient-service-warm` | `surface → amber → tangerine` | Plating/ready flow (KDS urgent state, "your food is on its way") |
| `bg-gradient-primary` | `primary → accent` | Brand signature, hero sections |

### Theme switching

- `useTheme()` hook (`src/hooks/useTheme.ts`) returns `{ mode, resolvedTheme, setMode, toggle }`
- Modes: `light` / `dark` / `system` (default)
- Persists to `localStorage` under `orderly-theme`
- Applies via `data-theme` attribute on `<html>` — every Tailwind utility that references a token repaints with zero JS re-render
- When `mode === 'system'`, listens to `prefers-color-scheme` via `matchMedia` and re-applies on OS-level change
- `<ThemeToggle />` component (`src/components/ThemeToggle/`) is a sun/moon button for manual flip

## Three-zone architecture

The app is split into three top-level zones, each with its own sidebar:

| Zone | Path prefix | Audience | MVP scope |
|---|---|---|---|
| `/site/admin` | Admin-level | SuperAdmin, RestaurantAdmin, Manager | Staff Management |
| `/site/kitchen` | KDS | KitchenManager, KitchenStaff | Order queue + prep status |
| `/site/restaurant` | Operations | Manager, Waiter, Cashier, Host | Orders (list, detail, create, split-bill) |

Root `/` redirects authenticated users to their default zone by role. Role-based route guards live in `src/components/Layout/`. See `docs/website-spec.md` §4 and §4.3 for the full access matrix.

## Backend integration

| Service | Port | Frontend responsibility |
|---|---|---|
| API Gateway (Ocelot) | 5000 | Single base URL — all RTK Query hits this |
| Identity | 5007 | Auth (login, refresh, logout, users, roles) |
| Catalog | 5001 | Restaurants, tables, menu (categories, items) |
| Order | 5004 | Orders, reservations, queue, modifications |
| Basket | 5003 | Price calc (Redis-backed) |
| Discount | 5002 | Promo/reward codes |
| Kitchen | 5005 | KDS aggregation |
| Notification | 5006 | Push notifications, feedback |

- Base URL: `VITE_API_BASE_URL` (default `http://localhost:5000`)
- SignalR hubs: `/hubs/orders`, `/hubs/notifications` (URL: `VITE_SIGNALR_URL`)
- Auth: JWT access token (15-min TTL, **memory only**) + httpOnly refresh cookie (7-day)
- Auto-refresh on 401 via `src/lib/apiClient.ts` interceptor

For endpoint contracts and JWT claims shape, see `docs/backend-architecture/architecture.md`. For status enum, modification approval flow, and KDS time-color logic, see `docs/website-spec.md` §5.4, §6.4, §6.5.

## Testing instructions

- Unit: `pnpm test` (Vitest + React Testing Library) — colocate as `*.test.ts(x)` next to source
- E2E: `pnpm test:e2e` (Playwright) — flows in `e2e/` (login, role-based routing, order create, bill split)
- Add tests for every new feature; mock RTK Query endpoints, never hit the real backend in CI
- All tests + typecheck must pass before opening a PR

## PR & commit conventions

- Branch from `main`; never push to `main` directly
- Commit message: conventional commits (`feat:` / `fix:` / `docs:` / `refactor:` / `test:` / `chore:`)
- PR title mirrors commit; body references the spec section it implements (`§5.4 Orders`)
- Open PR via `gh pr create` once CI is green
- Keep PRs scoped to one feature module when practical — easier review, easier rollback

## Security

- Never commit secrets — `.env*` is gitignored; only `.env.example` ships
- JWT access token lives in Redux memory only — never localStorage / sessionStorage
- All auth flows route through the API Gateway (`http://localhost:5000`) — never call Identity Service directly
- User-input that lands in URLs passes through `encodeURIComponent`; nothing user-controlled hits the DOM as HTML
- CORS is the backend's problem; frontend trusts `VITE_API_BASE_URL` blindly in dev