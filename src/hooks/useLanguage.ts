/**
 * useLanguage — thin wrapper around `react-i18next` for OrderlyWeb.
 *
 * The hook returns:
 *   - `language`        — current language ("en" | "es")
 *   - `setLanguage`     — switch language; persists to localStorage via
 *                          the i18next detector configured in `src/lib/i18n.ts`.
 *   - `supportedLanguages` — readonly tuple of supported languages.
 *
 * Components that need `t()` for translations should keep using
 * `useTranslation()` from `react-i18next` directly. This hook is for
 * components that only need to read or change the active language
 * (notably `<LanguageToggle />`).
 */

import { useCallback, useMemo } from "react";
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
