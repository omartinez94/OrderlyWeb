import { formatDistanceToNow, format, parseISO } from "date-fns";

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
 * Returns a human-readable relative time string (e.g. "5 minutes ago", "less than a minute ago").
 *
 * @param date ISO timestamp string, Date object, or epoch millisecond number
 * @param addSuffix Whether to append "ago" or "in" (default: true)
 */
export function formatRelativeTime(
  date: string | Date | number,
  addSuffix = true
): string {
  try {
    const d = toDate(date);
    return formatDistanceToNow(d, { addSuffix });
  } catch {
    return String(date);
  }
}

/**
 * Formats a date into a custom string pattern (e.g. "MMM d, yyyy h:mm a").
 *
 * @param date ISO timestamp string, Date object, or epoch millisecond number
 * @param formatStr Pattern string supported by date-fns (default: "MMM d, yyyy h:mm a")
 */
export function formatDate(
  date: string | Date | number,
  formatStr = "MMM d, yyyy h:mm a"
): string {
  try {
    const d = toDate(date);
    return format(d, formatStr);
  } catch {
    return String(date);
  }
}
