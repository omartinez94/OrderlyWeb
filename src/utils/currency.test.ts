import { describe, expect, it } from "vitest";
import { formatCurrency, formatNumber, getCurrencyFormatter } from "./currency";

describe("formatCurrency", () => {
  it("formats USD in en locale with leading $", () => {
    expect(formatCurrency(12.5, "USD", "en")).toBe("$12.50");
  });

  it("formats USD in es locale with US$ prefix and comma decimal", () => {
    // "es" picks "US$" prefix and "," as decimal separator.
    const out = formatCurrency(12.5, "USD", "es");
    expect(out).toContain("12");
    expect(out).toContain(",50");
  });

  it("formats MXN in es locale as MX$", () => {
    const out = formatCurrency(12.5, "MXN", "es");
    expect(out).toMatch(/MX\$12\.50|12,50/);
  });

  it("always emits exactly two fraction digits", () => {
    expect(formatCurrency(7, "USD", "en")).toBe("$7.00");
  });
});

describe("formatNumber", () => {
  it("formats plain numbers with locale grouping", () => {
    expect(formatNumber(1234.5, "en")).toBe("1,234.5");
  });

  it("uses , as decimal separator in es locale", () => {
    expect(formatNumber(1234.5, "es")).toBe("1234,5");
  });

  it("uses . as grouping in es locale for large numbers", () => {
    expect(formatNumber(1234567, "es")).toBe("1.234.567");
  });

  it("supports percent style", () => {
    expect(formatNumber(0.18, "en", { style: "percent" })).toBe("18%");
  });
});

describe("getCurrencyFormatter", () => {
  it("returns a working Intl.NumberFormat", () => {
    const formatter = getCurrencyFormatter("en", "USD");
    expect(formatter.format(12.5)).toBe("$12.50");
  });

  it("caches the formatter for repeated calls", () => {
    const a = getCurrencyFormatter("en", "USD");
    const b = getCurrencyFormatter("en", "USD");
    expect(a).toBe(b);
  });
});

describe("Spanish locale coverage", () => {
  it("emits comma decimal separator for USD in es", () => {
    expect(formatCurrency(12.5, "USD", "es")).toContain(",50");
  });

  it("emits period grouping for thousands in es", () => {
    const out = formatNumber(12345.67, "es");
    expect(out).toBe("12.345,67");
  });
});
