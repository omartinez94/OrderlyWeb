import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AspectRatio } from "./aspect-ratio";

describe("AspectRatio", () => {
  it("renders its children inside the ratio frame", () => {
    render(
      <AspectRatio ratio={16 / 9} data-testid="ar">
        <img alt="cover" src="data:image/svg+xml;utf8,<svg/>" />
      </AspectRatio>,
    );
    expect(screen.getByAltText("cover")).toBeInTheDocument();
  });
});
