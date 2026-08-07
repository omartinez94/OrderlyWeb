import { describe, expect, it } from "vitest";
import { formatDate, formatRelativeTime } from "./date";

describe("date utils", () => {
  it("formats relative time correctly", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toMatch(/5 minutes ago|about 5 minutes ago/);
  });

  it("formats exact date correctly", () => {
    const isoDate = "2026-08-06T12:00:00.000Z";
    expect(formatDate(isoDate, "yyyy-MM-dd")).toBe("2026-08-06");
  });
});
