import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import { axe } from "jest-axe";
import { LayoutDashboard, Store, Users, Settings } from "lucide-react";
import { store } from "../../app/store";
import { TooltipProvider } from "../ui/tooltip";
import { ZoneDock } from "./ZoneDock";
import type { DockItem } from "./ZoneSidebar";

const MOCK_ITEMS: readonly DockItem[] = [
  { to: "/site/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/site/admin/restaurants", label: "Restaurants", icon: Store, roles: ["SuperAdmin"] },
  { to: "/site/admin/staff", label: "Staff", icon: Users },
  { to: "/site/admin/settings", label: "Settings", icon: Settings },
];

function renderDock(initialEntries = ["/site/admin"], items = MOCK_ITEMS) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <TooltipProvider delayDuration={0}>
          <ZoneDock zone="admin" items={items} />
        </TooltipProvider>
      </MemoryRouter>
    </Provider>,
  );
}

describe("ZoneDock", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders dock items and highlights active route", () => {
    renderDock(["/site/admin"]);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    const staffLink = screen.getByRole("link", { name: "Staff" });

    expect(dashboardLink).toBeInTheDocument();
    expect(staffLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
    expect(staffLink).not.toHaveAttribute("aria-current");
  });

  it("has accessible navigation landmark and toolbar semantics", () => {
    renderDock();

    const nav = screen.getByRole("navigation", { name: /zone dock navigation/i });
    expect(nav).toBeInTheDocument();

    const toolbar = screen.getByRole("toolbar", { name: /dock navigation items/i });
    expect(toolbar).toBeInTheDocument();
  });

  it("supports keyboard navigation with arrow keys", async () => {
    const user = userEvent.setup();
    renderDock();

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);

    links[0].focus();
    expect(links[0]).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(links[1]).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(links[0]).toHaveFocus();
  });

  it("supports accessible keyboard reordering via Alt+ArrowRight", async () => {
    const user = userEvent.setup();
    renderDock();

    const linksBefore = screen.getAllByRole("link");
    expect(linksBefore[0]).toHaveAccessibleName("Dashboard");
    expect(linksBefore[1]).toHaveAccessibleName("Restaurants");

    linksBefore[0].focus();

    // Reorder Dashboard past Restaurants
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");

    const linksAfter = screen.getAllByRole("link");
    expect(linksAfter[0]).toHaveAccessibleName("Restaurants");
    expect(linksAfter[1]).toHaveAccessibleName("Dashboard");

    // Check localStorage persistence
    const saved = JSON.parse(localStorage.getItem("orderly_dock_order_admin") || "[]");
    expect(saved[0]).toBe("/site/admin/restaurants");
    expect(saved[1]).toBe("/site/admin");

    // Check screen reader announcement
    expect(screen.getByRole("status")).toHaveTextContent(/moved dashboard to position 2 of/i);
  });

  it("supports drag and drop reordering", () => {
    renderDock();

    const listItems = screen.getAllByRole("none");
    const dragItem = listItems[0];
    const dropTarget = listItems[2];

    const dataTransfer = {
      data: {} as Record<string, string>,
      setData(type: string, val: string) {
        this.data[type] = val;
      },
      getData(type: string) {
        return this.data[type];
      },
      effectAllowed: "",
      dropEffect: "",
    };

    fireEvent.dragStart(dragItem, { dataTransfer });
    fireEvent.dragOver(dropTarget, { dataTransfer });
    fireEvent.drop(dropTarget, { dataTransfer });
    fireEvent.dragEnd(dragItem);

    // Verify localStorage updated
    const saved = JSON.parse(localStorage.getItem("orderly_dock_order_admin") || "[]");
    expect(saved.length).toBeGreaterThan(0);
    expect(saved[2]).toBe("/site/admin");
  });

  it("passes axe accessibility checks", async () => {
    const { container } = renderDock();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
