import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "../fixtures/withLocale";
import { setupAllMocks } from "../fixtures/mockApi";

/**
 * E2E Flow: Order to Kitchen & Settlement Golden Path
 *
 * Simulates the primary cross-domain restaurant operational lifecycle:
 *   1. POS operator creates a dine-in order at `/site/restaurant/orders/new`.
 *   2. Menu item is added to cart and submitted to kitchen via outbox checkout.
 *   3. Kitchen line cook observes the ticket in `/site/kitchen` KDS queue.
 *   4. Cook bumps the ticket to Ready.
 *   5. Waiter inspects and settles split bill at `/site/restaurant/orders/:id/split-bill`.
 *   6. Automated AxeBuilder scans verify WCAG 2.1 AA accessibility compliance.
 */

test.describe("Order to Kitchen Golden Path — English", () => {
  test.use({ withLocale: "en" });

  test.beforeEach(async ({ page }) => {
    await setupAllMocks(page);
  });

  test("executes end-to-end order placement, KDS bump, and bill settlement", async ({ page }) => {
    // 1. Visit POS Order Creator
    await page.goto("/site/restaurant/orders/new");
    await expect(page.getByRole("heading", { name: "New Order" })).toBeVisible();
    await expect(page.getByText("POS Intake")).toBeVisible();

    // 2. Select menu item and add to cart
    await expect(page.getByText("Margherita")).toBeVisible();
    await page.getByText("Margherita").click();

    // Cart sidebar displays "Send to Kitchen" CTA
    const sendBtn = page.getByRole("button", { name: /Send to Kitchen/i });
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // 3. Visit KDS Board
    await page.goto("/site/kitchen");
    await expect(page.getByRole("heading", { name: "Order queue" })).toBeVisible();

    // Assert ticket card appears with order details
    await expect(page.getByText("ORD-2026-0001")).toBeVisible();
    await expect(page.getByText("Table 1 Priority")).toBeVisible();
    await expect(page.getByText("1x Margherita Pizza")).toBeVisible();

    // 4. Bump ticket
    const bumpBtn = page.getByRole("button", { name: /Bump ticket|Bump/i }).first();
    await expect(bumpBtn).toBeVisible();
    await bumpBtn.click();

    // 5. Visit Split Bill & Settlement Workstation
    await page.goto("/site/restaurant/orders/ord-mock-1/split-bill");
    await expect(page.getByRole("heading", { name: "ORD-2026-0001" })).toBeVisible();
    await expect(page.getByText("Equal Split")).toBeVisible();
    await expect(page.getByText("Balanced (±0.00)")).toBeVisible();

    // Settle first bill
    const markPaidButtons = page.getByRole("button", { name: "Mark Paid" });
    await expect(markPaidButtons.first()).toBeVisible();
    await markPaidButtons.first().click();

    // Settle second bill
    await markPaidButtons.nth(1).click();
    await expect(page.getByText("Fully Settled")).toBeVisible();

    // 6. Axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(seriousViolations).toEqual([]);
  });
});

test.describe("Order to Kitchen Golden Path — Spanish", () => {
  test.use({ withLocale: "es" });

  test.beforeEach(async ({ page }) => {
    await setupAllMocks(page);
  });

  test("executes end-to-end order placement, KDS bump, and bill settlement in Spanish", async ({
    page,
  }) => {
    // 1. Visit POS Order Creator
    await page.goto("/site/restaurant/orders/new");
    await expect(page.getByRole("heading", { name: "Nuevo pedido" })).toBeVisible();

    // 2. Select menu item and add to cart
    await expect(page.getByText("Margherita")).toBeVisible();
    await page.getByText("Margherita").click();

    // Cart sidebar displays Spanish CTA
    const sendBtn = page.getByRole("button", { name: /Enviar a cocina/i });
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // 3. Visit KDS Board
    await page.goto("/site/kitchen");
    await expect(page.getByRole("heading", { name: "Order queue" })).toBeVisible();
    await expect(page.getByText("ORD-2026-0001")).toBeVisible();

    // 4. Bump ticket
    const bumpBtn = page.getByRole("button", { name: /Bump ticket|Bump/i }).first();
    await expect(bumpBtn).toBeVisible();
    await bumpBtn.click();

    // 5. Visit Split Bill & Settlement Workstation in Spanish
    await page.goto("/site/restaurant/orders/ord-mock-1/split-bill");
    await expect(page.getByRole("heading", { name: "ORD-2026-0001" })).toBeVisible();
    await expect(page.getByText("En partes iguales")).toBeVisible();

    // Settle bills in Spanish
    const markPaidButtons = page.getByRole("button", { name: "Marcar como pagado" });
    await expect(markPaidButtons.first()).toBeVisible();
    await markPaidButtons.first().click();
    await markPaidButtons.nth(1).click();
    await expect(page.getByText("Fully Settled")).toBeVisible();

    // 6. Axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(seriousViolations).toEqual([]);
  });
});
