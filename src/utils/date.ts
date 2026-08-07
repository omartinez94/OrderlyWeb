import { formatDistanceToNow, format, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";
import type { Locale } from "date-fns";

/**
 * Parses a date input (ISO string, Date object, or timestamp number) into a Date instance.
 */
function toDate(date: string | Date | number): Date {
  if (typeof date === "string") {
    return parseISO(date);
  }
  return new Date(date);
}

/**
 * Locale map for date-fns. Add new languages to both the
 * `SUPPORTED_LANGUAGES` tuple in `src/lib/i18n.ts` and this map.
 *
 * We import locale modules statically so Vite can tree-shake the
 * unused ones. If the locale is not present the helper below falls
 * back to `enUS` so the caller always receives a valid `Locale`.
 */
const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  es,
};

/**
 * Resolves a `date-fns` `Locale` for the active UI language. Falls
 * back to `enUS` when the language is unknown so the formatter never
 * throws — the user just sees English-style output.
 */
export function getDateFnsLocale(lang: string): Locale {
  return DATE_FNS_LOCALES[lang] ?? enUS;
}

/**
 * Returns a human-readable relative time string (e.g. "5 minutes ago", "less than a minute ago").
 *
 * @param date   ISO timestamp string, Date object, or epoch millisecond number.
 * @param addSuffix  Whether to append "ago" or "in" (default: true).
 * @param locale     `date-fns` `Locale` (default: `enUS`). Pass `getDateFnsLocale(i18n.language)`
 *                    to localise the output.
 */
export function formatRelativeTime(
  date: string | Date | number,
  addSuffix = true,
  locale: Locale = enUS,
): string {
  try {
    const d = toDate(date);
    return formatDistanceToNow(d, { addSuffix, locale });
  } catch {
    return String(date);
  }
}

/**
 * Formats a date into a custom string pattern (e.g. "MMM d, yyyy h:mm a").
 *
 * @param date      ISO timestamp string, Date object, or epoch millisecond number.
 * @param formatStr Pattern string supported by date-fns (default: "MMM d, yyyy h:mm a").
 * @param locale    `date-fns` `Locale` (default: `enUS`). Pass `getDateFnsLocale(i18n.language)`
 *                   to localise the output.
 */
export function formatDate(
  date: string | Date | number,
  formatStr = "MMM d, yyyy h:mm a",
  locale: Locale = enUS,
): string {
  try {
    const d = toDate(date);
    return format(d, formatStr, { locale });
  } catch {
    return String(date);
  }
}
