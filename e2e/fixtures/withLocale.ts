import { test as base, expect } from "@playwright/test";

/**
 * Locale-aware Playwright fixture.
 *
 * Extends the default `test` so a test can request a specific locale
 * via `test.use({ locale: "es" })` or via the `{ withLocale: "es" }`
 * argument. The fixture sets `localStorage["orderly-language"]` on
 * the first navigation, then reloads so the pre-hydration script in
 * `index.html` picks it up before React mounts.
 *
 * Per `.agents/plans/i18n-localization.md` §9, every critical
 * flow must run under both `en` and `es`. This fixture is the
 * shared mechanism for that.
 *
 * Usage:
 *   import { test, expect } from "../fixtures/withLocale";
 *
 *   test("login button is localised in Spanish", async ({ page }) => {
 *     // locale is already "es" thanks to the fixture
 *     await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
 *   });
 *
 *   test.describe("Spanish suite", () => {
 *     test.use({ withLocale: "es" });
 *     test(...);
 *   });
 */

export const LOCALE_STORAGE_KEY = "orderly-language";

export type SupportedLocale = "en" | "es";

type LocaleFixtures = {
  withLocale: SupportedLocale;
};

export const test = base.extend<LocaleFixtures>({
  withLocale: "en", // default to English
  page: async ({ page, withLocale }, use) => {
    // Inject the language BEFORE the first navigation so the
    // pre-hydration script in `index.html` reads it and sets
    // `<html lang>` before any React code runs.
    await page.addInitScript(
      ([key, value]) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          // localStorage may be blocked — fall through, the next
          // reload still has a chance.
        }
      },
      [LOCALE_STORAGE_KEY, withLocale] as const,
    );
    await use(page);
  },
});

export { expect };
