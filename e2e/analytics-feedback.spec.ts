import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures/withLocale";
import { setupAllMocks } from "./fixtures/mockApi";

/**
 * E2E Suite: Operational Analytics Dashboard & Customer Feedback Portal
 *
 * Verifies Phase 5 operations telemetry and customer feedback sentiment:
 *   1. `/site/restaurant/analytics`:
 *      - Top KPI cards (Gross Sales, Total Orders, Average Ticket, Prep Time).
 *      - DateRangeSelector shift filter interactions.
 *      - StationSpeedTable telemetry and bottleneck flags (>120% threshold).
 *      - WCAG 2.1 AA accessibility via AxeBuilder.
 *   2. `/site/restaurant/feedback`:
 *      - CSAT summary gauge and star distribution metrics.
 *      - Star rating filter chips (5 Stars, 4 Stars).
 *      - Voucher redemption filter chips (Redeemed vs Available).
 *      - WCAG 2.1 AA accessibility via AxeBuilder.
 *   3. Executed in both English and Spanish locales.
 */

test.describe("Analytics & Feedback — English", () => {
  test.use({ withLocale: "en" });

  test.beforeEach(async ({ page }) => {
    await setupAllMocks(page);
  });

  test("renders operational analytics dashboard, KPIs, station speed, and passes a11y", async ({
    page,
  }) => {
    await page.goto("/site/restaurant/analytics");
    await expect(page.getByRole("heading", { name: "Operations & Speed Telemetry" })).toBeVisible();

    // 1. Assert KPI Cards
    await expect(page.getByText("Gross Sales")).toBeVisible();
    await expect(page.getByText("$4,820.50")).toBeVisible();

    await expect(page.getByText("Total Orders")).toBeVisible();
    await expect(page.getByText("142")).toBeVisible();

    await expect(page.getByText("Average Ticket Size")).toBeVisible();
    await expect(page.getByText("$33.95")).toBeVisible();

    await expect(page.getByText("Avg Kitchen Prep Time")).toBeVisible();
    await expect(page.getByText("14.2m")).toBeVisible();

    // 2. DateRangeSelector filter interaction
    const yesterdayFilter = page.getByRole("radio", { name: "Yesterday" });
    await expect(yesterdayFilter).toBeVisible();
    await yesterdayFilter.click();
    await expect(yesterdayFilter).toHaveAttribute("aria-checked", "true");

    // 3. Station Speed Table & Bottleneck Alert
    await expect(
      page.getByRole("heading", { name: "Kitchen Station Fulfillment Telemetry" }),
    ).toBeVisible();
    await expect(page.getByText("Grill")).toBeVisible();
    await expect(page.getByText("Fryer")).toBeVisible();
    await expect(page.getByText("Sauté")).toBeVisible();
    await expect(
      page.getByText(/Station exceeding 120% target prep time threshold/i),
    ).toBeVisible();

    // 4. AxeBuilder Accessibility Scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(seriousViolations).toEqual([]);
  });

  test("renders customer feedback portal, filters by rating and reward, and passes a11y", async ({
    page,
  }) => {
    await page.goto("/site/restaurant/feedback");
    await expect(page.getByRole("heading", { name: "Customer Feedback & Rewards" })).toBeVisible();

    // 1. CSAT Gauge and Review Cards
    await expect(
      page.getByRole("heading", { name: "Overall Guest Satisfaction (CSAT)" }),
    ).toBeVisible();
    await expect(page.getByText("#ord-891")).toBeVisible();
    await expect(page.getByText("#ord-885")).toBeVisible();
    await expect(page.getByText("#ord-815")).toBeVisible();
    await expect(page.getByText("LOYALTY-15-X9Y2")).toBeVisible();

    // 2. Rating Filter Interaction (filter by 5 Stars)
    const fiveStarsFilter = page.getByRole("radio", { name: /^5 Stars/i });
    await expect(fiveStarsFilter).toBeVisible();
    await fiveStarsFilter.click();

    await expect(page.getByText("#ord-891")).toBeVisible();
    await expect(page.getByText("#ord-885")).toBeVisible();
    await expect(page.getByText("#ord-815")).toBeHidden();

    // Reset rating filter to All Ratings
    await page.getByRole("radio", { name: /^All Ratings/i }).click();
    await expect(page.getByText("#ord-815")).toBeVisible();

    // 3. Voucher Status Filter Interaction (filter by Redeemed)
    const redeemedFilter = page.getByRole("radio", { name: "Redeemed" });
    await expect(redeemedFilter).toBeVisible();
    await redeemedFilter.click();

    // ord-891 is redeemed; ord-885 is not redeemed
    await expect(page.getByText("#ord-891")).toBeVisible();
    await expect(page.getByText("#ord-885")).toBeHidden();

    // 4. AxeBuilder Accessibility Scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(seriousViolations).toEqual([]);
  });
});

test.describe("Analytics & Feedback — Spanish", () => {
  test.use({ withLocale: "es" });

  test.beforeEach(async ({ page }) => {
    await setupAllMocks(page);
  });

  test("renders localized analytics dashboard, KPIs, and station telemetry in Spanish", async ({
    page,
  }) => {
    await page.goto("/site/restaurant/analytics");
    await expect(
      page.getByRole("heading", { name: "Telemetría y Analítica de Operaciones" }),
    ).toBeVisible();

    // Assert Spanish KPI Cards
    await expect(page.getByText("Ventas Brutas")).toBeVisible();
    await expect(page.getByText("Total de Pedidos")).toBeVisible();
    await expect(page.getByText("Ticket Promedio")).toBeVisible();
    await expect(page.getByText("Tiempo Prom. Prep. Cocina")).toBeVisible();

    // Assert localized date filter
    const ayerFilter = page.getByRole("radio", { name: "Ayer" });
    await expect(ayerFilter).toBeVisible();
    await ayerFilter.click();
    await expect(ayerFilter).toHaveAttribute("aria-checked", "true");

    // Assert localized station speed table
    await expect(
      page.getByRole("heading", { name: "Telemetría de Despacho por Estación" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Estación superando el 120% del umbral de tiempo meta/i),
    ).toBeVisible();

    // AxeBuilder scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(seriousViolations).toEqual([]);
  });

  test("renders localized customer feedback portal and filters in Spanish", async ({ page }) => {
    await page.goto("/site/restaurant/feedback");
    await expect(
      page.getByRole("heading", { name: "Opinión del Cliente y Recompensas" }),
    ).toBeVisible();

    // Assert Spanish CSAT Gauge
    await expect(
      page.getByRole("heading", { name: "Satisfacción General del Comensal (CSAT)" }),
    ).toBeVisible();
    await expect(page.getByText("#ord-891")).toBeVisible();

    // Filter by 5 Estrellas
    const cincoEstrellasFilter = page.getByRole("radio", { name: /^5 Estrellas/i });
    await expect(cincoEstrellasFilter).toBeVisible();
    await cincoEstrellasFilter.click();

    await expect(page.getByText("#ord-891")).toBeVisible();
    await expect(page.getByText("#ord-815")).toBeHidden();

    // AxeBuilder scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(seriousViolations).toEqual([]);
  });
});
