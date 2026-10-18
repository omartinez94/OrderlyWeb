import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { renderWithI18n } from "../../test/i18n-wrapper";
import { axe } from "jest-axe";
import { BrandList } from "./BrandList";
import type { CatalogBrand } from "../../types/catalog";

const mockBrands: CatalogBrand[] = [
  {
    id: "b-001",
    name: "Acme Hospitality Group",
    slug: "acme-hospitality",
    description: "Bistros and casual dining",
    logoUrl: null,
    contactEmail: "contact@acme.com",
    contactPhone: "+1 (555) 019-2834",
    cuisineType: "Italian",
    websiteUrl: "https://acme.example.com",
    active: true,
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-06-20T12:00:00Z",
  },
  {
    id: "b-002",
    name: "Cantina Del Sol",
    slug: "cantina-del-sol",
    description: "Mexican culinary collective",
    logoUrl: null,
    contactEmail: "hola@cantinadelsol.com",
    contactPhone: "+1 (555) 782-9911",
    cuisineType: "Mexican",
    websiteUrl: null,
    active: false,
    createdAt: "2026-02-01T10:30:00Z",
    updatedAt: "2026-07-10T14:15:00Z",
  },
];

describe("BrandList", () => {
  it("renders brands table and passes accessibility checks", async () => {
    const handleQueryChange = vi.fn();
    const handleActiveChange = vi.fn();

    const { container } = renderWithI18n(
      <MemoryRouter>
        <BrandList
          brands={mockBrands}
          query=""
          onQueryChange={handleQueryChange}
          activeFilter={undefined}
          onActiveFilterChange={handleActiveChange}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Acme Hospitality Group")).toBeInTheDocument();
    expect(screen.getByText("Cantina Del Sol")).toBeInTheDocument();
    expect(screen.getByText("acme-hospitality")).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("handles search input and active status filter clicks", async () => {
    const user = userEvent.setup();
    const handleQueryChange = vi.fn();
    const handleActiveChange = vi.fn();

    renderWithI18n(
      <MemoryRouter>
        <BrandList
          brands={mockBrands}
          query=""
          onQueryChange={handleQueryChange}
          activeFilter={undefined}
          onActiveFilterChange={handleActiveChange}
        />
      </MemoryRouter>,
    );

    const searchInput = screen.getByLabelText(/Search brands/i);
    await user.type(searchInput, "Acme");
    expect(handleQueryChange).toHaveBeenCalled();

    const activeFilterBtn = screen.getByRole("tab", { name: /^Active$/i });
    await user.click(activeFilterBtn);
    expect(handleActiveChange).toHaveBeenCalledWith(true);
  });
});
