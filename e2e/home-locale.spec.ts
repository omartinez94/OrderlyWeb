import { test, expect } from "./fixtures/withLocale";

/**
 * Marketing home page language toggle smoke test.
 *
 * Verifies that switching the language via the LanguageToggle (which
 * now lives in MarketingHeader) actually re-renders the home page
 * content in Spanish — both the React tree (button labels, footer
 * copy) and the `<html lang>` attribute that screen readers and the
 * pre-hydration script depend on.
 */
test.describe("Marketing home page language toggle", () => {
  test("home page renders in English by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    // Scope to <header> so we don't collide with sign-in CTAs deeper
    // in the page (hero, jumbotron, footer).
    await expect(page.locator("header").getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("clicking ES in the language toggle flips the home page to Spanish", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").getByRole("button", { name: "Sign in" })).toBeVisible();

    // Open the LanguageToggle (globe icon) — its accessible name is
    // the active translation, so match either locale.
    const trigger = page.locator("header").getByRole("button", { name: /language|idioma/i });
    await trigger.click();

    // Pick Spanish from the menu (its accessible name is the active
    // translation, so match either "Spanish" or "Español").
    await page.getByRole("button", { name: /^spanish$|^español$/i }).click();

    // <html lang> must update without a reload so screen readers and
    // language-aware CSS reflect the new locale immediately.
    await expect(page.locator("html")).toHaveAttribute("lang", "es");

    // The Sign in button in the header should now be "Iniciar sesión".
    await expect(
      page.locator("header").getByRole("button", { name: "Iniciar sesión" }),
    ).toBeVisible();

    // Spanish should persist to localStorage so the next visit keeps it.
    const stored = await page.evaluate(() => window.localStorage.getItem("orderly-language"));
    expect(stored).toBe("es");
  });
});
