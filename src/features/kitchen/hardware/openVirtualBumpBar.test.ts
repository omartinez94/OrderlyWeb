import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { openVirtualBumpBar } from "./openVirtualBumpBar";

describe("openVirtualBumpBar", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it("opens a dedicated non-resizable popup at 840x220", () => {
    openVirtualBumpBar();

    expect(openSpy).toHaveBeenCalledWith(
      "/site/kitchen/virtual-bumpbar",
      "OrderlyVirtualBumpBar",
      expect.stringContaining("width=840,height=220"),
    );
    expect(openSpy).toHaveBeenCalledWith(
      "/site/kitchen/virtual-bumpbar",
      "OrderlyVirtualBumpBar",
      expect.stringContaining("resizable=no"),
    );
  });
});
