import "./LanguageToggle.css";
import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useLanguage } from "../../hooks/useLanguage";
import type { SupportedLanguage } from "../../lib/i18n";

/**
 * LanguageToggle — segmented `EN | ES` control rendered into the top
 * bar of every zone layout. Backed by `useLanguage()` which proxies to
 * i18next's `changeLanguage()`; the detector in `src/lib/i18n.ts`
 * persists the choice to `localStorage["orderly-language"]` and
 * updates `<html lang>` automatically.
 *
 * Accessibility:
 *   - The toggle group carries an `aria-label` sourced from the active
 *     locale (`common:languageToggle.label`).
 *   - Keyboard navigation is handled by Radix's `ToggleGroup`:
 *     arrow keys rove focus, Space/Enter toggles.
 *   - A polite live region announces the new language to screen readers
 *     after a change (see §11 of the i18n plan).
 */
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  // Bound to the `common` namespace so translation keys are unqualified.
  const { t } = useTranslation("common");

  const handleChange = (next: string | string[] | undefined): void => {
    if (typeof next !== "string") return;
    if (next === "en" || next === "es") {
      setLanguage(next as SupportedLanguage);
    }
  };

  const announce = t("languageToggle.changedTo", {
    lang: language === "es" ? "Español" : "English",
  });

  return (
    <>
      <ToggleGroup
        type="single"
        value={language}
        onValueChange={handleChange}
        variant="outline"
        size="sm"
        spacing={0}
        aria-label={t("languageToggle.label")}
        className="language-toggle"
      >
        <ToggleGroupItem value="en" aria-label={t("languageToggle.en")}>
          EN
        </ToggleGroupItem>
        <ToggleGroupItem value="es" aria-label={t("languageToggle.es")}>
          ES
        </ToggleGroupItem>
      </ToggleGroup>
      {/*
        Polite live region: announces the language switch to assistive
        tech without stealing focus. Always rendered (off-screen via
        CSS) so the same DOM node exists across renders and the
        screen reader picks up the change reliably.
      */}
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>
    </>
  );
}
