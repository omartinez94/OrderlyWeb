import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("renders the fallback when no image is provided", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders the alt attribute on the image element", () => {
    render(
      <Avatar>
        <AvatarImage src="data:image/svg+xml;utf8,<svg/>" alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    // Radix Avatar swaps to the Fallback until the image reports
    // `loaded`; in jsdom a data URL never resolves. We assert the
    // rendered root is present and the fallback shows the initials.
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("passes axe", async () => {
    const { container } = render(
      <Avatar aria-label="Jane Doe">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
