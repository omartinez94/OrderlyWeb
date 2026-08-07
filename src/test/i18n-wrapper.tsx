import type { ReactElement } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";
import type { SupportedLanguage } from "../lib/i18n";

/**
 * `renderWithI18n` — a thin wrapper around `render` that mounts the
 * React tree inside an `<I18nextProvider>` bound to the singleton
 * `i18n` instance from `src/lib/i18n.ts`, and switches the active
 * language to the requested value before rendering.
 *
 * Used by unit tests that exercise user-visible text under both
 * English and Spanish locales (per the i18n-localization plan §9).
 *
 * @example
 *   renderWithI18n(<MyComponent />, "es");
 *   expect(screen.getByText("Guardar")).toBeInTheDocument();
 */
export function renderWithI18n(
  ui: ReactElement,
  lang: SupportedLanguage = "en",
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult {
  // Synchronously switch the active language so the rendered tree
  // observes the correct namespace values during the same render
  // pass. We don't await — `i18n.changeLanguage` resolves on the
  // next microtask; tests that need to assert on the next paint
  // should `await i18n.changeLanguage(lang)` themselves.
  void i18n.changeLanguage(lang);
  return render(ui, {
    wrapper: ({ children }) => (
      <I18nextProvider i18n={i18n} defaultNS="common">
        {children}
      </I18nextProvider>
    ),
    ...options,
  });
}

/**
 * Switches the active language synchronously. Convenience for
 * tests that need to drive a single component through both locales
 * without re-mounting it.
 */
export async function setI18nLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
}
