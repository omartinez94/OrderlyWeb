import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { MenuAvailabilityGrid } from "./MenuAvailabilityGrid";
import type { MenuCategory, MenuItem } from "../../../types/catalog";

const mockCategories: MenuCategory[] = [
  { id: "c-1", restaurantId: "r-001", name: "Pizza", position: 1 },
];

const mockItems: MenuItem[] = [
  {
    id: "m-1",
    restaurantId: "r-001",
    categoryId: "c-1",
    name: "Margherita",
    priceCents: 1400,
    status: "available",
    description: "Classic pizza",
  },
  {
    id: "m-2",
    restaurantId: "r-001",
    categoryId: "c-1",
    name: "Pepperoni",
    priceCents: 1650,
    status: "sold_out",
    ingredientWarning: "Low pepperoni stock",
  },
];

describe("MenuAvailabilityGrid", () => {
  it("renders item cards with status, price, and category", () => {
    renderWithI18n(
      <MenuAvailabilityGrid
        items={mockItems}
        categories={mockCategories}
        searchQuery=""
        onSearchChange={vi.fn()}
        onToggleAvailability={vi.fn()}
      />,
      "en",
    );

    expect(screen.getByText("Margherita")).toBeInTheDocument();
    expect(screen.getByText("Pepperoni")).toBeInTheDocument();
    expect(screen.getByText("$14.00")).toBeInTheDocument();
    expect(screen.getByText("$16.50")).toBeInTheDocument();
    expect(screen.getAllByText("Available").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("86'd / Sold Out").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Low pepperoni stock")).toBeInTheDocument();
  });

  it("triggers onToggleAvailability when switch is toggled", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    renderWithI18n(
      <MenuAvailabilityGrid
        items={mockItems}
        categories={mockCategories}
        searchQuery=""
        onSearchChange={vi.fn()}
        onToggleAvailability={handleToggle}
      />,
      "en",
    );

    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBe(2);

    await user.click(switches[0]);
    expect(handleToggle).toHaveBeenCalledWith(mockItems[0]);
  });

  it("renders empty state when no items match", () => {
    renderWithI18n(
      <MenuAvailabilityGrid
        items={[]}
        categories={mockCategories}
        searchQuery="NoMatch"
        onSearchChange={vi.fn()}
        onToggleAvailability={vi.fn()}
      />,
      "en",
    );

    expect(screen.getByText("No menu items found")).toBeInTheDocument();
  });
});
