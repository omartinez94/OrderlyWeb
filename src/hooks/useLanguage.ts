/**
 * useLanguage — thin wrapper around `react-i18next` for OrderlyWeb.
 *
 * The hook returns:
 *   - `language`        — current language ("en" | "es")
 *   - `setLanguage`     — switch language; persists to localStorage via
 *                          the i18next detector configured in `src/lib/i18n.ts`,
 *                          and mirrors the new value onto `<html lang>` so
 *                          screen readers and the browser's language-aware
 *                          features stay in sync without a reload.
 *   - `supportedLanguages` — readonly tuple of supported languages.
 *
 * Components that need `t()` for translations should keep using
 * `useTranslation()` from `react-i18next` directly. This hook is for
 * components that only need to read or change the active language
 * (notably `<LanguageToggle />`).
 */

import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, isSupportedLanguage, type SupportedLanguage } from "../lib/i18n";

export interface UseLanguageResult {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  supportedLanguages: readonly SupportedLanguage[];
}

export function useLanguage(): UseLanguageResult {
  const { i18n } = useTranslation();

  const language: SupportedLanguage = useMemo(() => {
    const current = i18n.language ?? "en";
    return isSupportedLanguage(current) ? current : "en";
  }, [i18n.language]);

  // Mirror the active language onto `<html lang>`. The pre-hydration
  // script in `index.html` only sets it on initial load; this keeps it
  // in sync after `i18n.changeLanguage()` is invoked at runtime so
  // screen readers and CSS `:lang(...)` selectors reflect the new
  // language without requiring a reload.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", language);
    }
  }, [language]);

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      void i18n.changeLanguage(lang);
    },
    [i18n],
  );

  return {
    language,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
