import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toaster, toast } from "./sonner";
import { Button } from "./button";

describe("Sonner (Toast)", () => {
  it("renders the toaster portal", () => {
    render(
      <>
        <Toaster />
        <Button onClick={() => toast.success("Saved.")}>Save</Button>
      </>,
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("surfaces a success toast when triggered", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(
      <>
        <Toaster />
        <Button onClick={() => toast.success("Order marked ready.")}>Trigger</Button>
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Trigger" }));
    expect(await screen.findByText("Order marked ready.")).toBeInTheDocument();
  });
});
