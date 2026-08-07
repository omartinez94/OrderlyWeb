/**
 * Currency & number formatting for OrderlyWeb.
 *
 * Every monetary value rendered in the UI must go through `formatCurrency`
 * (or `formatNumber` for non-monetary quantities). Never concatenate a
 * currency symbol to a `toFixed(2)` string — `Intl.NumberFormat` handles
 * decimal separators, thousands grouping, and currency symbol placement
 * per locale.
 *
 * The currency code (ISO 4217, e.g. `"USD"`, `"MXN"`) always comes from
 * the restaurant's Catalog API record — never hardcoded — and is passed
 * by the caller. The locale (`"en"` | `"es"` | BCP 47 tag) comes from
 * `useTranslation()` or the restaurant's localeTag in Redux.
 *
 * Performance note: `Intl.NumberFormat` is expensive to construct on
 * every render. Callers that render inside a frequently re-rendering
 * subtree (the KDS timer chips, for example) should memoise the
 * formatter via `useMemo(() => getCurrencyFormatter(locale, currency), ...)`.
 */

/**
 * Format a monetary value as a localised currency string.
 *
 * @param amount   Raw number, e.g. `12.5`.
 * @param currency ISO 4217 currency code, e.g. `"USD"`, `"MXN"`.
 * @param locale   BCP 47 tag, e.g. `"en"`, `"es"`, `"es-MX"`.
 *
 * @example
 *   formatCurrency(12.5, "USD", "en"); // "$12.50"
 *   formatCurrency(12.5, "USD", "es"); // "12,50 US$"
 *   formatCurrency(12.5, "MXN", "es"); // "MX$12.50"
 */
export function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a plain number with locale-aware grouping and decimal marks.
 *
 * Used for quantities, percentages, tip rates, and any other numeric
 * display that is not currency.
 *
 * @example
 *   formatNumber(1234.5, "en");                        // "1,234.5"
 *   formatNumber(1234.5, "es");                        // "1.234,5"
 *   formatNumber(0.18, "en", { style: "percent" });    // "18%"
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Returns a memoised `Intl.NumberFormat` for the given locale/currency
 * pair. Useful inside hot render loops (KDS, order list) where the same
 * formatter is recreated on every render otherwise.
 */
const formatterCache = new Map<string, Intl.NumberFormat>();

function formatterKey(locale: string, currency: string): string {
  return `${locale}::${currency}`;
}

export function getCurrencyFormatter(locale: string, currency: string): Intl.NumberFormat {
  const key = formatterKey(locale, currency);
  const cached = formatterCache.get(key);
  if (cached) return cached;
  const next = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  formatterCache.set(key, next);
  return next;
}

/** Test-only helper — clears the formatter cache. */
export function _resetCurrencyFormatterCache(): void {
  formatterCache.clear();
}
