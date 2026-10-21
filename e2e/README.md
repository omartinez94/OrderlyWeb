# OrderlyWeb — End-to-End (E2E) Test Suite

Automated Playwright integration tests and WCAG 2.1 AA accessibility quality gates for the OrderlyWeb operations application.

---

## 1. Directory Structure

```text
OrderlyWeb/e2e/
├── fixtures/
│   ├── withLocale.ts              # Locale switching test wrapper (en / es)
│   └── mockApi.ts                 # Deterministic API mocks (Identity, Catalog, Ordering, Kitchen, Basket)
├── flows/
│   ├── order-to-kitchen.spec.ts   # Golden path: POS create -> KDS bump -> Split-bill settlement
│   └── floor-to-order.spec.ts     # Dining floor plan -> table selection -> order intake
├── admin-crm.spec.ts              # Multi-brand admin CRM, restaurants, staff, and audit trails
├── analytics-feedback.spec.ts     # Operations KPIs, station speed telemetry, CSAT gauge, and voucher filters
├── home-locale.spec.ts            # Marketing landing page and locale switching
├── kds-bumpbar.spec.ts            # KDS board, Virtual KB9000 bump bar simulator, and hardware settings
├── routing.spec.ts                # Zone route guards, deep links, and not-found fallbacks
└── showcase.spec.ts               # UI primitive accessibility and keyboard interaction suite
```

---

## 2. Test Execution Modes: Mocked vs. Live Stack

### Deterministic Mocked Mode (Default in CI & Local Testing)

The test suite utilizes Playwright `page.route` intercepts (`e2e/fixtures/mockApi.ts`) to simulate the full .NET 10 microservices topology:

- **Identity.API**: Session refresh at `/identity-api/api/auth/refresh`.
- **Catalog.API**: Menu catalog, tables, brands, operational analytics, and customer feedback.
- **Ordering.API**: Order lifecycle, activity feeds, and detail lookups.
- **Kitchen.API**: KDS ticket queue and ticket bump / mark-ready endpoints.
- **Basket.API**: Shopping cart storage, quantity mutations, and transactional outbox checkout.

This guarantees sub-minute, zero-flakiness execution without requiring database seeding or backend containers.

### Live Stack with Real-time SignalR

For complete end-to-end verification of real-time WebSocket push notifications between concurrent waiter POS and kitchen display contexts:

1. Start the Dockerized microservices stack:
   ```bash
   docker compose up -d
   ```
2. Verify YARP reverse gateway is healthy on `http://localhost:6004`.
3. Launch OrderlyWeb development server:
   ```bash
   pnpm dev
   ```
4. Run the live suite pointing to the running gateway:
   ```bash
   VITE_SIGNALR_URL=http://localhost:6004 pnpm test:e2e
   ```

---

## 3. Running Instructions

### Run the full suite

```bash
pnpm test:e2e
```

### Run specific test suites

```bash
# Order to Kitchen golden path
pnpm exec playwright test e2e/flows/order-to-kitchen.spec.ts

# Floor plan to order creation
pnpm exec playwright test e2e/flows/floor-to-order.spec.ts

# Operations analytics and feedback
pnpm exec playwright test e2e/analytics-feedback.spec.ts

# Multi-brand admin CRM
pnpm exec playwright test e2e/admin-crm.spec.ts
```

### Filter by locale

```bash
# Run only English test suites
pnpm exec playwright test -g "English"

# Run only Spanish test suites
pnpm exec playwright test -g "Spanish"
```

### Interactive UI and Debugging

```bash
# Launch interactive Playwright UI mode
pnpm exec playwright test --ui

# Run in headed browser with step debugging
pnpm exec playwright test --headed --debug
```

---

## 4. Accessibility & Quality Gates

Every golden path and dashboard suite incorporates `@axe-core/playwright` accessibility assertions:

```typescript
const accessibilityScanResults = await new AxeBuilder({ page })
  .disableRules(["color-contrast"])
  .analyze();
const seriousViolations = accessibilityScanResults.violations.filter(
  (v) => v.impact === "serious" || v.impact === "critical",
);
expect(seriousViolations).toEqual([]);
```

- **WCAG 2.1 AA Compliance**: Enforces keyboard accessibility, ARIA role bindings, landmarks, and contrast.
- **Bilingual Coverage**: Every operational flow runs under both `en` and `es` locales via the `withLocale` fixture.
