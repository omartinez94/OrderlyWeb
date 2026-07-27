import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

describe("Checkbox", () => {
  it("renders with a label association", () => {
    render(
      <>
        <Label htmlFor="tos">Accept terms</Label>
        <Checkbox id="tos" />
      </>,
    );
    expect(screen.getByLabelText("Accept terms")).toBeInTheDocument();
  });

  it("toggles checked state on click", async () => {
    render(
      <>
        <Label htmlFor="news">Subscribe</Label>
        <Checkbox id="news" />
      </>,
    );
    const cb = screen.getByLabelText("Subscribe");
    expect(cb).not.toBeChecked();
    await userEvent.click(cb);
    expect(cb).toBeChecked();
    await userEvent.click(cb);
    expect(cb).not.toBeChecked();
  });

  it("toggles on Space key", async () => {
    render(
      <>
        <Label htmlFor="kbd">Kbd</Label>
        <Checkbox id="kbd" />
      </>,
    );
    const cb = screen.getByLabelText("Kbd");
    cb.focus();
    expect(cb).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(cb).toBeChecked();
  });

  it("passes axe in unchecked and checked states", async () => {
    const { container, rerender } = render(
      <>
        <Label htmlFor="a1">A1</Label>
        <Checkbox id="a1" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
    rerender(
      <>
        <Label htmlFor="a1">A1</Label>
        <Checkbox id="a1" defaultChecked />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
