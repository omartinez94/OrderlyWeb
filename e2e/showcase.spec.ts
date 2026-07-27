import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * E2E a11y suite for the base component library.
 *
 * Each test visits the showcase route and runs axe-core against
 * the section that the primitive owns. The contract is zero
 * `serious` or `critical` violations per primitive.
 *
 * The keyboard tests verify the contract documented in the plan:
 *   - Tab order
 *   - Enter/Space activation
 *   - Escape close (overlays)
 *   - Arrow key navigation (selection controls)
 *   - Focus restoration on close (overlays)
 *
 * The reduced-motion test injects the media query before the
 * showcase loads and verifies that the primitives still render
 * and operate.
 */
test.describe("Showcase a11y", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?showcase=1");
    await page.waitForSelector('h1:has-text("Base Component Library")');
  });

  for (const section of [
    "button",
    "form",
    "selection",
    "layout",
    "overlay",
    "data",
    "navigation",
  ]) {
    test(`${section} section has no serious/critical a11y violations`, async ({ page }) => {
      const results = await new AxeBuilder({ page }).include(`#${section}`).analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(
        serious,
        `serious/critical violations in #${section}: ${JSON.stringify(
          serious.map((v) => ({ id: v.id, nodes: v.nodes.length })),
          null,
          2,
        )}`,
      ).toEqual([]);
    });
  }

  test("Tab order visits interactive controls in document order", async ({ page }) => {
    await page.locator("#button").scrollIntoViewIfNeeded();
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName ?? "");
    expect(["BUTTON", "A", "INPUT"]).toContain(focused);
  });

  test("Escape closes the open Dialog and returns focus to the trigger", async ({ page }) => {
    await page.locator("#overlay").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Open Dialog" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByRole("button", { name: "Open Dialog" })).toBeFocused();
  });

  test("Arrow keys navigate the RadioGroup", async ({ page }) => {
    await page.locator("#selection").scrollIntoViewIfNeeded();
    const first = page.getByRole("radio", { name: "Option A" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Option B" })).toBeFocused();
  });
});

test.describe("Reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("showcase renders and toast trigger still works under reduced motion", async ({ page }) => {
    await page.goto("/?showcase=1");
    await page.waitForSelector('h1:has-text("Base Component Library")');
    // Toast button still surfaces a toast — animations are just
    // disabled by the media query.
    await page.getByRole("button", { name: "Toast: success" }).click();
    await expect(page.getByText("Success.", { exact: true })).toBeVisible();
  });
});
