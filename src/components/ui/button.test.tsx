import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./button";

describe("Button", () => {
  it("renders its text content", () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("renders as a button by default", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button").tagName).toBe("BUTTON");
  });

  it('defaults `type` to "button" so it never submits an ancestor form', () => {
    render(
      <form>
        <Button>Submit</Button>
      </form>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("forwards click events", async () => {
    let clicked = 0;
    render(<Button onClick={() => clicked++}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(clicked).toBe(1);
  });

  it("renders as disabled when the disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders each variant without accessibility violations", async () => {
    const variants = [
      ["default", "Primary"],
      ["accent", "Accent"],
      ["outline", "Outline"],
      ["ghost", "Ghost"],
      ["secondary", "Secondary"],
      ["destructive", "Destructive"],
      ["link", "Link"],
    ] as const;

    for (const [variant, label] of variants) {
      const { container, unmount } = render(<Button variant={variant}>{label}</Button>);
      const results = await axe(container);
      expect(results, `variant "${variant}" should have no a11y violations`).toHaveNoViolations();
      unmount();
    }
  });

  it("renders each size without accessibility violations", async () => {
    const sizes = ["sm", "default", "lg", "icon"] as const;

    for (const size of sizes) {
      const { container, unmount } = render(
        <Button size={size} aria-label={size === "icon" ? "Icon" : undefined}>
          {size === "icon" ? "★" : size}
        </Button>,
      );
      const results = await axe(container);
      expect(results, `size "${size}" should have no a11y violations`).toHaveNoViolations();
      unmount();
    }
  });

  it('honors data-state="busy" and data-state="success" styling', async () => {
    const { rerender } = render(<Button>Save</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("data-state");

    rerender(<Button data-state="busy">Saving…</Button>);
    const busy = screen.getByRole("button");
    expect(busy).toHaveAttribute("data-state", "busy");

    rerender(<Button data-state="success">Saved</Button>);
    const success = screen.getByRole("button");
    expect(success).toHaveAttribute("data-state", "success");
  });
});
