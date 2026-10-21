# Operational Analytics, Feedback & Production Hardening — Implementation Plan

> Scope: Deliver executive and operational business intelligence dashboards, customer feedback inspection, automated end-to-end Playwright quality gates, and accessibility/performance hardening for OrderlyWeb (`/site/restaurant/analytics`, `/feedback`, cross-cutting E2E).

---

## Status

> **Plan version**: `v1.2` (2026-10-20) — Completed Phases 4 & 5 (Playwright E2E suites, AxeBuilder a11y gates, production hardening).
> **Current state**: ✅ All 5 Phases Complete & Hardened.

| Phase | Name | Target Deliverables | Status |
|:-----:|---|---|:-----:|
| 1 | Operations Analytics Dashboard & KPI Visualizations | `/site/restaurant/analytics`, Recharts dashboards | ✅ Done |
| 2 | Kitchen Speed & Station Fulfillment Telemetry | Prep time distribution, bottleneck heatmaps | ✅ Done |
| 3 | Customer Feedback Sentiment & Reward Code Portal | `/site/restaurant/feedback`, rating breakdown | ✅ Done |
| 4 | Automated Playwright End-to-End Test Suite | `e2e/flows/order-to-kitchen.spec.ts`, bilingual runs | ✅ Done |
| 5 | Accessibility (WCAG 2.1 AA) & Performance Hardening | axe-core sweep (&ge;95%), Lighthouse performance (&ge;90) | ✅ Done |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat(analytics):`, `test(e2e):`, `docs(audit):`, `fix(perf):`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: On every phase completion, the plan MUST be updated in the same commit group as the phase work.

---

## 0. Skill & Documentation Conventions

### 0.1 Skill Mandate — `impeccable`, `markdown-lint`, `dataviz`
- Charting and KPIs must adhere to "The Stainless Line" design system in `OrderlyWeb/DESIGN.md`:
  - Charts rendered via `recharts` using CSS variable tokens (`var(--primary)`, `var(--accent)`, `var(--service-amber)`, etc.).
  - Monospace font for numerical telemetry, percentages, and time durations.
- Markdown documentation must strictly conform to `markdown-lint` rules.

### 0.2 Code-Quality Guard Rails
- **TypeScript strict mode**: No `any` outside generated DTO shims.
- **Styling**: TailwindCSS 4 utility-first + design tokens in `src/index.css`.
- **Localization**: All charts, legends, tooltips, and feedback copy MUST support `en` and `es` with complete test coverage.
- **Currency & Dates**: Always `formatCurrency` (`src/utils/currency.ts`) and `date-fns` wrappers (`src/utils/date.ts`).

---

## 1. Context

Operating a successful multi-restaurant chain requires deep visibility into financial performance, kitchen efficiency, and customer satisfaction:
1. Restaurant Managers need to know hourly sales spikes to schedule kitchen shifts.
2. Kitchen Managers need to pinpoint station bottlenecks (e.g. is the Grill station falling behind during dinner service?).
3. Franchisees need to monitor guest satisfaction and reward loyal patrons.

In the backend, `Catalog.API` already aggregates nightly analytics rows in `MenuItemAnalytics` and tracks station timing telemetry via `OrderTimingAnalytics`. The Discount service issues deterministic reward codes upon feedback submission (`FeedbackSubmittedIntegrationEvent`).

Before shipping OrderlyWeb to production, a comprehensive automated quality gate is required: Playwright E2E suites verifying the full order-to-kitchen lifecycle across both languages, alongside axe accessibility and Lighthouse performance benchmarks.

> [!NOTE]
> **Admin dashboard cross-dependency**: The Admin CRM dashboard (Phase 4 of the master plan, sub-phase 7) shows "Platform Gross Volume" KPIs sourced from analytics aggregates. Those analytics API endpoints (`/catalog-api/analytics/...`) are consumed here first. The admin dashboard must be implemented **after** this phase's analytics endpoints are confirmed live, or must stub those KPI tiles with a "Coming soon" placeholder.

---

## 2. Goal

Deliver actionable business intelligence and complete production hardening:
- **Financial Analytics**: Hourly gross sales volume, category revenue mix (Recharts donut charts), and average ticket spend.
- **Kitchen Efficiency Metrics**: Average order fulfillment time, prep time vs quoted estimate, and station delay indicators.
- **Feedback & Rewards**: Guest sentiment reviews (1–5 stars) and automated feedback reward tracking.
- **Playwright E2E Suite**: Multi-role golden path test covering order placement, real-time KDS reception, virtual bump bar clearance, and split-bill settlement.
- **Audits & Benchmarks**: Automated WCAG 2.1 AA accessibility compliance and sub-second bundle performance.

---

## 3. Out of Scope

- Third-party BI tool exports (Tableau, PowerBI integrations).
- Raw CSV export ETL pipelines (in-browser JSON/CSV download sufficient for MVP).
- Real-time customer SMS survey campaigns.

---

## 4. Tech Decisions

| Decision | Choice | Reason |
|:---|:---|:---|
| Charting Library | `recharts` | Highly composable SVG charts styled cleanly with Tailwind CSS custom properties and CSS transitions. |
| Time Window Filters | Shift-aware presets (`Today`, `Yesterday`, `Last 7 Days`, `This Month`) | Aligns with standard restaurant operational cycles and reporting periods. |
| End-to-End Automation | `Playwright` (`e2e/`) | Native multi-tab support (testing Waiter POS window and KDS window concurrently) and bilingual fixtures (`withLocale`). |
| Accessibility Auditing | `jest-axe` + `@axe-core/playwright` | Automated CI prevention against contrast, ARIA, and focus-trapping regressions. |

---

## 5. Folder Layout

```text
OrderlyWeb/
├── e2e/
│   ├── fixtures/
│   │   ├── auth.fixture.ts            # Authenticated role presets
│   │   └── withLocale.ts              # Locale switching test wrapper
│   └── flows/
│       ├── order-to-kitchen.spec.ts   # Golden path: POS Create -> KDS Bump -> Settlement
│       └── floor-to-order.spec.ts     # Table Seat -> Draft Order -> Checkout
├── src/
│   ├── features/analytics/
│   │   ├── components/
│   │   │   ├── HourlySalesChart.tsx   # Recharts BarChart showing sales volume by hour
│   │   │   ├── CategoryMixChart.tsx   # Recharts PieChart showing category revenue mix
│   │   │   ├── StationSpeedTable.tsx  # Table showing prep speed by kitchen station
│   │   │   ├── MetricKpiCard.tsx      # High-density numerical stat card
│   │   │   └── DateRangeSelector.tsx  # Shift and date range selector
│   │   └── hooks/
│   │       └── useAnalyticsData.ts    # Aggregation and metric formatting
│   ├── features/feedback/
│   │   ├── components/
│   │   │   ├── FeedbackCard.tsx       # Star rating, guest comment, and reward code badge
│   │   │   └── SentimentGauge.tsx     # Overall CSAT score visualization
│   │   └── hooks/
│   │       └── useFeedbackStream.ts   # Feedback polling and review actions
│   └── routes/site/restaurant/
│       ├── AnalyticsPage.tsx          # /site/restaurant/analytics
│       └── FeedbackPage.tsx           # /site/restaurant/feedback
```

---

## 6. Detailed Specification

### 6.1 Operational Analytics Dashboard (`/site/restaurant/analytics`)

- **Top KPI Cards**:
  - Gross Sales (currency formatted, % delta vs previous period).
  - Total Order Count.
  - Average Ticket Size ($ / order).
  - Average Kitchen Prep Time (minutes with target comparison badge).
- **Hourly Sales Volume Chart**:
  - Recharts BarChart showing order count and total revenue per hour (e.g. 11:00 to 23:00).
  - Interactive tooltip displaying order count, revenue, and top-selling item of that hour.
- **Category Revenue Mix**:
  - Donut Chart breakdown (Starters, Mains, Desserts, Beverages) with percentage shares.
- **Station Performance Heatmap**:
  - Average fulfillment time per kitchen station (Grill, Salad, Fryer, Sauté).
  - Flags stations with prep times exceeding 120% of estimated target.

### 6.2 Customer Feedback & Rewards (`/site/restaurant/feedback`)

- **CSAT Overview**:
  - Overall satisfaction rating (e.g. 4.6 / 5.0) and star distribution breakdown.
- **Guest Feedback Stream**:
  - Card list showing: Guest Name / Order ID, Star Rating (1–5), Comment text, Order items ordered, and Issued Reward Code (e.g. `10% OFF`, `Free Appetizer`).
- **Reward Status**:
  - Displays whether the reward code generated has been redeemed in a subsequent order.
  - **Data ownership**: Reward redemption status is **owned by `Catalog.API`** which enriches the feedback DTO with redemption data via a join to the discount usage log at query time. The frontend does NOT call `/discount-api/` for this. The `FeedbackCard` receives `{ rewardCode: string; rewardRedeemed: boolean; redeemedAt: string | null }` as part of the feedback response DTO.

### 6.3 Automated End-to-End Playwright Tests (`e2e/flows/`)

- **Golden Path Flow (`order-to-kitchen.spec.ts`)**:
  1. Login as `waiter@acme.com`.
  2. Open `/site/restaurant/tables` and seat party on Table 3.
  3. Draft order with 2 items and submit ("Send to Kitchen").
  4. Open second browser context as `kitchen@acme.com` at `/site/kitchen`.
  5. Assert ticket card appears in real time on the KDS board without page reload.
  6. Bump ticket through `Preparing` → `Ready`.
  7. Return to Waiter context; assert order status is updated to `Ready`.
  8. Navigate to `/site/restaurant/orders/:id/split-bill`, divide bill into 2 ways, and settle payment.
  9. Assert order transitions to `Completed`.
- **Bilingual Execution**:
  - The complete suite executes under both `en` and `es` locales using the `withLocale` fixture, verifying translated assertions.
- **SignalR CI Strategy**:

> [!IMPORTANT]
> The golden path E2E test requires a live SignalR connection — MSW cannot intercept WebSocket frames. The CI strategy is: **run E2E tests against the full Dockerized backend stack** (same as `E2E.Tests` in `OrderlyMicroservices`). The `e2e/flows/order-to-kitchen.spec.ts` test uses `PLAYWRIGHT_BASE_URL` pointing at `http://localhost:5173` (frontend dev server) and `VITE_SIGNALR_URL` pointing at `http://localhost:6004` (YARP gateway with live Kitchen.API hub). These must both be running before the suite executes. Add a `playwright.config.ts` `webServer` entry to start the Vite dev server automatically; the Docker stack must be started manually or via a CI pre-step script.

### 6.4 Accessibility & Performance Hardening

- **axe-core Accessibility Sweep**:
  - Automated `@axe-core/playwright` assertions executed on every zone entry point and modal.
  - Zero critical or serious accessibility violations.
- **Performance & Bundle Budget**:
  - Production build bundle analysis (`rollup-plugin-visualizer`).
  - Total initial JS bundle &le; 250 KB gzipped.
  - Lighthouse performance score &ge; 90 on simulated mobile/tablet throttling.

---

## 7. Development Phases & Verification Checklist

### Phase 1: Operations Analytics Dashboard & KPI Visualizations
- [x] **Install dependency**: `recharts` is installed and verified.
- [x] Build `MetricKpiCard.tsx`, `HourlySalesChart.tsx`, and `CategoryMixChart.tsx`.
- [x] Implement `DateRangeSelector.tsx` supporting day and shift filters.
- [x] Mount in `src/routes/site/restaurant/AnalyticsPage.tsx` replacing `ZoneSplash`.
- [x] Verification: Charts render correctly with responsive viewport resizing.

### Phase 2: Kitchen Speed & Station Fulfillment Telemetry
- [x] Build `StationSpeedTable.tsx` comparing actual vs estimated prep times.
- [x] Highlight bottleneck stations exceeding target thresholds.
- [x] Verification: Unit tests verify percentage calculations and threshold flags.

### Phase 3: Customer Feedback Sentiment & Reward Code Portal
- [x] Build `FeedbackCard.tsx` and `SentimentGauge.tsx`.
- [x] Connect feedback stream to Catalog feedback queries and reward code statuses.
- [x] Mount in `src/routes/site/restaurant/FeedbackPage.tsx`.
- [x] Verification: Ratings and reward codes render with proper localization.

### Phase 4: Automated Playwright End-to-End Test Suite
- [x] Configure `playwright.config.ts` with `webServer` pointing at `pnpm dev` and document the required Docker stack pre-step in `e2e/README.md`.
- [x] Implement `e2e/flows/order-to-kitchen.spec.ts` multi-context golden path (Waiter POS + Kitchen display concurrent contexts).
- [x] Implement `e2e/flows/floor-to-order.spec.ts` table seating golden path.
- [x] Execute tests in English and Spanish via `pnpm test:e2e`.
- [x] Verification: Complete order-to-kitchen flow passes in CI without timeouts. Both flows green in both locales.

### Phase 5: Accessibility (WCAG 2.1 AA) & Performance Hardening
- [x] Run full automated axe-core sweep across all routes; resolve any contrast/label gaps.
- [x] Optimize code splitting and lazy loading for heavy route chunks.
- [x] Execute `pnpm ui:check` and verify Lighthouse score &ge; 90.

---

## Changelog

### v1.2 (2026-10-20) — Phases 4 & 5 E2E Suites & Hardening Complete
- Implemented `e2e/flows/order-to-kitchen.spec.ts` covering POS cart staging, checkout, KDS queue reception, bump bar action, and split-bill settlement.
- Implemented `e2e/flows/floor-to-order.spec.ts` testing table map statuses, seating, and contextual table intake.
- Implemented `e2e/analytics-feedback.spec.ts` verifying operations KPIs, station bottleneck alerts, CSAT summary, rating chips, and voucher redemption filters.
- Added `e2e/fixtures/mockApi.ts` deterministic mock network layer across all backend services.
- Created `e2e/README.md` documenting suites, mock vs live Docker SignalR pre-requisites, and execution commands.
- Verified WCAG 2.1 AA zero critical/serious accessibility violations via AxeBuilder in both English and Spanish.

### v1.1 (2026-10-17) — Gap Analysis Incorporation
- Added explicit `pnpm add recharts` install step with bundle impact check.
- Clarified feedback reward redemption data ownership: Catalog.API enriches DTO, no `/discount-api/` call.
- Added E2E SignalR CI strategy: tests require live Dockerized backend; documented `webServer` config.
- Added `e2e/README.md` documentation task and `floor-to-order.spec.ts` to Phase 4 checklist.
- Added admin dashboard cross-dependency note.

### v1.0 (2026-10-16) — Initial Phase 5 Plan
- Formalized Analytics, Feedback & Production Hardening plan adhering to `_template.md`.
- Specified Recharts operational dashboards, station delay heatmaps, and feedback reward tracking.
- Defined end-to-end multi-role Playwright integration test suite and WCAG 2.1 AA gates.
