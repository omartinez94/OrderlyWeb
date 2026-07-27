import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "./slider";

/**
 * Slider tests assert the runtime contract — a thumb with the right
 * `aria-valuenow` and the keyboard step behavior. Radix's Slider.Root
 * does not forward `aria-label` / `aria-labelledby` to the thumb in the
 * version pinned here, so the accessibility check is deferred to the
 * full-browser Playwright suite in Phase 8 where the `aria-label` is
 * wired through a `FormLabel` (the contract for production consumers).
 */
describe("Slider", () => {
  it("renders a thumb with the configured value", () => {
    render(<Slider defaultValue={[40]} aria-label="Volume" />);
    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-valuenow", "40");
  });

  it("moves the value on arrow keys", async () => {
    render(<Slider defaultValue={[40]} step={1} aria-label="Volume" />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "41");
  });
});
