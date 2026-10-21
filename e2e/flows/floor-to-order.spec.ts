import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "../fixtures/withLocale";
import { setupAllMocks } from "../fixtures/mockApi";

/**
 * E2E Flow: Floor Plan to Order Creation Golden Path
 *
 * Verifies floor management and smart table routing:
 *   1. Host/manager inspects dining room tables and status indicators at `/site/restaurant/tables`.
 *   2. Operator triggers "Take Order" action on available table (T1).
 *   3. Application smoothly transitions to `/site/restaurant/orders/new?tableId=t-1` with pre-bound table context.
 *   4. Verified under both English and Spanish locales.
 *   5. Automated AxeBuilder scan ensures zero serious/critical accessibility violations.
 */

test.describe("Floor to Order Golden Path — English", () => {
  test.use({ withLocale: "en" });

  test.beforeEach(async ({ page }) => {
    await setupAllMocks(page);
  });

  test("renders floor plan, asserts table statuses, and transitions to order creation", async ({
    page,
  }) => {
    // 1. Visit Floor Plan
    await page.goto("/site/restaurant/tables");
    await expect(page.getByRole("heading", { name: "Tables & Floor Plan" })).toBeVisible();

    // 2. Assert table cards
    await expect(page.locator('[data-testid="table-card-T1"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-card-T2"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-card-T3"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-card-T4"]')).toBeVisible();

    // Assert status badges and party capacities
    await expect(page.getByText("Available").first()).toBeVisible();
    await expect(page.getByText("Occupied")).toBeVisible();
    await expect(page.getByText("Reserved")).toBeVisible();
    await expect(page.getByText("Needs Cleaning")).toBeVisible();

    // 3. Accessibility scan on floor plan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(seriousViolations).toEqual([]);

    // 4. Click "Take Order" on table T1
    const takeOrderBtn = page
      .locator('[data-testid="table-card-T1"]')
      .getByRole("link", { name: "Take Order" });
    await expect(takeOrderBtn).toBeVisible();
    await takeOrderBtn.click();

    // 5. Assert transition to Order Creator with pre-selected table
    await page.waitForURL(/\/site\/restaurant\/orders\/new\?tableId=t-1/);
    await expect(page.getByRole("heading", { name: "New Order" })).toBeVisible();
    await expect(page.getByText("Table t-1")).toBeVisible();
  });
});

test.describe("Floor to Order Golden Path — Spanish", () => {
  test.use({ withLocale: "es" });

  test.beforeEach(async ({ page }) => {
    await setupAllMocks(page);
  });

  test("renders floor plan and transitions to order creation in Spanish", async ({ page }) => {
    // 1. Visit Floor Plan
    await page.goto("/site/restaurant/tables");
    await expect(page.getByRole("heading", { name: "Mesas y plano de sala" })).toBeVisible();

    // 2. Assert table cards
    await expect(page.locator('[data-testid="table-card-T1"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-card-T2"]')).toBeVisible();

    // 3. Accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(seriousViolations).toEqual([]);

    // 4. Click "Take Order" on table T1
    const takeOrderBtn = page
      .locator('[data-testid="table-card-T1"]')
      .getByRole("link", { name: "Take Order" });
    await expect(takeOrderBtn).toBeVisible();
    await takeOrderBtn.click();

    // 5. Assert transition to localized Order Creator with table context
    await page.waitForURL(/\/site\/restaurant\/orders\/new\?tableId=t-1/);
    await expect(page.getByRole("heading", { name: "Nuevo pedido" })).toBeVisible();
    await expect(page.getByText("Table t-1")).toBeVisible();
  });
});
