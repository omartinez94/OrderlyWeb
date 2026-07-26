# Base Component Library — Implementation Plan

> Scope: Establish the accessible, theme-aware base component library that every feature module (auth, staff, orders, kitchen, restaurant) will consume. Built on shadcn/ui primitives (Radix UI), bound to the existing design tokens in `src/index.css` / `src/lib/tokens.ts`, and validated against WCAG 2.2 AA.

---

## Status

> **Plan version**: `v1.0` (2026-07-26) — minor versions increment after each phase completion; major versions are reserved for breaking restructures of this plan.
> **Current state**: ⏸ Not started

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Foundation — `cn`, `components.json`, theming glue, Button primitive | ⏸ Pending |
| 2 | Form primitives — Input, Label, Textarea, Form helpers, Field | ⏸ Pending |
| 3 | Selection primitives — Select, Checkbox, Radio, Switch, Slider, Toggle | ⏸ Pending |
| 4 | Layout primitives — Card, Separator, AspectRatio, ScrollArea, Tabs, Accordion, Collapsible | ⏸ Pending |
| 5 | Overlay primitives — Dialog, Sheet, Popover, Tooltip, DropdownMenu, AlertDialog, Command, HoverCard | ⏸ Pending |
| 6 | Data display & feedback — Table, Badge, Avatar, Skeleton, Progress, Toast (Sonner) | ⏸ Pending |
| 7 | Navigation primitives — Breadcrumb, Pagination, NavigationMenu, Menubar | ⏸ Pending |
| 8 | Accessibility hardening, showcase, and adoption gate | ⏸ Pending |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `docs:`, `chore:`, `test:`, `fix:`, `refactor:`). Use a short imperative subject with no trailing period.

> **Update rule**: Every phase completion requires a code commit followed by a plan-only commit that updates this file, checks completed deliverables, records verification evidence, and bumps the minor version.

---

## 0. Skill & documentation conventions

### 0.1 Skill mandates

> The `shadcn-ui` skill is mandatory for every base component added in this plan — installation, variant authoring, and accessibility wiring must follow it. Visual work must reuse `DESIGN.md` and should use the `impeccable` skill during implementation and review. State, form, and routing work that touches feature code must follow `react-state-management` and `vercel-react-best-practices`.

### 0.2 Sources of truth

Read these documents before each phase and update this plan if implementation reveals drift:

- `DESIGN.md` — "The Quiet Workshop" visual language, tokens, typography, shapes, themes, and component rules.
- `AGENTS.md` — code style, Tailwind v4 rules, HeadlessUI vs. Radix migration, the explicit `shadcn-ui` mandate for new base components.
- `src/index.css` — CSS custom properties (`@theme inline`) for colors, gradients, glows, and font tokens.
- `src/lib/tokens.ts` — typed mirror of the CSS variables for runtime consumers (charts, canvas, dynamic styles).
- `docs/website-spec.md` — three-zone navigation, role-based access, the surface area that the base components must support.
- `.agents/plans/_template.md` — plan lifecycle and completion workflow.
- `.agents/plans/authentication-and-profile/auth-state-foundation.md` — the consuming plan; its LoginForm, ProfilePage, and AppShell will adopt the primitives this plan ships.

### 0.3 Code-quality guardrails

- Strict TypeScript; no `any` outside documented generated API declaration boundaries.
- Keep React components functional and avoid `React.FC`.
- Use semantic Tailwind v4 utilities backed by the existing variables in `src/index.css`; do not add a Tailwind v3 configuration.
- **No inline `style={{}}` on JSX** — reach for a Tailwind utility or a class in a colocated `.css` file. The only acceptable exception is dynamic values that cannot be expressed in CSS (e.g. computed transforms, refs to `getBoundingClientRect()`); document each exception with a comment.
- Components consume colors, fonts, and gradients via tokens (`bg-primary`, `text-ink`, `font-display`, `bg-gradient-service-cool`); never reference raw hex or a font family literally.
- The five service hues are reserved for order status; they do not appear as decoration, brand flourishes, or chart series elsewhere.
- Burnt Tangerine stays at ≤10% of any given screen; it never becomes a default button color.
- All components must respect `prefers-reduced-motion` and the existing `data-theme` attribute cascade.
- Existing components (`StatusPill`, `ThemeToggle`, `Header`) are the reference for naming, file structure, and a11y conventions; new primitives must match their style.

---

## 1. Context

The application already has a working theme system, a controlled `Header`, a `StatusPill`, and a `ThemeToggle`. It does not yet have the rest of the shared form, layout, overlay, data-display, or navigation primitives that feature modules will need. Authentication, staff management, and orders all need Button, Input, Select, Dialog, Table, DropdownMenu, Toast, and dozens of other primitives — and each feature cannot be allowed to invent its own, because the result is visual drift, inconsistent accessibility, and duplicated a11y work.

AGENTS.md already mandates that new base components be built via the `shadcn-ui` skill. That decision is the foundation of this plan: components live in `src/components/ui/` (copied into the repo, not pulled from a package), are themed via the existing design tokens, and ride on Radix UI primitives so keyboard navigation, focus management, and ARIA semantics are correct out of the box.

The goal is to ship a single, accessible, theme-aware base library that the auth/profile plan, the future staff-management plan, and the orders plan can all consume without rework. Accessibility is the load-bearing requirement: every primitive must satisfy WCAG 2.2 AA (color contrast, keyboard reachability, focus visibility, ARIA semantics, motion preferences), and the library must be verifiable end-to-end with automated axe checks plus targeted keyboard and screen-reader reviews.

---

## 2. Goal

Deliver a reusable base component library with these user-visible outcomes:

- A canonical `src/components/ui/` folder containing shadcn/ui primitives, restyled to match the Orderly design tokens (no parallel primitive set).
- A `cn()` utility plus `components.json` so the `shadcn` CLI can add new primitives without polluting the codebase.
- Form primitives that work with React Hook Form + Zod out of the box, with field-level error wiring and ARIA-described help texts.
- Selection primitives (Select, Checkbox, Radio, Switch, Slider, Toggle) that use the same API contract and styling.
- Layout primitives (Card, Separator, AspectRatio, ScrollArea, Tabs, Accordion, Collapsible) that respect the established tonal layering (Sage Linen → Sage Linen High → Linen Overlay).
- Overlay primitives (Dialog, Sheet, Popover, Tooltip, DropdownMenu, AlertDialog, Command, HoverCard) that lock focus, trap it correctly, escape to close, and restore focus on unmount.
- Data-display primitives (Table, Badge, Avatar, Skeleton, Progress, Toast via Sonner) with row-level a11y for tables and polite/assertive live regions for toasts.
- Navigation primitives (Breadcrumb, Pagination, NavigationMenu, Menubar) that mirror the Header's slot-based composition contract.
- A dedicated component showcase page (kept in addition to the design-system showcase) that renders every primitive in every variant, in light and dark, so design drift is caught at review time.
- Automated accessibility tests (axe via Vitest + Playwright) with zero `serious` or `critical` violations on the showcase.
- A documented adoption rule so auth, staff, orders, and any future feature plan reuses the primitives instead of redefining them.

---

## 3. Out of scope

- Feature-level components (LoginForm, OrderCard, StaffTable) — owned by the consuming plans.
- Replacing or restyling the existing `StatusPill`, `ThemeToggle`, or `Header` — they are correct and serve as references.
- A full Storybook deployment — the showcase page in `App.tsx` plus a Storybook-style route under `/showcase` is enough until scale demands more.
- Visual regression baselines beyond what axe and manual keyboard review cover.
- Charting, drag-and-drop, and rich-text editing primitives — they belong to feature plans that need them.
- A headless UI library migration (HeadlessUI → Radix) for existing components — that is a separate cleanup plan.
- Theming beyond the existing light/dark/system trio; multi-tenant theming is not requested.
- Internationalization of label strings — primitives render English-only labels today; i18n plumbing is deferred to a follow-up plan.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| Primitive library | shadcn/ui (Radix UI under the hood) | Mandated by AGENTS.md; components live in the repo, full ownership, no version lock-in. |
| Style composition | `class-variance-authority` (cva) + `tailwind-merge` + `clsx` | shadcn's default; lets callers override variants without specificity wars. |
| Class merge | `cn()` helper in `src/lib/utils.ts` | Single source of truth; prevents accidental class duplication. |
| `components.json` | shadcn config with `@/components` and `@/lib/utils` aliases | So `npx shadcn@latest add <name>` keeps the existing conventions. |
| Styling integration | shadcn CSS variables mapped to the existing `src/index.css` tokens | Reuses the established light/dark theme tokens; no parallel palette. |
| Form binding | React Hook Form + Zod + `@hookform/resolvers` (already chosen by auth plan) | Typed forms, accessible error mapping; the same pair must work here. |
| Toast | Sonner | shadcn's recommended toast; accessible by default; supports promise and action toasts. |
| Icons | `lucide-react` | shadcn's default; tree-shaken; consistent stroke and sizing. |
| Component meta | `React.ComponentProps<…>` only; never `React.FC` | Consistent with AGENTS.md. |
| Testing | Vitest + React Testing Library + jest-axe + Playwright (a11y) | Mirrors the auth plan's stack. |
| Stylelint/ESLint | Keep existing `oxlint` setup; extend with `eslint-plugin-jsx-a11y` if not already present | Accessibility linting at save time. |
| Auto-generated registry | `npx shadcn@latest add <name>` only; no manual file generation | Avoids drift between the registry and the codebase. |

---

## 5. Folder layout

```text
src/
├── components/
│   ├── ui/                              # shadcn primitives (this plan)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── form.tsx                     # Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── switch.tsx
│   │   ├── slider.tsx
│   │   ├── toggle.tsx
│   │   ├── toggle-group.tsx
│   │   ├── card.tsx
│   │   ├── separator.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── scroll-area.tsx
│   │   ├── tabs.tsx
│   │   ├── accordion.tsx
│   │   ├── collapsible.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── popover.tsx
│   │   ├── tooltip.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── context-menu.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── command.tsx
│   │   ├── hover-card.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── skeleton.tsx
│   │   ├── progress.tsx
│   │   ├── sonner.tsx                   # Toast (Sonner)
│   │   ├── breadcrumb.tsx
│   │   ├── pagination.tsx
│   │   ├── navigation-menu.tsx
│   │   └── menubar.tsx
│   ├── Header/                          # existing (unchanged)
│   ├── StatusPill/                      # existing (unchanged)
│   └── ThemeToggle/                     # existing (unchanged)
├── lib/
│   ├── utils.ts                         # cn() — single source of truth
│   ├── tokens.ts                        # existing typed mirror (unchanged)
│   └── a11y.ts                          # focus-visible helpers, live-region helpers, screen-reader text
├── hooks/
│   ├── useFocusTrap.ts                  # reusable focus trap for in-house overlays
│   └── useReducedMotion.ts              # SSR-safe prefers-reduced-motion hook
├── styles/
│   └── ui.css                           # shadcn CSS variables mapped to Orderly tokens
├── test/
│   ├── a11y/
│   │   ├── axe.ts                       # jest-axe + axe-playwright config
│   │   └── primitives.test.tsx          # axe run per primitive
│   └── showcase.spec.tsx                # Playwright a11y run per showcase route
├── App.tsx                              # existing design-system showcase (kept)
└── pages/
    └── ShowcasePage.tsx                 # primitive-by-primitive showcase (new)
```

Critical files to modify (not replace):

- `src/index.css` — add the shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--muted`, etc.) mapped to the existing Orderly tokens; keep the existing `:root` and `[data-theme='dark']` blocks intact.
- `src/lib/utils.ts` — new file; `cn()` plus tiny helpers.
- `src/main.tsx` — mount the showcase route in development behind the existing design-system page.
- `components.json` — new file at the repo root with the shadcn CLI config.
- `package.json` / `pnpm-lock.yaml` — add the approved runtime/test dependencies and scripts.
- `tsconfig.json` — ensure the `@` path alias points at `src/`.

---

## 6. Base Component Library Specification

### 6.1 Foundation and theming contract

- `src/lib/utils.ts` exports `cn(...inputs: ClassValue[]) = twMerge(clsx(inputs))`. No other file is allowed to import `clsx` or `tailwind-merge` directly.
- `components.json` is the canonical shadcn registry config:
  - `$schema: "https://ui.shadcn.com/schema.json"`
  - `style: "new-york"` (the more compact default; switch if showcase review prefers the rounder variant).
  - `rsc: false` (Vite SPA, not Next.js).
  - `tsx: true`, `tailwind: { config: "", css: "src/index.css", baseColor: "neutral", cssVariables: true }`.
  - `aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" }`.
- `src/styles/ui.css` (or appended section inside `src/index.css`) defines the shadcn CSS variables and maps them to the existing Orderly tokens. Example mapping (the full set is added in Phase 1):

  ```css
  :root {
    --background: var(--color-surface);
    --foreground: var(--color-ink);
    --card: var(--color-surface-elevated);
    --card-foreground: var(--color-ink);
    --popover: var(--color-surface-overlay);
    --popover-foreground: var(--color-ink);
    --primary: var(--color-primary);
    --primary-foreground: var(--color-primary-foreground);
    --secondary: var(--color-surface-elevated);
    --secondary-foreground: var(--color-ink);
    --muted: var(--color-surface-elevated);
    --muted-foreground: var(--color-ink-muted);
    --accent: var(--color-accent);
    --accent-foreground: var(--color-accent-foreground);
    --destructive: var(--color-danger);
    --destructive-foreground: var(--color-primary-foreground);
    --border: var(--color-border-subtle);
    --input: var(--color-border-strong);
    --ring: var(--color-primary);
    --radius: 0.5rem;
  }
  ```

  These are *aliases*; the canonical Orderly tokens stay as the source of truth. New variables are not allowed to invent new hex values — they must reference the existing palette.
- Light/dark cascade is preserved automatically: shadcn variables resolve through the existing `[data-theme='dark']` rebinding. No JS theme rerender is required.
- `useReducedMotion()` returns a `boolean` matching `(prefers-reduced-motion: reduce)`. Every animation/transition in the library must consume it.
- `useFocusTrap(ref: RefObject<HTMLElement>, options?: { restoreFocus?: boolean })` returns a ref to attach to the trap container. Used by Dialog, Sheet, Popover, DropdownMenu, AlertDialog, Command — Radix primitives handle focus traps internally, but the helper exists for any in-house overlay (e.g. a future command bar).

### 6.2 Button primitive (Phase 1 reference)

- shadcn `button` component with `cva` variants:
  - `variant`: `default` (primary), `accent`, `outline`, `ghost`, `secondary`, `destructive`, `link`.
  - `size`: `sm`, `default`, `lg`, `icon` (square).
- Burnt Tangerine (`accent`) is reserved for urgent CTAs (`Mark Ready`, `Send to Kitchen`); never the default button on a page with a primary action.
- Focus-visible uses a 2px outline in `var(--color-primary)` with 2px offset; never `outline-none` without a replacement.
- Disabled state uses `aria-disabled` plus `pointer-events-none` (not just `disabled`) so screen readers announce the state.
- When rendered as a child of an `<a>` or `Link`, `asChild` is supported via Radix Slot.
- `loading` prop is not part of the base primitive; feature code wraps the button with a `<LoadingButton>` (the auth plan already has this pattern).

### 6.3 Form primitives (Phase 2)

- `Input`, `Textarea`, `Label`, `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` — all shadcn primitives.
- `FormField` binds to React Hook Form via `Controller`. `FormMessage` renders `aria-invalid` and `aria-describedby` automatically.
- Error state uses `var(--color-danger)` for the message and a 2px `var(--color-danger)` ring on the input.
- Field containers render at 100% width by default; features that need a constrained input must pass `className`.
- All inputs support `aria-invalid`, `aria-describedby`, `aria-required`, and visible label association.
- `useFormField()` is the only public hook; it returns `id`, `name`, `formItemId`, `formDescriptionId`, `formMessageId`. Features wire these into every field.
- Help text (`FormDescription`) is muted (`text-ink-muted`) and appears below the control; error text replaces it (not appends) when the field is invalid.

### 6.4 Selection primitives (Phase 3)

- `Select` (Radix), `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Toggle`, `ToggleGroup`.
- All selection primitives must support:
  - Keyboard navigation per WAI-ARIA Authoring Practices (arrow keys, Home/End, Space/Enter, typeahead for Select).
  - Group labels (`<SelectLabel>`, `<RadioGroupLabel>`) that render as visible captions and as ARIA `aria-labelledby` references.
  - A visible focus ring on the trigger and on each option.
  - Disabled groups (`disabled` cascades to children).
- `Select` renders a `Popover`-based trigger that mirrors the Orderly typography (display for the label, mono for option counts).
- `Switch` and `Checkbox` use `var(--color-primary)` for the checked state and `var(--color-border-strong)` for the unchecked state — contrast verified at the showcase level.
- `Toggle` and `ToggleGroup` support `variant="outline"` and `variant="default"`, both with explicit `aria-pressed` semantics.

### 6.5 Layout primitives (Phase 4)

- `Card`, `Separator`, `AspectRatio`, `ScrollArea`, `Tabs`, `Accordion`, `Collapsible`.
- `Card` uses `bg-surface-elevated` and the `rounded-card` (12px) radius from the design system. No shadow on the default variant; shadow variants (`shadow-glow-primary`, `shadow-glow-accent`) are reserved for status surfaces.
- `Separator` defaults to `bg-border-subtle`; `decorative` flag toggles between `role="separator"` (decorative) and `role="separator"` with `aria-orientation` (semantic).
- `Tabs` enforces a roving tabindex on the tab list; arrow keys navigate; only the active panel is in the tab order.
- `Accordion` uses Radix's `Accordion` primitive; chevron is decorative (`aria-hidden`), the trigger is the button.
- `Collapsible` is restricted to in-place content that does not need ARIA semantics beyond a button + region pair.

### 6.6 Overlay primitives (Phase 5)

- `Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `AlertDialog`, `Command`, `HoverCard`.
- Common contract:
  - `aria-modal="true"` on the content container.
  - Focus is trapped inside the overlay while it is open.
  - `Escape` closes the overlay and returns focus to the trigger.
  - Click on the scrim closes (Dialog, Sheet, AlertDialog, Command) — explicit `onInteractOutside` opt-out where the design demands it.
  - Body scroll is locked while the overlay is open.
  - `prefers-reduced-motion` disables open/close transitions.
- `Dialog` and `AlertDialog`:
  - `AlertDialog` is reserved for destructive or irreversible actions; it forces a confirm/cancel pair and locks focus on the cancel button by default.
  - `Dialog` is for non-modal-interrupting flows.
- `Sheet` slides in from the right by default; left/top/bottom are accepted via `side` prop.
- `Tooltip`:
  - Trigger only on hover/focus, never on click alone.
  - 200ms hover delay; instant off on `pointerleave` or `blur`.
  - `TooltipContent` uses `surface-overlay` and `ink` text; contrast verified.
  - Tooltips must never contain interactive content (use `Popover` instead).
- `Command` (cmdk):
  - Renders a focused input by default; arrow keys navigate results; `Enter` activates.
  - Empty states and "no results" are announced via `aria-live="polite"`.
  - Triggered by `⌘K` on the root and via a `Popover` wrapper from any button.
- `Popover` / `HoverCard` / `DropdownMenu` follow the same focus rules; only one overlay may be open at a time (the previous one closes).

### 6.7 Data display & feedback (Phase 6)

- `Table`, `Badge`, `Avatar`, `Skeleton`, `Progress`, `Sonner` (Toast).
- `Table`:
  - Caption is required; render a visually-hidden caption if the visual label is sufficient.
  - Header cells use `scope="col"` (or `scope="row"` for row headers).
  - Sortable columns expose `aria-sort` (`ascending` / `descending` / `none`).
  - Row actions live in an `<AccessibleIconButton>` with `aria-label`; the table never relies on color alone for status.
  - Pagination controls are wired to the `Pagination` primitive (Phase 7).
- `Badge`:
  - Variants: `default`, `secondary`, `destructive`, `outline`, and the five service-hue variants (`new`, `acknowledged`, `preparing`, `plating`, `ready`).
  - Service-hue variants render on a 12% tint with the full service hue as the foreground — identical to `StatusPill` rules. The `StatusPill` component stays the canonical status pill; `Badge` service variants exist for non-order contexts (e.g. payment status, table status).
- `Avatar`:
  - Falls back to initials (computed from `firstName` + `lastName`) when no image is provided.
  - Alt text is provided by the caller via `alt`; decorative avatars use `alt=""`.
- `Skeleton`:
  - Uses `bg-surface-elevated` with a subtle pulse animation; `prefers-reduced-motion` disables the pulse.
- `Progress`:
  - Always renders with `role="progressbar"` plus `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`.
  - Indeterminate state uses `aria-valuetext="Loading"`.
- `Sonner` (Toast):
  - Mounted once at the app root via `<Toaster />` in `main.tsx`.
  - Variants: `default`, `success`, `info`, `warning`, `destructive`.
  - Success/info are `aria-live="polite"`; destructive errors are `aria-live="assertive"`.
  - Toasts are focusable only when they contain an action; otherwise they announce via the live region.
  - `<ToastAction>` is keyboard-reachable; the close button has a visible `aria-label="Dismiss"`.

### 6.8 Navigation primitives (Phase 7)

- `Breadcrumb`, `Pagination`, `NavigationMenu`, `Menubar`.
- `Breadcrumb` reuses the Header's `Breadcrumb` slot pattern; the primitive is the canonical source for any other breadcrumb (e.g. inside a long form).
- `Pagination`:
  - Previous/Next buttons have explicit `aria-label`.
  - Current page uses `aria-current="page"`.
  - Pagination is rendered as a `<nav aria-label="Pagination">` — the wrapper is required for screen readers.
- `NavigationMenu` is the horizontal nav used in marketing surfaces and admin dashboards; it accepts nested `MenuItem`/`MenuTrigger` pairs.
- `Menubar` is the vertical menu used inside complex tool palettes; not for top-level navigation.

### 6.9 Accessibility guarantees (cross-cutting)

Every primitive must satisfy:

- **Color contrast** — any text/icon combination on a primitive must clear WCAG 2.2 AA (4.5:1 for body text, 3:1 for large text and graphical objects). Verified in the showcase for both light and dark themes.
- **Keyboard reachability** — every interactive element is reachable via Tab in a logical order. Overlays trap focus and restore it on close.
- **Focus visibility** — focus rings are always visible (2px primary outline, 2px offset). Never `outline-none` without replacement.
- **ARIA semantics** — primitives use the correct implicit/explicit ARIA roles; no `role="button"` on `<div>`. Labels, descriptions, and errors are linked via `aria-labelledby` / `aria-describedby`.
- **Live regions** — toasts, status changes, and async errors are announced via `aria-live`. Muting a live region is forbidden.
- **Motion** — every transition/animation respects `useReducedMotion()`. Overlays default to a 150ms fade; full-screen sheets may use a 200ms slide.
- **Touch targets** — every interactive primitive has a minimum 44×44px hit target, even when the visual size is smaller (e.g. icon buttons).
- **Form fields** — every input has a visible label, an accessible name, and an `aria-invalid` + `aria-describedby` pair when invalid.
- **Screen-reader-only text** — provided via a single `sr-only` utility class (added in `src/index.css`); never inlined as raw `style={{ ... }}`.

### 6.10 Showcase and adoption gate

- `/showcase` route renders every primitive in every variant, in light and dark.
- The showcase is gated to development (`import.meta.env.DEV`) so the production bundle does not pay for it; consider a `ShowcasePage` lazy import plus a `?showcase=1` query flag for ad-hoc review.
- Acceptance criteria for each primitive:
  - Renders without console warnings.
  - Passes axe (zero `serious`/`critical` violations).
  - Passes a keyboard interaction script (Tab, Enter, Space, Escape, arrow keys).
  - Renders correctly in light and dark.
  - Uses only design tokens — no inline hex, no literal font family.
- Adoption rule: any feature plan that needs a new interactive surface must consume a primitive from this library. The auth plan's `LoginForm` will adopt `Button`, `Input`, `Label`, `Form`, `FormField`, `FormMessage`, and `Checkbox` (remember-me) in Phase 4 of that plan. The staff and orders plans follow the same pattern.

---

## 7. Cross-plan adoption

This plan is consumed by:

- `.agents/plans/authentication-and-profile/auth-state-foundation.md` — Phase 4 already enumerates the primitives it needs (`Button`, `Input`, `Label`, `Form`, `FormField`, `FormMessage`, `Checkbox`, `Dialog`, `Profile`, `Logout`). The base-components plan ships those primitives in Phases 1–5; the auth plan updates its own plan to reference the new imports.
- Future staff-management plan — `Table`, `Pagination`, `Dialog`, `DropdownMenu`, `Form`, `Sheet`, `Toast`.
- Future orders plan — `Table`, `Badge`, `Sheet`, `Tabs`, `Combobox` (Select), `DropdownMenu`, `Toast`.
- Future KDS / future kitchen plan — `Card`, `Badge`, `Sheet`, `Tooltip`, `Command` (palette-style quick actions).

The adoption contract is documented in the showcase page header and copied into each consuming plan's "Skill & documentation conventions" section.

---

## 8. Security guardrails

| Risk | Mitigation |
|---|---|
| Token theft or session leakage through a primitive | Primitives are presentational; no primitive reads from Redux or `localStorage`. Auth state is owned by the auth plan's slices and consumed via hooks. |
| XSS via user-supplied content in primitives | All primitives render React children; dangerouslySetInnerHTML is not used. The `Avatar` component treats `alt` as a plain string. |
| `target="_blank"` escaping | The `Button asChild` variant forbids `target="_blank"` without `rel="noopener noreferrer"`; lint rule enforces this. |
| Focus-stealing overlays | Overlays restore focus to the trigger; the `useFocusTrap` helper receives a `restoreFocus` option that defaults to `true`. |
| Live-region floods | `Toast` debounces identical messages within 500ms; tests assert the throttle. |
| ARIA misuse | All primitives ship with a Vitest + jest-axe test; the showcase runs Playwright accessibility checks per route. |
| Cross-token leakage in error messages | Form errors and toast messages are rendered through React; no primitive interpolates raw server payloads. |
| Reduced-motion regressions | Every motion-dependent primitive is tested with `prefers-reduced-motion: reduce` injected. |

---

## 9. Development Phases

### Phase overview

| Phase | Name | Groups delivered | Goal |
|:---:|---|---|---|
| **1** | Foundation | `cn`, `components.json`, theming, `Button`, `Badge` | Establish the shadcn install and the visual contract. |
| **2** | Form primitives | `Input`, `Label`, `Textarea`, `Form`, `FormField`, `FormMessage` | Make feature forms accessible by default. |
| **3** | Selection primitives | `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Toggle`, `ToggleGroup` | Selection surfaces with consistent keyboard semantics. |
| **4** | Layout primitives | `Card`, `Separator`, `AspectRatio`, `ScrollArea`, `Tabs`, `Accordion`, `Collapsible` | Tonal layering and content structure. |
| **5** | Overlay primitives | `Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `AlertDialog`, `Command`, `HoverCard` | Focus-safe overlays. |
| **6** | Data display & feedback | `Table`, `Badge`, `Avatar`, `Skeleton`, `Progress`, `Sonner` | Tables, status, and feedback. |
| **7** | Navigation primitives | `Breadcrumb`, `Pagination`, `NavigationMenu`, `Menubar` | Canonical navigation controls. |
| **8** | Hardening & adoption | Showcase, axe + Playwright a11y, adoption docs | Make the library the system of record. |

### Phase 1 — Foundation

**Goal**: Establish the shadcn install, the `cn()` utility, the token mapping, and the first primitive (`Button`) so every later phase has a working baseline.

**Status**: ⏸ Pending

**Deliverables**:

- [ ] Add `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tailwindcss-animate`, and `sonner` to `package.json` via `pnpm add`.
- [ ] Add `jest-axe`, `@axe-core/playwright`, and the `axe-playwright` Playwright config to devDependencies.
- [ ] Create `src/lib/utils.ts` with `cn()` and any small helpers.
- [ ] Create `components.json` with the shadcn CLI config from §6.1.
- [ ] Append the shadcn CSS variables to `src/index.css`, mapping every variable to the existing Orderly tokens.
- [ ] Add `src/hooks/useReducedMotion.ts`.
- [ ] Add `src/hooks/useFocusTrap.ts`.
- [ ] Run `npx shadcn@latest add button` (and accept the CLI's dependency suggestions).
- [ ] Restyle the installed `Button` to match the Orderly variants from §6.2.
- [ ] Verify the showcase page renders the `Button` in every variant and the default theme behavior is unchanged.
- [ ] Add a Vitest + jest-axe smoke test for `Button` (zero `serious`/`critical` violations).

**Exit criteria**: `pnpm typecheck`, `pnpm lint`, `pnpm test -- --run`, and `pnpm build` all pass. The `Button` renders in all variants in light and dark without console warnings. The auth plan's `LoadingButton` would now extend this `Button` instead of a hand-rolled `<button>`.

---

### Phase 2 — Form primitives

**Goal**: Provide the React Hook Form + Zod binding primitives that every feature form will use.

**Status**: 🔒 Blocked by Phase 1

**Deliverables**:

- [ ] Run `npx shadcn@latest add input label textarea form`.
- [ ] Verify `FormField` integration with React Hook Form; document a `useZodForm(schema)` helper in `src/lib/forms.ts` (re-exported from `react-hook-form` + `@hookform/resolvers/zod`).
- [ ] Add `FormDescription` and `FormMessage` styling aligned to muted ink and danger token rules.
- [ ] Add a Vitest + jest-axe test for `Input`, `Textarea`, and `Form` (zero `serious`/`critical` violations).
- [ ] Add a keyboard script: Tab → input → label association → error announced → escape focus.
- [ ] Document the field-by-field `aria-describedby` contract in the showcase.

**Exit criteria**: Typecheck, lint, tests, and showcase pass. The auth plan's `LoginForm` can adopt these primitives in its Phase 4.

---

### Phase 3 — Selection primitives

**Goal**: Selection controls with consistent keyboard semantics and theming.

**Status**: 🔒 Blocked by Phase 2

**Deliverables**:

- [ ] Run `npx shadcn@latest add select checkbox radio-group switch slider toggle toggle-group`.
- [ ] Verify keyboard navigation per §6.4 (arrow keys, typeahead, Home/End, Space/Enter, roving tabindex where applicable).
- [ ] Add a service-hue-aware styling pass: `Switch` and `Checkbox` checked state uses `var(--color-primary)`; unchecked uses `var(--color-border-strong)`.
- [ ] Add a Playwright keyboard test for `Select` (typeahead filtering, escape to close, focus return).
- [ ] Add a Vitest + jest-axe test for each primitive.

**Exit criteria**: Selection primitives pass automated a11y, render correctly in light and dark, and respect `prefers-reduced-motion`.

---

### Phase 4 — Layout primitives

**Goal**: Tonal layering and content structure that respects the design system rules.

**Status**: 🔒 Blocked by Phase 3

**Deliverables**:

- [ ] Run `npx shadcn@latest add card separator aspect-ratio scroll-area tabs accordion collapsible`.
- [ ] Card variants: `default` (flat), `bordered` (1px border-strong), `glass` (uses existing `.glass` class), `muted` (surface tone). No shadows on the default variants.
- [ ] `Tabs` enforces roving tabindex and `aria-orientation`; documented in the showcase.
- [ ] Verbatim screen-reader semantics for `Accordion` (Radix already handles this — verify with axe).
- [ ] Vitest + jest-axe tests per primitive.

**Exit criteria**: All layout primitives render correctly and pass a11y. The showcase demonstrates each variant in light and dark.

---

### Phase 5 — Overlay primitives

**Goal**: Focus-safe overlays that lock focus, restore it on close, and respect reduced motion.

**Status**: 🔒 Blocked by Phase 4

**Deliverables**:

- [ ] Run `npx shadcn@latest add dialog sheet popover tooltip dropdown-menu context-menu alert-dialog command hover-card`.
- [ ] Verify the focus-trap, escape-to-close, and restore-focus contract per §6.6.
- [ ] `Tooltip` rejects interactive children via a runtime check (logs a warning in DEV).
- [ ] `Command` uses cmdk and accepts a structured `groups` prop plus a render-prop render; `aria-live` region announces the empty state.
- [ ] `Sheet` `side` variants: `right` (default), `left`, `top`, `bottom`; the default slides in 200ms.
- [ ] Body scroll lock is verified across all overlays.
- [ ] Playwright keyboard script per overlay.
- [ ] Vitest + jest-axe tests per primitive.

**Exit criteria**: Overlays trap focus, escape to close, and restore focus. Body scroll is locked. `prefers-reduced-motion` disables transitions.

---

### Phase 6 — Data display & feedback

**Goal**: Tables, status, and feedback that meet the order-status and live-region rules.

**Status**: 🔒 Blocked by Phase 5

**Deliverables**:

- [ ] Run `npx shadcn@latest add table badge avatar skeleton progress`.
- [ ] Install and wire `sonner`; mount `<Toaster />` once at the app root.
- [ ] `Table` enforces caption, scope, and `aria-sort` per §6.7.
- [ ] `Badge` service-hue variants follow the same tint rules as `StatusPill` (12% background, 100% foreground, 28–34% border tint).
- [ ] `Progress` supports indeterminate and determinate states; `aria-valuetext` is computable.
- [ ] `Toast` (Sonner) success/info are `polite`; destructive is `assertive`. Throttle identical messages within 500ms.
- [ ] Vitest + jest-axe tests per primitive.
- [ ] Playwright test for the toast throttle.

**Exit criteria**: Tables pass axe plus the keyboard script. Toast visibility is announced in the right politeness slot. Service-hue variants are visually identical to `StatusPill` in the same color.

---

### Phase 7 — Navigation primitives

**Goal**: Canonical navigation primitives for breadcrumbs, pagination, and complex menus.

**Status**: 🔒 Blocked by Phase 6

**Deliverables**:

- [ ] Run `npx shadcn@latest add breadcrumb pagination navigation-menu menubar`.
- [ ] `Breadcrumb` reuses the Header's `Breadcrumb` slot pattern; the primitive is the canonical source for any other breadcrumb.
- [ ] `Pagination` exposes `aria-current` and `aria-label="Pagination"`.
- [ ] `NavigationMenu` and `Menubar` pass axe in the showcase.
- [ ] Vitest + jest-axe tests per primitive.

**Exit criteria**: All four navigation primitives pass automated a11y, render correctly in light and dark, and document their use in the showcase.

---

### Phase 8 — Accessibility hardening, showcase, and adoption gate

**Goal**: Make the library the system of record, verified end-to-end in a real browser.

**Status**: 🔒 Blocked by Phase 7

**Deliverables**:

- [ ] Build the `ShowcasePage` (`src/pages/ShowcasePage.tsx`) rendering every primitive in every variant, in light and dark.
- [ ] Wire the `<Toaster />` in `src/main.tsx` and mount the showcase route in development behind a `?showcase=1` query flag.
- [ ] Add a Playwright run that visits the showcase route and asserts zero `serious`/`critical` axe violations per primitive.
- [ ] Add a keyboard interaction script per primitive (Tab order, Enter/Space activation, Escape close, arrow navigation, focus restoration).
- [ ] Add a reduced-motion run that disables transitions and verifies the primitives still render and operate.
- [ ] Document the adoption rule in `AGENTS.md` ("new interactive surfaces must consume the base library") and link the showcase URL.
- [ ] Update `.agents/plans/authentication-and-profile/auth-state-foundation.md` Phase 4 to reference the new primitives.
- [ ] Add a `pnpm ui:lint` script that runs `eslint-plugin-jsx-a11y` over `src/components/ui/` and the showcase.
- [ ] Add a `pnpm ui:check` script that runs typecheck + lint + a11y tests + Playwright a11y.

**Exit criteria**: `pnpm ui:check` passes with zero `serious`/`critical` violations across every primitive in light and dark. `pnpm ui:lint` passes. The showcase page is the single source of truth for "what does each primitive look like".

---

### Phase N implementation notes (append after completion)

**§ items adopted in Phase N.**
- Item — `[✅ adopted | ⚠ deferred | ❌ rejected]` resolution and rationale.

**shadcn CLI changes.**
- Component added — exact CLI command and any post-install edits.

**Bugs found and fixed during implementation.**
- Symptom — resolution.

**Deferred follow-ups.**
- Item — owning plan/ticket and reason.

**Phase N verification.**
- Command/manual check — actual result.

**Files added.** List. **Files modified:** List.

---

## 10. Technical considerations

### 10.1 Cross-cutting

- **Theme variables own the visual contract.** Every primitive must consume a CSS variable (the shadcn variable, which is itself an alias to the Orderly token). Hex values appear in `src/index.css` and `src/lib/tokens.ts` only. No primitive is allowed to introduce a new color.
- **Motion is a feature, not a default.** Every transition honors `useReducedMotion()`. Default overlay fade is 150ms; sheet slide is 200ms. Anything longer must be justified.
- **shadcn CLI is the source of truth.** When a new primitive is needed, run `npx shadcn@latest add <name>` — never paste from a CDN. Manual edits are allowed only to restyle variants; the structural changes must come from the CLI.
- **HeadlessUI vs Radix.** AGENTS.md currently lists HeadlessUI as the existing primitive library. The existing `Header` and `ThemeToggle` keep their HeadlessUI dependencies; the new base library uses Radix (via shadcn). The two coexist; a future plan can replace HeadlessUI with Radix in the existing components without touching this plan.
- **Focus-visible is non-negotiable.** A `focus-visible` ring is required on every interactive primitive. No `outline-none` without a replacement.
- **Live regions are explicit.** Toast, status changes, and async errors update a live region. No primitive mutates an `aria-live` region silently — the contract is documented in `src/lib/a11y.ts`.
- **Touch targets are ≥44px.** Even icon buttons must have a 44×44px hit target (via `min-h`/`min-w` or `aria-hidden` styling on the inner icon).
- **Forms are React Hook Form + Zod.** No form primitive hard-codes `value`/`onChange`; the contract is the `FormField` controller binding.
- **The library is in the repo, not on npm.** No `node_modules/ui` package. `src/components/ui/` is the only home.

### 10.2 Verification matrix

The final phase must run and record:

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm ui:lint`
4. `pnpm test -- --run`
5. `pnpm ui:check`
6. `pnpm build`
7. `pnpm test:e2e`
8. Manual keyboard and screen-reader review of the showcase
9. Automated axe checks with zero `serious`/`critical` violations
10. `prefers-reduced-motion: reduce` run that verifies transitions are disabled
11. A bundle-size diff against the pre-plan baseline (the auth plan's `LoginForm` chunk must not regress)

### 10.3 Performance acceptance

- The showcase page is lazy-loaded and gated behind `import.meta.env.DEV` or a `?showcase=1` query flag.
- The base library adds at most the Radix primitives that are actually used; unused primitives are not eagerly imported.
- Icons are tree-shaken via `lucide-react`; the showcase page is the only place that imports a wide icon set.
- `cn()` is the only class-merging entry point; ad-hoc `clsx`/`twMerge` calls are forbidden.
- Focus-trap and reduced-motion hooks are isolated; components subscribe via `useCallback` so they do not retrigger re-renders.

### 10.4 Risks specific to the base library

- **Drift between shadcn upstream and the local fork.** Mitigation: pin the CLI version; do not hand-edit structural parts of the file; only restyle variants.
- **Color contrast on the muted overlay stack.** `Linen Overlay` (`#FFFFFF`) on `Sage Linen` (`#EFF1ED`) is fine for ink text but invites mistakes; the verification matrix must enforce a contrast check.
- **Too many overlays open at once.** The Radix-based primitives coordinate via the global `DismissableLayer`; mis-using `Popover` inside a `Dialog` can break focus; document the recommended nesting rules.
- **Accessibility audit regressions when a new primitive is added.** Mitigation: every addition runs through Phase 8's check before the auth/profile plan adopts it.

---

## Changelog

### v1.0 (2026-07-26) — initial draft

- Created the eight-phase base component library plan.
- Selected shadcn/ui (Radix under the hood) as the primitive source, mandated by AGENTS.md.
- Mapped the shadcn CSS variables to the existing Orderly tokens so the visual contract is preserved.
- Reserved the five service hues for status; `Badge` service variants follow the same rules as `StatusPill`.
- Required WCAG 2.2 AA: keyboard reachability, focus visibility, ARIA semantics, live regions, reduced-motion respect, and ≥44px touch targets.
- Promoted the showcase page plus `pnpm ui:check` as the adoption gate so subsequent plans (auth, staff, orders, KDS) consume the library instead of redefining primitives.
