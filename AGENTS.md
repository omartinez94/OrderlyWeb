# AGENTS.md

Orderly Admin Panel — staff-facing web app for restaurant operators (admin, kitchen, restaurant zones). Frontend companion to the Orderly Microservices backend (sibling repo).

> **Status:** Pre-implementation. Spec is the source of truth: [`docs/website-spec.md`](docs/website-spec.md) and [`docs/backend-architecture/architecture.md`](docs/backend-architecture/architecture.md).

## Setup commands

- Install deps: `pnpm install`
- Start dev: `pnpm dev` # Vite dev server (default port 5173)
- Build: `pnpm build` # Vite production build → `dist/`
- Preview: `pnpm preview`
- Test: `pnpm test` # Vitest (unit/component)
- E2E test: `pnpm test:e2e` # Playwright
- Lint: `pnpm lint` # oxlint
- Format: `pnpm format` # oxfmt --write
- Format check: `pnpm format:check` # oxfmt --check (CI + pre-commit)
- Typecheck: `pnpm typecheck` # `tsc --noEmit`

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
- **Navigation** — Always use `useNavigateWithTransition()` from `src/hooks/useNavigateWithTransition.ts` instead of `useNavigate()` from `react-router` for _user-initiated, non-urgent_ navigation (brand click, restaurant switch, breadcrumb segment click). The hook wraps `navigate()` in `startTransition` so navigation does not block the next user interaction. Use plain `useNavigate()` only for imperative redirects that must complete before the next render (e.g. login → default-zone redirect).
- **Date & Time Formatting** — Always use `date-fns` via the central utility file [`src/utils/date.ts`](file:///C:/Users/omar_/Source/Repos/kalaa/orderly/OrderlyWeb/src/utils/date.ts) (`formatRelativeTime`, `formatDate`). **Do not** hand-roll custom date/time difference calculations or bring in third-party date packages like `moment` or `dayjs`.
- Format (oxfmt — see `.oxfmtrc.json`): 2-space indent, **double quotes**, 100-char width, trailing commas, LF line endings, built-in Tailwind class sorting. Editor defaults (`.editorconfig`, `.vscode/settings.json`) match. The agent-side format hook lives in `.claude/settings.json`.
- Lint (oxlint — see `.oxlintrc.json`): `react`, `typescript`, `oxc` plugins. (`@typescript-eslint`, `react-hooks`, `jsx-a11y` equivalents are tracked in the Shared Conventions plan §6.5; oxfmt class-sort replaces the ESLint style rule.)
- Run `pnpm format` and `pnpm lint` before committing. The pre-commit hook (Phase 2) and CI (`pnpm format:check`) catch anything that slips past.
- When creating a new base component it is mandatory to use the skill called Shadcn (/shadcn-ui)
- **Icons**:
  - All icons **must** come from `lucide-react` — the project's icon library, declared in `package.json`. Import named exports (e.g. `import { ChevronRight } from "lucide-react"`) and size/color them via `className` (e.g. `className="h-4 w-4 text-ink"`).
  - **Do not** hand-roll SVG icons, inline `<svg>` markup, or substitute emojis for icons in user-facing UI.
  - The only exception is an explicit request in a plan or the current prompt — otherwise, find the closest match in lucide and surface the gap if none exists.

## Base component library (mandatory)

All interactive surfaces — buttons, inputs, selects, dialogs, tables, dropdowns, tooltips, breadcrumbs, toasts, anything the user can click or focus — **must** consume the primitives in `src/components/ui/`. The full plan lives at `.agents/plans/base-components/base-component-library.md`; the lazy-loaded showcase at `?showcase=1` in development is the visual contract.

The adoption contract:

- **Do not** hand-roll a button, input, dialog, tooltip, or table. Add or extend a primitive in `src/components/ui/` instead, themed to the Orderly tokens.
- **Do not** introduce a second component library. Radix UI (via the shadcn install path) is the single source of interactive primitives; cmdk is the single source for the command palette; Sonner is the single source for toasts. New primitives must fit one of these or extend an existing one.
- **Do not** bypass the theme system. The shadcn CSS variables in `src/index.css` already alias the Orderly tokens; use `bg-primary`, `text-ink`, `border-border-subtle`, etc. — never raw hex, never literal font families, never inline `style={{}}` for static values.
- **Do not** add a base component without a Vitest + jest-axe test that covers its open/closed states and the keyboard contract documented in the plan.
- **Do not** commit a base component that does not pass `pnpm ui:check` (typecheck + lint + a11y tests + Playwright axe).

When in doubt, open `?showcase=1` in the dev server and check what the primitive looks like there — the showcase is the single source of truth.

## Design system

The visual system is locked in. Two themes, one source of truth in `src/index.css` and `src/lib/tokens.ts`. All tokens are exposed as Tailwind utilities via `@theme inline`, so components reference them by semantic name (`bg-primary`, `text-ink`, `bg-gradient-service-cool`, etc.) — never by raw hex. Hex values live in tokens only.

### Brand tokens

| Token              | Light     | Dark      | Purpose                                                                                                             |
| ------------------ | --------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `primary`          | `#1F4254` | `#4A8B98` | Deep blue-teal — primary CTAs, active nav, links                                                                    |
| `accent`           | `#F26A3A` | `#FF8A5A` | Tangerine — in-progress states, urgent CTAs                                                                         |
| `ink`              | `#0E141A` | `#ECF0F2` | Body text                                                                                                           |
| `surface`          | `#EFF1ED` | `#0E141A` | Page background — **sage-tinted in light** (the only off-white surface color; no pure white anywhere in the system) |
| `surface-elevated` | `#F6F8F4` | `#152028` | Card backgrounds                                                                                                    |
| `surface-overlay`  | `#FFFFFF` | `#1C2832` | Modals, popovers                                                                                                    |
| `border-subtle`    | `#D8DED5` | `#1F2A33` | Hairline borders                                                                                                    |
| `border-strong`    | `#B8C0B2` | `#2F3D48` | Emphasized borders                                                                                                  |

### Service hues (status / order flow)

5 stops. Each maps to one of the order statuses in the `StatusPill` component, and the two gradients below are subsets of these.

| Token               | Light     | Dark      | StatusPill label |
| ------------------- | --------- | --------- | ---------------- |
| `service-deep`      | `#1F4254` | `#4A8B98` | `new`            |
| `service-teal`      | `#4A8B98` | `#6BA5B0` | `acknowledged`   |
| `service-aqua`      | `#7AB89E` | `#98C9B0` | `preparing`      |
| `service-amber`     | `#E8A340` | `#F0B560` | `plating`        |
| `service-tangerine` | `#F26A3A` | `#FF8A5A` | `ready`          |

### Gradients (max 3 colors each)

| Utility                    | Stops                         | Use case                                                         |
| -------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| `bg-gradient-service-cool` | `deep → teal → aqua`          | Received/acknowledged/preparing flow (KDS calm state)            |
| `bg-gradient-service-warm` | `surface → amber → tangerine` | Plating/ready flow (KDS urgent state, "your food is on its way") |
| `bg-gradient-primary`      | `primary → accent`            | Brand signature, hero sections                                   |

### Theme switching

- `useTheme()` hook (`src/hooks/useTheme.ts`) returns `{ mode, resolvedTheme, setMode, toggle }`
- Modes: `light` / `dark` / `system` (default)
- Persists to `localStorage` under `orderly-theme`
- Applies via `data-theme` attribute on `<html>` — every Tailwind utility that references a token repaints with zero JS re-render
- When `mode === 'system'`, listens to `prefers-color-scheme` via `matchMedia` and re-applies on OS-level change
- `<ThemeToggle />` component (`src/components/ThemeToggle/`) is a sun/moon button for manual flip

### Internationalization (i18n) & Language switching

- **Mandate for Agents & Developers**: All user-facing UI text must be localized in both English (`en`) and Spanish (`es`) using `react-i18next`. **No hardcoded text strings in JSX/TSX**.
- **Plan reference**: `.agents/plans/i18n-localization.md`
- Key persistence: `orderly-language` in `localStorage` (`en` / `es`).
- Auto-detection: Checks `orderly-language` first, falls back to `navigator.language`, then default `'en'`.
- Dynamic DOM attribute: Syncs `<html lang="...">` synchronously via pre-hydration script in `index.html` and at runtime.
- Backend API propagation: `Accept-Language` header automatically attached to RTK Query requests (`src/lib/apiClient.ts`).
- **Currency & numbers**: All monetary values (prices, totals, tips, split-bill amounts) must be formatted via `formatCurrency(amount, currency, locale)` from `src/utils/currency.ts`, which wraps `Intl.NumberFormat`. **Never** concatenate `"$"` or any currency symbol manually. The currency code (ISO 4217, e.g. `"USD"`, `"MXN"`) comes from the restaurant's Catalog API record in Redux — never hardcoded.
- **Plural forms**: Any string wrapping a count (items, orders, guests) must use i18next `count` interpolation so the correct plural form is selected per locale.
- Testing: Component unit tests and Playwright E2E tests must verify key UI flows operate cleanly under both `en` and `es` locales.


## Three-zone architecture

The app is split into three top-level zones, each with its own sidebar:

| Zone               | Path prefix | Audience                             | MVP scope                                 |
| ------------------ | ----------- | ------------------------------------ | ----------------------------------------- |
| `/site/admin`      | Admin-level | SuperAdmin, RestaurantAdmin, Manager | Staff Management                          |
| `/site/kitchen`    | KDS         | KitchenManager, KitchenStaff         | Order queue + prep status                 |
| `/site/restaurant` | Operations  | Manager, Waiter, Cashier, Host       | Orders (list, detail, create, split-bill) |

Root `/` redirects authenticated users to their default zone by role. Role-based route guards live in `src/components/Layout/`. See `docs/website-spec.md` §4 and §4.3 for the full access matrix.

## Backend integration

| Service            | Gateway path prefix  | Upstream port | Frontend responsibility                                                           |
| ------------------ | -------------------- | ------------- | --------------------------------------------------------------------------------- |
| API Gateway (YARP) | —                    | 6004          | Single base URL — all RTK Query hits this                                         |
| Identity           | `/identity-api/`     | 6007          | Auth (login, refresh, logout, users, roles, `getUserRestaurants`)                 |
| Catalog            | `/catalog-api/`      | 5001          | Restaurants, tables, menu (categories, items)                                     |
| Order              | `/order-api/`        | 5004          | Orders, reservations, queue, modifications                                        |
| Basket             | `/basket-api/`       | 5003          | Price calc (Redis-backed)                                                         |
| Discount           | `/discount-api/`     | 5002          | Promo/reward codes                                                                |
| Kitchen            | `/kitchen-api/`      | 5005          | KDS aggregation + SignalR hub (`/kitchen-api/hubs/kitchen`)                       |
| Notification       | `/notification-api/` | 5006          | Notifications inbox (REST). Live push delivery is **not** part of the foundation. |

Upstream ports (the third column) are **gateway-internal**: the frontend never reaches them directly. YARP strips the path prefix (e.g. `/identity-api/`) and forwards to the matching upstream. Only the gateway port (`6004`) appears in frontend code, via `VITE_API_BASE_URL`.

- Base URL: `VITE_API_BASE_URL` (default `http://localhost:6004`) — every RTK Query slice appends its service path prefix (e.g. `fetchBaseQuery({ baseUrl: env.apiBaseUrl + '/identity-api' })`).
- SignalR hub: `${VITE_SIGNALR_URL}/hubs/kitchen` (URL: `VITE_SIGNALR_URL`, default `http://localhost:6004/kitchen-api`). `VITE_SIGNALR_URL` already includes the upstream prefix; the frontend appends only `/hubs/kitchen`.
- Hub events (typed in `src/lib/signalr.ts`): `OrderReceived`, `ItemStateChanged`, `OrderReady`. Auto-reconnect policy: 1s, 2s, 5s, 10s, 30s, then stop.
- Auth: JWT access token (15-min TTL, **memory only**) + httpOnly refresh cookie (7-day)
- Auto-refresh on 401 via `src/lib/apiClient.ts` interceptor with **single-flight refresh** (one in-flight refresh roundtrip shared by all concurrent RTK Query calls; avoids token-rotation races).

For endpoint contracts and JWT claims shape, see `docs/backend-architecture/architecture.md`. For status enum, modification approval flow, and KDS time-color logic, see `docs/website-spec.md` §5.4, §6.4, §6.5.

## Testing instructions

- Unit: `pnpm test` (Vitest + React Testing Library) — colocate as `*.test.ts(x)` next to source
- E2E: `pnpm test:e2e` (Playwright) — flows in `e2e/` (login, role-based routing, order create, bill split)
- Add tests for every new feature; mock RTK Query endpoints, never hit the real backend in CI
- All tests + typecheck must pass before opening a PR

### i18n testing contract

- Wrap every component test in `renderWithI18n(ui, lang)` from `src/test/i18n-wrapper.tsx` (or supply an `<I18nextProvider>` directly when a custom store is required).
- Assertions must cover both `en` and `es` for every user-visible string the component renders.
- Playwright E2E flows must run their critical path under `es` via the `withLocale` fixture at `e2e/fixtures/withLocale.ts`:
  ```ts
  import { test, expect } from "../fixtures/withLocale";
  test.describe("Order list (es)", () => {
    test.use({ withLocale: "es" });
    test("renders Spanish column headers", async ({ page }) => { /* ... */ });
  });
  ```
- The `withLocale` fixture injects `localStorage["orderly-language"]` before navigation so the pre-hydration script in `index.html` sets `<html lang>` before React mounts.
- New E2E smoke tests should live alongside `e2e/locale.spec.ts` and cover at least one critical flow (login, order list, KDS queue) per supported language.

## PR & commit conventions

- Branch from `main`; never push to `main` directly
- Commit message: conventional commits (`feat:` / `fix:` / `docs:` / `refactor:` / `test:` / `chore:`)
- PR title mirrors commit; body references the spec section it implements (`§5.4 Orders`)
- Open PR via `gh pr create` once CI is green
- Keep PRs scoped to one feature module when practical — easier review, easier rollback

## Security

- Never commit secrets — `.env*` is gitignored; only `.env.example` ships
- JWT access token lives in Redux memory only — never localStorage / sessionStorage
- All auth flows route through the API Gateway (`http://localhost:6004`) — never call Identity Service directly
- User-input that lands in URLs passes through `encodeURIComponent`; nothing user-controlled hits the DOM as HTML
- CORS is the backend's problem; frontend trusts `VITE_API_BASE_URL` blindly in dev
