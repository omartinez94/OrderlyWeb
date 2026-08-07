# Internationalization (i18n) & Localization — Implementation Plan

> Scope: Full English (`en`) + Spanish (`es`) support across all three OrderlyWeb zones (Admin, KDS, Restaurant). Covers infrastructure, currency/number/date formatting, testing mandates, and agent coding rules.

---

## Status

> **Plan version**: `v1.2` (2026-08-06)
> **Current state**: ✅ Done (Phases 1–4)

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Core i18n Infrastructure & LocalStorage Sync | ✅ Done |
| 2 | Number / Currency / Date Formatting Layer | ✅ Done |
| 3 | Translation Files, Namespaces & Language Switcher UI | ✅ Done |
| 4 | Agent Rules, Testing Mandate & CI Enforcement | ✅ Done |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat:`, `docs:`, `chore:`, `test:`, `fix:`). Short subject ≤50 chars, imperative mood, no trailing period.

> **Update rule**: On every phase completion the plan MUST be updated in the same commit as the phase work.

---

## 0. Skill & documentation conventions

### 0.1 Skill mandate

> **All implementation work on this plan — and every future feature, page, or component added to OrderlyWeb — MUST comply with the localization rules in §9.** No hardcoded UI strings. Every string that appears in a browser goes through `t()` or `<Trans />`.

### 0.2 Code-quality guard rails

- TypeScript strict mode: translation-key helpers must be fully typed (see §6.4).
- **No `any` casts** inside `i18n.ts`, `useLanguage.ts`, or locale helpers.
- **No hand-rolled currency / number formatters** — use `Intl.NumberFormat` (see §6.3).
- **No hand-rolled date formatters** — use `Intl.DateTimeFormat` / `Intl.RelativeTimeFormat` via `date-fns` locale helpers (see §6.2).
- Lint: oxlint rule `no-restricted-syntax` bans template-literal fallback strings in JSX.

---

## 1. Context

OrderlyWeb serves multicultural restaurant teams: Admin (back-office), KDS (kitchen display), and Restaurant Operations (floor staff). A significant portion of restaurant staff are native Spanish speakers. Without locale support:

- UI labels and error messages appear in English only.
- Currency amounts (e.g. prices, order totals, bill splits) render without locale-appropriate formatting.
- Dates and durations shown on the KDS and order list may not be culturally legible.
- Backend services cannot return localised domain data without `Accept-Language`.

This plan introduces **Alternative C** — `react-i18next` + `i18next-browser-languagedetector` — the industry-standard solution chosen because it provides a minimal `useTranslation()` API, built-in detector/storage integration, namespace lazy-loading, and strong TypeScript support.

---

## 2. Goal

1. **Language detection & persistence** — Detect from `localStorage["orderly-language"]` first, then `navigator.language`, fallback to `"en"`. Manual switches persist to `localStorage`.
2. **Anti-flash DOM sync** — Pre-hydration inline script in `index.html` sets `<html lang="...">` before React mounts (mirrors the `orderly-theme` script).
3. **Currency & number formatting** — `Intl.NumberFormat` with active locale + restaurant currency code for all monetary values, quantities, and percentages.
4. **Date & time formatting** — `date-fns` locale-aware helpers in `src/utils/date.ts` for all timestamps and relative times.
5. **Backend locale propagation** — `Accept-Language: <lang>` header on every RTK Query request.
6. **LanguageToggle UI** — Accessible `EN | ES` toggle integrated in all three zone top-bars.
7. **Agent mandate** — Every new feature, page, and test must be localised (see §9).

---

## 3. Out of scope

- RTL (Right-to-Left) layout — only LTR `en` and `es`.
- Machine translation of arbitrary free-text staff notes.
- Currency *conversion* (exchange rates) — only *formatting* of amounts already in the restaurant's configured currency.
- Third additional language.

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| i18n framework | `i18next` + `react-i18next` | Industry standard; `useTranslation()` hook; namespace lazy-load; strong TS support. |
| Language detector | `i18next-browser-languagedetector` | Handles `localStorage`, `navigator.language`, querystring out of the box. |
| Storage key | `orderly-language` | Consistent with `orderly-theme` naming. |
| Currency & numbers | `Intl.NumberFormat` (platform native) | Zero bundle cost; correct locale-aware formatting; supports currency symbol placement. |
| Date & relative time | `date-fns` with dynamic locale import | Already mandated in AGENTS.md; `enUS` / `es` locales are tree-shaken. |
| Plural rules | i18next `count` + `i18next-icu` or `i18next-intervalPlural` | Spanish has different plural forms than English for order counts, quantities, etc. |
| Type safety | `i18next-resources-to-backend` + generated `resources` type | Prevents missing-key regressions at compile time. |

---

## 5. Folder layout

```
src/
  locales/
    en/
      common.json       # Shared: nav, buttons, status labels, generic errors
      auth.json         # Login, refresh, permission-denied strings
      kds.json          # KDS zone: order queue, item states, timing labels
      orders.json       # Restaurant zone: order list, detail, create, bill-split
      admin.json        # Admin zone: staff management, roles, invite flow
      restaurant.json   # Restaurant zone (non-order): tables, reservations
    es/
      common.json
      auth.json
      kds.json
      orders.json
      admin.json
      restaurant.json
  lib/
    i18n.ts             # i18next init, detector config, namespace preloads
  hooks/
    useLanguage.ts      # { language, setLanguage, t, supportedLanguages }
  utils/
    date.ts             # (existing) extended with locale-aware helpers
    currency.ts         # NEW: Intl.NumberFormat currency/number helpers
  components/
    LanguageToggle/
      LanguageToggle.tsx
      LanguageToggle.css
      LanguageToggle.test.tsx
```

---

## 6. Specification

### 6.1 Language detection & persistence (`src/lib/i18n.ts`)

```
Detection order (i18next-browser-languagedetector):
  1. localStorage key: "orderly-language"
  2. navigator.languages[0]
  3. navigator.language
  4. Fallback: "en"
```

- **Supported languages**: `["en", "es"]`. Any detected value NOT in this list falls back to `"en"`.
- **Persist on change**: `i18n.changeLanguage(lang)` writes to `localStorage["orderly-language"]` and updates `document.documentElement.lang`.
- **Pre-hydration script** in `index.html` (inline `<script>`, before the module bundle):

```js
(function () {
  try {
    var supported = ["en", "es"];
    var stored = localStorage.getItem("orderly-language");
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    var navLang = nav.split("-")[0].toLowerCase();
    var resolved = supported.includes(stored) ? stored
      : supported.includes(navLang) ? navLang
      : "en";
    document.documentElement.setAttribute("lang", resolved);
  } catch (_e) {
    document.documentElement.setAttribute("lang", "en");
  }
})();
```

### 6.2 Date & time formatting (`src/utils/date.ts`)

> Current `date-fns` helpers (`formatRelativeTime`, `formatDate`) **must** accept an optional `locale` argument.

```ts
// Good — locale-aware
formatDate(order.createdAt, { locale: getDateFnsLocale(i18n.language) });
formatRelativeTime(order.createdAt, { locale: getDateFnsLocale(i18n.language) });

// Bad — no locale
formatDate(order.createdAt); // ❌ assumes en
```

Helper:
```ts
import { enUS, es } from "date-fns/locale";
const DATE_FNS_LOCALES: Record<string, Locale> = { en: enUS, es };
export function getDateFnsLocale(lang: string): Locale {
  return DATE_FNS_LOCALES[lang] ?? enUS;
}
```

**Native API opportunity** — For simple relative-time strings ("5 minutes ago"), `Intl.RelativeTimeFormat` is zero-bundle and baseline-supported. Consider it as a complementary fast-path for the KDS timer chips (where re-render speed matters more than `date-fns` formatting flexibility). Document the choice in the component.

### 6.3 Currency & number formatting (`src/utils/currency.ts`) — **NEW**

> [!IMPORTANT]
> **Always use `Intl.NumberFormat`** for monetary values, order totals, item prices, tax amounts, tip percentages, and split-bill amounts. Never concatenate `"$"` or `"€"` strings manually.

```ts
/**
 * Format a monetary value in the restaurant's configured currency.
 *
 * @param amount  - Raw number (e.g. 12.5 from the API)
 * @param currency - ISO 4217 code (e.g. "USD", "MXN"). From restaurant config.
 * @param locale   - BCP 47 tag: "en" | "es"
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a plain number (quantities, percentages, tip %).
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
```

**Why `Intl.NumberFormat` over a manual formatter:**
- Zero bundle cost (native platform API, Baseline: Widely available since 2018).
- Automatically handles decimal separator (`.` in `en`, `,` in `es-MX`), thousands grouping, and currency symbol position (`$12.50` vs `12,50 $`).
- `MXN` renders as `$12.50` in `en` and `$12.50 MXN` or `MX$12.50` in `es` depending on the locale tag — which is always correct.

**Currency source**: The restaurant's configured `currency` (ISO 4217) comes from the Catalog API (`/catalog-api/restaurants/:id`). It should be stored in Redux state and passed into `formatCurrency()` at the call site. **Never hardcode `"USD"`**.

### 6.4 Type-safe translation keys

Prevent missing-key bugs at compile time by exporting a typed `resources` object:

```ts
// src/lib/i18n.ts
import type en_common from "../locales/en/common.json";
import type en_orders from "../locales/en/orders.json";
// ... (one import per namespace)

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof en_common;
      orders: typeof en_orders;
      // ...
    };
  }
}
```

This makes `t("orders:createOrder.title")` a type error if the key doesn't exist in `en/orders.json`.

### 6.5 Plural rules

English and Spanish have different plural forms for counts. Use i18next's `count` interpolation:

```json
// en/orders.json
{
  "items": "{{count}} item",
  "items_one": "{{count}} item",
  "items_other": "{{count}} items"
}
// es/orders.json
{
  "items_one": "{{count}} artículo",
  "items_other": "{{count}} artículos"
}
```

Usage: `t("orders:items", { count: order.itemCount })` — i18next resolves the correct plural form per locale automatically.

### 6.6 Namespace loading strategy

- **Eagerly preload** `common` and the zone's primary namespace on init (e.g. `kds` for KDS zone, `orders` for Restaurant zone).
- **Lazy-load** secondary namespaces (`admin`, `restaurant`) only when the route is visited. Use i18next's `loadNamespaces()` inside the zone's route loader.
- **Fallback**: If a key is missing in `es`, i18next falls back to `en` automatically. A missing key in `en` renders the key string as a visible error signal during development.

### 6.7 `useLanguage` hook (`src/hooks/useLanguage.ts`)

```ts
interface UseLanguageResult {
  language: "en" | "es";
  setLanguage: (lang: "en" | "es") => void;
  supportedLanguages: readonly ["en", "es"];
}
```

`setLanguage` calls `i18n.changeLanguage()`, which triggers the detector's `cacheUserLanguage` to write `localStorage["orderly-language"]` and fires an `i18next.languageChanged` event. Components subscribed via `useTranslation()` re-render automatically.

### 6.8 `<LanguageToggle />` component

- Renders as a segmented button pair (`EN | ES`) using the Radix/Shadcn `ToggleGroup` primitive.
- Placed in the top-bar of all three zones (Admin, KDS, Restaurant) alongside `<ThemeToggle />`.
- Keyboard accessible: arrow-key navigation between `EN` and `ES`.
- `aria-label` is itself localised: `t("common:languageToggle.label")`.

### 6.9 API header injection (`src/lib/apiClient.ts`)

RTK Query `prepareHeaders` callback must read the active language and inject `Accept-Language`:

```ts
prepareHeaders: (headers) => {
  const lang = i18n.language ?? localStorage.getItem("orderly-language") ?? "en";
  headers.set("Accept-Language", lang);
  return headers;
},
```

---

## 7. Integration points

| Surface | What changes |
|---|---|
| `index.html` | Pre-hydration `<script>` for `lang` attribute sync |
| `src/lib/i18n.ts` | New file: i18next init |
| `src/lib/apiClient.ts` | `prepareHeaders` — add `Accept-Language` |
| `src/utils/date.ts` | `getDateFnsLocale()` helper; locale param on existing functions |
| `src/utils/currency.ts` | New file: `formatCurrency()`, `formatNumber()` |
| `src/hooks/useLanguage.ts` | New file: language hook |
| `src/locales/**` | New files: all translation namespaces |
| `src/components/LanguageToggle/` | New component |
| All zone top-bars | Render `<LanguageToggle />` |
| All JSX/TSX components | Replace hardcoded strings with `t()` / `<Trans />` |

---

## 8. Security guardrails

> [!CAUTION]
> Never render raw translation values as HTML (`dangerouslySetInnerHTML`) without explicit sanitization. Use `<Trans />` for rich-text translations that embed HTML elements.

| Risk | Mitigation |
|---|---|
| XSS via translation values | `react-i18next` escapes interpolation by default; `<Trans />` uses React elements, not raw HTML. |
| Missing-key silent failures | TypeScript typed resources (§6.4) + dev-mode missing-key handler that logs to console. |
| Invalid locale injection | Language is only set from `supportedLanguages = ["en", "es"]` allowlist; any other value falls back to `"en"`. |
| Currency symbol spoofing | Currency code always comes from the backend Catalog API restaurant record, never from user input. |

---

## 9. Rules for AI Agents & Developers

> [!IMPORTANT]
> These rules apply to **every feature, page, modal, table, form, toast, or test** added to OrderlyWeb, starting from Phase 1. They are non-negotiable.

1. **No hardcoded UI strings.** Every visible string in JSX/TSX must go through `t("namespace:key")` or `<Trans i18nKey="namespace:key" />`. Template literals like `` `Hello ${name}` `` inside JSX are banned.
2. **Dual-locale files always in sync.** When you add a key to `src/locales/en/<namespace>.json`, you **must** add the Spanish equivalent to `src/locales/es/<namespace>.json` in the same commit.
3. **Use plural forms.** Any string that wraps a count (items, orders, guests, minutes) must use `count` interpolation so i18next selects the correct plural.
4. **Currency via `formatCurrency()` only.** Any monetary value (price, total, tip, split amount) must call `formatCurrency(amount, currency, i18n.language)` from `src/utils/currency.ts`. No `"$" + amount.toFixed(2)`.
5. **Dates via `date-fns` helpers.** Always pass `getDateFnsLocale(i18n.language)` to `formatDate()` and `formatRelativeTime()`.
6. **Testing contract:**
   - Unit tests must wrap the component under test in `I18nextProvider` (or use the test helper — see below) and assert rendered text for **both** `en` and `es`.
   - Playwright E2E tests must include at least one critical flow (e.g. login, order list, KDS queue) executed under `es` locale by setting `localStorage["orderly-language"] = "es"` in the test setup.
7. **No new `style={{}}` on language-sensitive elements.** If text length changes between `en` and `es`, use CSS `flex-wrap`, `min-width`, or `text-overflow`; not inline widths.
8. **`<LanguageToggle />` in every zone top-bar.** New zones or sub-shells added to the router must include the toggle.

### Test helper

```ts
// src/test/i18n-wrapper.tsx
import i18n from "../lib/i18n";
import { I18nextProvider } from "react-i18next";

export function renderWithI18n(ui: ReactElement, lang: "en" | "es" = "en") {
  i18n.changeLanguage(lang);
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}
```

---

## 10. Development Phases

### Phase overview

| Phase | Name | Deliverables | Goal |
|:---:|---|---|---|
| **1** | Core Infrastructure & LocalStorage Sync | `i18n.ts`, pre-hydration script, `useLanguage.ts` | i18next boots; language persists; `<html lang>` synced |
| **2** | Formatting Layer | `currency.ts`, `date.ts` update, `apiClient.ts` header | All numbers, currencies, and dates are locale-aware |
| **3** | Translations & UI | Locale files for all 5 namespaces, `<LanguageToggle />` | Full site is translatable; toggle is in all three zone top-bars |
| **4** | Testing & CI | Unit test wrapper, Playwright locale fixture, lint rule | Every new PR is blocked if strings are hardcoded or keys are missing |

---

### Phase 1 — Core Infrastructure & LocalStorage Sync

**Goal**: i18next initialises, detects language, writes to `localStorage`, and syncs `<html lang>` before the first paint.

**Status**: ⏸ Pending

**Deliverables**:

- [ ] Install `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- [ ] Create `src/lib/i18n.ts` with detector config targeting `orderly-language`
- [ ] Add pre-hydration `<script>` to `index.html` (see §6.1 snippet)
- [ ] Create `src/hooks/useLanguage.ts` returning `{ language, setLanguage, supportedLanguages }`
- [ ] Wrap app root in `<I18nextProvider i18n={i18n}>` in `src/main.tsx`
- [ ] Add TypeScript `CustomTypeOptions` declaration (see §6.4)

**Exit criteria**: `localStorage["orderly-language"] = "es"`, hard-refresh → `<html lang="es">` and `i18n.language === "es"` before any React render.

---

### Phase 2 — Number / Currency / Date Formatting Layer

**Goal**: All monetary values, quantities, and timestamps are rendered through locale-aware formatters.

**Status**: ⏸ Pending (blocked on Phase 1)

**Deliverables**:

- [ ] Create `src/utils/currency.ts` with `formatCurrency()` and `formatNumber()` (see §6.3)
- [ ] Add `getDateFnsLocale()` to `src/utils/date.ts`; update `formatDate` and `formatRelativeTime` signatures to accept locale param
- [ ] Update `src/lib/apiClient.ts` `prepareHeaders` to inject `Accept-Language` (see §6.9)
- [ ] Audit all existing price/amount renders and replace with `formatCurrency()`

**Exit criteria**: `pnpm typecheck` passes; switching to `es` renders `$12,50` (comma decimal) for Spanish locales where applicable; `Accept-Language: es` visible in devtools network tab.

---

### Phase 3 — Translation Files, Namespaces & LanguageToggle UI

**Goal**: All user-facing strings are in locale files; `<LanguageToggle />` is in all three zone top-bars.

**Status**: ⏸ Pending (blocked on Phase 1)

**Deliverables**:

- [ ] Scaffold `src/locales/en/` and `src/locales/es/` with all 6 namespaces: `common`, `auth`, `kds`, `orders`, `admin`, `restaurant`
- [ ] Migrate all hardcoded strings in existing components to `t()` calls (both locales)
- [ ] Implement plural forms for count-bearing strings (§6.5)
- [ ] Build `<LanguageToggle />` using Radix `ToggleGroup` (§6.8); include `LanguageToggle.test.tsx`
- [ ] Add `<LanguageToggle />` to Admin, KDS, and Restaurant zone top-bars
- [ ] Configure lazy namespace loading (§6.6)

**Exit criteria**: Toggling `EN → ES` on the running dev server flips all visible labels; no English text remains hardcoded in any `.tsx` file (`grep -r 'className' src/` → 0 raw string literals in JSX text nodes); `pnpm lint` passes.

---

### Phase 4 — Testing Mandate & CI Enforcement

**Goal**: Every future PR is automatically blocked if it introduces hardcoded strings or missing locale keys.

**Status**: ⏸ Pending (blocked on Phase 3)

**Deliverables**:

- [ ] Add `src/test/i18n-wrapper.tsx` test helper (`renderWithI18n`) (see §9 snippet)
- [ ] Add Vitest tests for `<LanguageToggle />`, `formatCurrency()`, and `formatDate()` covering both `en` and `es`
- [ ] Add Playwright locale fixture: `e2e/fixtures/withLocale.ts` setting `localStorage["orderly-language"]`
- [ ] Add E2E smoke test covering login → order list in `es` locale
- [ ] Add oxlint custom rule (or `no-restricted-syntax` config) to flag raw string literals in JSX text positions
- [ ] Document Phase 4 adoption in `AGENTS.md` (update §Testing instructions)

**Exit criteria**: `pnpm test` and `pnpm test:e2e` both pass under `en` and `es`; a PR with a hardcoded string fails lint.

---

## 11. Technical considerations

### 11.1 Cross-cutting

**Plural forms** — `[⚠ must address in Phase 3]` Spanish has the same two-form plural as English, but the boundary condition (specifically for 0) differs by region. Use the i18next `count` key correctly; never hard-code `"s"` suffix.

**Currency + Locale tag precision** — `[⚠ must address in Phase 2]` `Intl.NumberFormat("es", { style: "currency", currency: "MXN" })` formats differently from `"es-MX"`. For US-based operations use `"en-US"`, for Mexican-based use `"es-MX"`. The restaurant's locale tag (BCP 47, e.g. `"es-MX"`) should be stored in the Catalog API restaurant config and sourced from Redux rather than using the bare `"es"` language code. **Add `localeTag` field to the restaurant Redux slice** to enable precise formatting.

**KDS re-render cost** — `[⚠ review in Phase 3]` The KDS order queue re-renders every few seconds. `Intl.NumberFormat` and `Intl.RelativeTimeFormat` instances are expensive to create on every render. Cache them per-locale with `useMemo` or a module-level `Map<string, Intl.NumberFormat>`.

**Accessible language announcement** — `[⚠ address in Phase 3]` When the user toggles from `EN` to `ES`, a live region (`aria-live="polite"`) should announce the change to screen reader users. The `<LanguageToggle />` component must include this.

**Missing key strategy** — `[⚠ address in Phase 1]` Configure `missingKeyHandler` in i18next to `console.warn` in development and silently fall back to the key string in production. This prevents blank UI without swallowing bugs.

**`navigator.language` vs `navigator.languages`** — `[address in Phase 1]` Use `navigator.languages[0]` (preferred list) rather than `navigator.language` (single value) for better browser compatibility. The `i18next-browser-languagedetector` handles this automatically via its `navigator` detector.

---

## Changelog

### v1.0 (2026-08-06) — Initial plan
- Created plan covering `en`/`es` support, localStorage persistence, pre-hydration script, date formatting, API header integration, and agent guidelines.

### v1.1 (2026-08-06) — Best-practices review applied
- Added §6.3: `formatCurrency()` / `formatNumber()` via `Intl.NumberFormat` (currency gap identified in review).
- Added §6.4: TypeScript typed resources to prevent missing-key regressions.
- Added §6.5: Plural rules specification with i18next `count` interpolation.
- Added §6.6: Namespace loading strategy (eager + lazy per zone).
- Added §6.8: Accessible language announcement (`aria-live`) requirement.
- Added §9 test helper `renderWithI18n` and Playwright locale fixture deliverable.
- Added §11 Technical Considerations: currency locale tag precision, KDS re-render cost, missing key strategy.
- Expanded Phase 2 to cover `currency.ts` and Phase 4 to cover lint enforcement.
- Renamed `restaurant.json` namespace added to folder layout.

### v1.2 (2026-08-06) — Phases 1–4 shipped
- **Phase 1**: Installed `i18next`, `react-i18next`, `i18next-browser-languagedetector`. Added `src/lib/i18n.ts` (detector wired to `orderly-language` localStorage key, typed `CustomTypeOptions`), `src/hooks/useLanguage.ts`, pre-hydration inline `<script>` in `index.html`, and `<I18nextProvider>` mount in `src/main.tsx`. Scaffolded the 6 namespaces × 2 locales (en/es) under `src/locales/`.
- **Phase 2**: Added `src/utils/currency.ts` (`formatCurrency`, `formatNumber`, `getCurrencyFormatter` with a module-level cache). Extended `src/utils/date.ts` with `getDateFnsLocale()` and an optional `locale` parameter on `formatDate` / `formatRelativeTime`. Injected `Accept-Language` into both `src/lib/apiClient.ts` and `src/app/api/base.ts` (RTK Query `prepareHeaders`).
- **Phase 3**: Built `<LanguageToggle />` in `src/components/LanguageToggle/` (Radix `ToggleGroup`, `aria-live` announcement, Vitest coverage). Added the toggle to the shared Header so all three zone top-bars render it. Wired `labelKey` translation keys into `ZoneSidebar` and the three zone layouts (`Admin`, `Kitchen`, `Restaurant`). Plural forms baked into the locale files via i18next `count` interpolation.
- **Phase 4**: Added `src/test/i18n-wrapper.tsx` (`renderWithI18n`, `setI18nLanguage`), `e2e/fixtures/withLocale.ts` (Playwright `withLocale` fixture that injects the localStorage key before navigation), and `e2e/locale.spec.ts` (smoke tests for `<html lang>` sync). Extended `currency.test.ts` and `date.test.ts` with Spanish coverage. Updated `AGENTS.md` testing-instructions section with the i18n testing contract.
