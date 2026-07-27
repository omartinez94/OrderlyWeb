import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with the skeleton data-slot", () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId("sk")).toHaveAttribute("data-slot", "skeleton");
  });

  it("passes axe (decorative placeholder)", async () => {
    const { container } = render(<Skeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
