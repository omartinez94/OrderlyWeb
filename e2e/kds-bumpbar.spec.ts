import { test, expect } from "@playwright/test";

test.describe("KDS Bump Bar & Virtual Hardware Simulator", () => {
  test("renders kitchen order queue and bump bar launcher at /site/kitchen", async ({ page }) => {
    await page.goto("/site/kitchen");
    await expect(page.getByRole("heading", { name: "Order queue" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Open Virtual Bump Bar/i })).toBeVisible();
  });

  test("renders standalone popup layout at /site/kitchen/virtual-bumpbar", async ({ page }) => {
    await page.goto("/site/kitchen/virtual-bumpbar");
    await expect(page.getByText("LOGIC CONTROLS KB9000")).toBeVisible();
    await expect(page.getByRole("button", { name: /BUMP/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /RECALL/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /PREV/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /NEXT/i })).toBeVisible();
  });

  test("renders hardware settings and calibration matrix at /site/kitchen/settings", async ({
    page,
  }) => {
    await page.goto("/site/kitchen/settings");
    await expect(page.getByRole("heading", { name: "KDS settings" })).toBeVisible();
    await expect(page.getByText("Logic Controls KB9000")).toBeVisible();
    await expect(page.getByText("10-Key Numeric Pad")).toBeVisible();
    await expect(page.getByText(/Live scan code key tester/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Test Chime/i })).toBeVisible();
  });
});
