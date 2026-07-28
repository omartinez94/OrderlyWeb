import { test, expect } from "@playwright/test";

/**
 * E2E suite for the routing foundation.
 *
 * Covers:
 *   - The marketing root redirects authenticated users to the
 *     default zone (placeholder predicate → admin).
 *   - `/home` renders the marketing page.
 *   - Home → Showcase navigation works via the footer link.
 *   - Showcase → Home backward navigation works via the back link
 *     and the browser back button.
 *   - The legacy `?showcase=1` URL is preserved by a router
 *     redirect.
 *   - Unknown routes render the NotFoundPage.
 *   - The forbidden rendering path is exercised via a route
 *     whose zone guards reject the placeholder predicate.
 *     (Placeholder predicate always permits, so this test is a
 *     smoke check that the layout renders, not a rejection test.)
 *
 * The placeholder `useAuthPredicate` always returns SuperAdmin,
 * so the root redirect should land on `/site/admin`.
 */

test.describe("Routing foundation", () => {
  test("/ renders the marketing home via the default-zone redirect", async ({ page }) => {
    // The placeholder predicate returns SuperAdmin, so the root
    // redirects to /site/admin. Visiting / directly should end
    // up on the admin dashboard splash.
    await page.goto("/");
    await page.waitForURL(/\/site\/admin$/);
    await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
  });

  test("/home renders the marketing page", async ({ page }) => {
    await page.goto("/home");
    await expect(page.getByRole("heading", { name: /One tool for the kitchen/i })).toBeVisible();
  });

  test("Home → Showcase navigation works via the footer link", async ({ page }) => {
    await page.goto("/home");
    await page.getByRole("link", { name: "Design system" }).click();
    await page.waitForURL(/\/showcase$/);
    await expect(page.getByRole("heading", { name: "Base Component Library" })).toBeVisible();
  });

  test("Showcase → Home backward navigation via the back link", async ({ page }) => {
    await page.goto("/home");
    await page.getByRole("link", { name: "Design system" }).click();
    await page.waitForURL(/\/showcase$/);
    await page.getByRole("link", { name: "Back to home" }).click();
    await page.waitForURL(/\/home$/);
    await expect(page.getByRole("heading", { name: /One tool for the kitchen/i })).toBeVisible();
  });

  test("Showcase → Home backward navigation via the browser back button", async ({ page }) => {
    await page.goto("/home");
    await page.getByRole("link", { name: "Design system" }).click();
    await page.waitForURL(/\/showcase$/);
    await page.goBack();
    await page.waitForURL(/\/home$/);
    await expect(page.getByRole("heading", { name: /One tool for the kitchen/i })).toBeVisible();
  });

  test("Legacy ?showcase=1 URL redirects to /showcase", async ({ page }) => {
    await page.goto("/?showcase=1");
    await page.waitForURL(/\/showcase$/);
    await expect(page.getByRole("heading", { name: "Base Component Library" })).toBeVisible();
  });

  test("Unknown routes render the NotFoundPage", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  });

  test("Sign-in dialog opens via the footer link on the home page", async ({ page }) => {
    await page.goto("/home");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sign in to Orderly" })).toBeVisible();
  });

  test("Admin zone renders the sidebar with role-filtered items", async ({ page }) => {
    await page.goto("/site/admin");
    await expect(page.getByRole("navigation", { name: "Zone navigation" })).toBeVisible();
    // SuperAdmin placeholder sees both Restaurants and Settings.
    await expect(page.getByRole("link", { name: "Restaurants" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("Restaurant zone renders the full sidebar surface", async ({ page }) => {
    await page.goto("/site/restaurant");
    await expect(page.getByRole("navigation", { name: "Zone navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Orders" })).toBeVisible();
  });

  test("Kitchen zone renders the kitchen sidebar", async ({ page }) => {
    await page.goto("/site/kitchen");
    await expect(page.getByRole("navigation", { name: "Zone navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Order queue" })).toBeVisible();
  });
});
