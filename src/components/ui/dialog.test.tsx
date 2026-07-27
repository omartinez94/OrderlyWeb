import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "./button";

function BasicDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit order</DialogTitle>
          <DialogDescription>Make your changes.</DialogDescription>
        </DialogHeader>
        <p>Body</p>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(<BasicDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit order")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<BasicDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("returns focus to the trigger on close", async () => {
    const user = userEvent.setup();
    render(<BasicDialog />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("passes axe in open state", async () => {
    const user = userEvent.setup();
    const { container } = render(<BasicDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
