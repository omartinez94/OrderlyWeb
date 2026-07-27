import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";

describe("NavigationMenu", () => {
  it("renders triggers and a static link", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#">Today</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Reports</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByRole("button", { name: /Overview/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reports" })).toBeInTheDocument();
  });

  it("opens the content on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#">Today</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    await user.click(screen.getByRole("button", { name: /Overview/ }));
    expect(await screen.findByRole("link", { name: "Today" })).toBeVisible();
  });

  it("passes axe in closed state", async () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Reports</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
