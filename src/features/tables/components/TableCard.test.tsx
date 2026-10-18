import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { TableCard } from "./TableCard";
import type { Table } from "../../../types/catalog";

const availableTable: Table = {
  id: "t-1",
  restaurantId: "r-001",
  tableNumber: "T1",
  capacity: 2,
  status: "Available",
  section: "Window",
};

const occupiedTable: Table = {
  id: "t-2",
  restaurantId: "r-001",
  tableNumber: "T2",
  capacity: 4,
  status: "Occupied",
  currentOrderId: "ORD-2026-0001",
  section: "Main Floor",
};

const cleaningTable: Table = {
  id: "t-4",
  restaurantId: "r-001",
  tableNumber: "T4",
  capacity: 4,
  status: "Needs Cleaning",
  section: "Patio",
};

describe("TableCard", () => {
  it("renders table details and Take Order button for Available table", () => {
    renderWithI18n(
      <MemoryRouter>
        <TableCard table={availableTable} />
      </MemoryRouter>,
      "en",
    );

    expect(screen.getByText("T1")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Window")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Take Order/i })).toHaveAttribute(
      "href",
      "/site/restaurant/orders/new?tableId=t-1",
    );
  });

  it("renders active order and View Order link for Occupied table", () => {
    renderWithI18n(
      <MemoryRouter>
        <TableCard table={occupiedTable} />
      </MemoryRouter>,
      "en",
    );

    expect(screen.getByText("T2")).toBeInTheDocument();
    expect(screen.getByText("Occupied")).toBeInTheDocument();
    expect(screen.getByText("#ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View Order/i })).toHaveAttribute(
      "href",
      "/site/restaurant/orders/ORD-2026-0001",
    );
  });

  it("triggers onMarkCleaned when Mark Cleaned button is clicked", async () => {
    const user = userEvent.setup();
    const handleClean = vi.fn();

    renderWithI18n(
      <MemoryRouter>
        <TableCard table={cleaningTable} onMarkCleaned={handleClean} />
      </MemoryRouter>,
      "en",
    );

    const cleanBtn = screen.getByRole("button", { name: /Mark Cleaned/i });
    await user.click(cleanBtn);
    expect(handleClean).toHaveBeenCalledWith("t-4");
  });
});
