import { describe, expect, it } from "vitest";
import { enUS, es } from "date-fns/locale";
import { formatDate, formatRelativeTime, getDateFnsLocale } from "./date";

describe("date utils", () => {
  it("formats relative time correctly", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toMatch(/5 minutes ago|about 5 minutes ago/);
  });

  it("formats exact date correctly", () => {
    const isoDate = "2026-08-06T12:00:00.000Z";
    expect(formatDate(isoDate, "yyyy-MM-dd")).toBe("2026-08-06");
  });

  it("getDateFnsLocale returns enUS for 'en'", () => {
    expect(getDateFnsLocale("en")).toBe(enUS);
  });

  it("getDateFnsLocale returns es for 'es'", () => {
    expect(getDateFnsLocale("es")).toBe(es);
  });

  it("getDateFnsLocale falls back to enUS for unknown languages", () => {
    expect(getDateFnsLocale("zz")).toBe(enUS);
  });

  it("formats relative time in Spanish when locale is provided", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const out = formatRelativeTime(fiveMinutesAgo, true, es);
    // Spanish locale emits "hace 5 minutos" or "unos 5 minutos" depending on date-fns version.
    expect(out.toLowerCase()).toMatch(/minutos|hace/);
  });

  it("formats a fixed date in Spanish locale", () => {
    const isoDate = "2026-08-06T12:00:00.000Z";
    const en = formatDate(isoDate, "MMM d, yyyy", enUS);
    const esOut = formatDate(isoDate, "MMM d, yyyy", es);
    expect(en).not.toBe(esOut);
  });
});
