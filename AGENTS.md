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
- TailwindCSS utility-first; HeadlessUI for unstyled interactive primitives
- Prettier: 2-space indent, single quotes, 100-char width, trailing commas
- ESLint: `@typescript-eslint`, `react-hooks`, `jsx-a11y` rules enabled
- Run `pnpm lint --fix` before committing

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