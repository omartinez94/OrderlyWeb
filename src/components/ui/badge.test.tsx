import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders text and the variant attribute", () => {
    render(<Badge variant="default">Active</Badge>);
    const badge = screen.getByText("Active");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("renders every service-hue variant", () => {
    const variants = [
      "service-new",
      "service-acknowledged",
      "service-preparing",
      "service-plating",
      "service-ready",
    ] as const;
    for (const variant of variants) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toHaveAttribute("data-variant", variant);
      unmount();
    }
  });

  it("passes axe for each variant", async () => {
    const variants = [
      "default",
      "secondary",
      "destructive",
      "outline",
      "ghost",
      "link",
      "neutral",
      "service-new",
      "service-acknowledged",
      "service-preparing",
      "service-plating",
      "service-ready",
    ] as const;
    for (const variant of variants) {
      const { container, unmount } = render(<Badge variant={variant}>{variant}</Badge>);
      const results = await axe(container);
      expect(results, `variant "${variant}"`).toHaveNoViolations();
      unmount();
    }
  });
});
