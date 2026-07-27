import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";

describe("ContextMenu", () => {
  it("opens on right click and shows items", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right-click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Cut</ContextMenuItem>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const trigger = screen.getByText("Right-click me");
    await user.pointer({ keys: "[MouseRight>]", target: trigger });
    expect(await screen.findByText("Cut")).toBeInTheDocument();
  });

  it("passes axe in closed state", async () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Action</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
