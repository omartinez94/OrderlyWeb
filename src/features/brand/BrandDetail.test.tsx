import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { renderWithI18n } from "../../test/i18n-wrapper";
import { axe } from "jest-axe";
import { BrandDetail } from "./BrandDetail";
import type { CatalogBrand } from "../../types/catalog";

const mockBrand: CatalogBrand = {
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
};

describe("BrandDetail", () => {
  it("renders metrics, overview info, and passes accessibility checks", async () => {
    const handleArchive = vi.fn();

    const { container } = renderWithI18n(
      <MemoryRouter>
        <BrandDetail
          brand={mockBrand}
          restaurantsCount={3}
          staffCount={18}
          onArchive={handleArchive}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("Italian")).toBeInTheDocument();
    expect(screen.getByText("contact@acme.com")).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens archive confirmation dialog and confirms archive action", async () => {
    const user = userEvent.setup();
    const handleArchive = vi.fn().mockResolvedValue(undefined);

    renderWithI18n(
      <MemoryRouter>
        <BrandDetail
          brand={mockBrand}
          restaurantsCount={0}
          staffCount={0}
          onArchive={handleArchive}
        />
      </MemoryRouter>,
    );

    const archiveBtn = screen.getByRole("button", { name: /Archive brand/i });
    await user.click(archiveBtn);

    expect(screen.getByText(/Archive this brand\?/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /^Archive$/i });
    await user.click(confirmBtn);

    expect(handleArchive).toHaveBeenCalled();
  });
});
