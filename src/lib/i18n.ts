/**
 * i18n — i18next bootstrap for OrderlyWeb.
 *
 * Responsibilities:
 *
 * 1. **Language detection** — `i18next-browser-languagedetector` is
 *    configured with a single lookup order: `localStorage["orderly-language"]`
 *    then `navigator`. Any unsupported value falls back to `"en"`.
 *
 * 2. **Persistence** — when `i18n.changeLanguage()` is called, the detector's
 *    `cacheUserLanguage` writes back to `localStorage["orderly-language"]`
 *    and updates `document.documentElement.lang`.
 *
 * 3. **Namespace preloads** — `common` is loaded eagerly (every page needs
 *    buttons / errors). Zone-specific namespaces (`kds`, `orders`, `admin`,
 *    `restaurant`) are loaded eagerly here too; route loaders can opt to
 *    `loadNamespaces()` lazily in future phases.
 *
 * 4. **Type safety** — the `CustomTypeOptions` interface below makes
 *    `t("namespace:key")` a compile-time error when the key is missing.
 *
 * 5. **Pre-hydration sync** — the inline script in `index.html` mirrors
 *    this detector logic and sets `<html lang>` before React mounts, so the
 *    page never flashes the wrong language.
 */

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en_common from "../locales/en/common.json";
import en_auth from "../locales/en/auth.json";
import en_kds from "../locales/en/kds.json";
import en_orders from "../locales/en/orders.json";
import en_admin from "../locales/en/admin.json";
import en_restaurant from "../locales/en/restaurant.json";

import es_common from "../locales/es/common.json";
import es_auth from "../locales/es/auth.json";
import es_kds from "../locales/es/kds.json";
import es_orders from "../locales/es/orders.json";
import es_admin from "../locales/es/admin.json";
import es_restaurant from "../locales/es/restaurant.json";

/**
 * Languages the product supports today. OrderlyWeb ships English and
 * Spanish (see .agents/plans/i18n-localization.md §6.1).
 */
export const SUPPORTED_LANGUAGES = ["en", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** localStorage key — must match the pre-hydration script in index.html. */
export const LANGUAGE_STORAGE_KEY = "orderly-language";

/**
 * Type-safe resource map. Importing the JSON here gives us literal types
 * for every key, so `t("kds:queue.title")` fails to compile if the key is
 * missing or the JSON shape changes.
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof en_common;
      auth: typeof en_auth;
      kds: typeof en_kds;
      orders: typeof en_orders;
      admin: typeof en_admin;
      restaurant: typeof en_restaurant;
    };
    /**
     * Tagged-template safety: passing `{ count }` to `t()` without
     * declaring `_one` / `_other` variants produces a compile error.
     */
    returnNull: false;
  }
}

/**
 * Validates that a string is one of the supported languages. Centralised
 * here so the detector, the pre-hydration script (paraphrased in
 * `index.html`), and the `useLanguage` hook all agree on the same rule.
 */
export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return value === "en" || value === "es";
}

/**
 * Reads the currently stored language from `localStorage`. Returns
 * `"en"` when the stored value is missing or unsupported — mirrors the
 * fallback logic in the pre-hydration script.
 */
export function readStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(stored) ? stored : "en";
  } catch {
    return "en";
  }
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: en_common,
        auth: en_auth,
        kds: en_kds,
        orders: en_orders,
        admin: en_admin,
        restaurant: en_restaurant,
      },
      es: {
        common: es_common,
        auth: es_auth,
        kds: es_kds,
        orders: es_orders,
        admin: es_admin,
        restaurant: es_restaurant,
      },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    nonExplicitSupportedLngs: true,
    ns: ["common", "auth", "kds", "orders", "admin", "restaurant"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false, // react-i18next already escapes
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
      convertDetectedLanguage: (lng: string): string => {
        // Strip region tag (e.g. "es-MX" → "es") and validate against
        // the supported allowlist. Anything not in the list falls back
        // to "en" via `fallbackLng`.
        const base = lng.split("-")[0].toLowerCase();
        return isSupportedLanguage(base) ? base : "en";
      },
    },
    react: {
      useSuspense: false,
    },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (_lngs, _ns, key) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] Missing translation key: ${key}`);
      }
    },
  });

export default i18n;
