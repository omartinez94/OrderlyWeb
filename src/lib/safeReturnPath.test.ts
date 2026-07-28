import { describe, expect, it } from "vitest";
import { safeReturnPath } from "./safeReturnPath";

const FALLBACK = "/home";

describe("safeReturnPath", () => {
  describe("accepts same-origin absolute paths", () => {
    it.each([
      "/",
      "/home",
      "/site/admin",
      "/site/admin/staff/123?tab=roles",
      "/site/restaurant/orders#open",
      "/path/with/colon:literal",
    ])("accepts %s", (input) => {
      expect(safeReturnPath(input, FALLBACK)).toBe(input);
    });
  });

  describe("rejects dangerous inputs", () => {
    it.each([
      ["undefined", undefined],
      ["null", null],
      ["empty string", ""],
      ["protocol-relative", "//evil.com/path"],
      ["backslash protocol-relative", "/\\evil.com"],
      ["http", "http://evil.com"],
      ["https", "https://evil.com/x"],
      ["javascript", "javascript:alert(1)"],
      ["data", "data:text/html,<script>"],
      ["relative", "home"],
      ["relative with dot", "./home"],
      ["relative with slash", "home/x"],
      ["ftp", "ftp://files"],
    ])("rejects %s", (_label, input) => {
      expect(safeReturnPath(input, FALLBACK)).toBe(FALLBACK);
    });
  });
});
