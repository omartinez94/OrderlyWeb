import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";

/**
 * Select tests open the menu via keyboard (Enter) rather than pointer
 * click. Radix Select dispatches the open state through pointer-up + a
 * focus dance that jsdom does not always reproduce deterministically;
 * the keyboard path is the contract test (Space/Enter opens, Escape
 * closes, focus returns).
 */
describe("Select", () => {
  it("opens on Enter and lists the options", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Label htmlFor="station">Station</Label>
        <Select>
          <SelectTrigger id="station" className="w-full">
            <SelectValue placeholder="Choose a station" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grill">Grill</SelectItem>
            <SelectItem value="saute">Sauté</SelectItem>
            <SelectItem value="pastry">Pastry</SelectItem>
          </SelectContent>
        </Select>
      </>,
    );
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("option", { name: "Grill" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Sauté" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pastry" })).toBeInTheDocument();
  });

  it("selects an option and updates the displayed value", async () => {
    const user = userEvent.setup();
    render(
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="grill">Grill</SelectItem>
          <SelectItem value="saute">Sauté</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("option", { name: "Sauté" }));
    expect(screen.getByText("Sauté")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("option", { name: "A" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("option", { name: "A" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("passes axe in the closed state", async () => {
    const { container } = render(
      <>
        <Label htmlFor="ax-station">Station</Label>
        <Select>
          <SelectTrigger id="ax-station" className="w-full">
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
            <SelectItem value="b">B</SelectItem>
          </SelectContent>
        </Select>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
