import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { renderWithI18n } from "../../test/i18n-wrapper";
import { axe } from "jest-axe";
import { BrandForm } from "./BrandForm";
import type { CatalogBrand } from "../../types/catalog";

const mockBrand: CatalogBrand = {
  id: "b-001",
  name: "Acme Hospitality Group",
  slug: "acme-hospitality",
  description: "Bistros and casual dining",
  logoUrl: "https://example.com/logo.png",
  contactEmail: "contact@acme.com",
  contactPhone: "+1 (555) 019-2834",
  cuisineType: "Italian",
  websiteUrl: "https://acme.example.com",
  active: true,
  createdAt: "2026-01-15T08:00:00Z",
  updatedAt: "2026-06-20T12:00:00Z",
};

describe("BrandForm", () => {
  it("renders form fields and validates required fields on submit", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    const { container } = renderWithI18n(
      <MemoryRouter>
        <BrandForm onSubmit={handleSubmit} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact email/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Create brand/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Enter a brand name\./i)).toBeInTheDocument();
    expect(screen.getByText(/Enter a slug\./i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("populates initial data in edit mode and submits valid changes", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithI18n(
      <MemoryRouter>
        <BrandForm initialData={mockBrand} onSubmit={handleSubmit} />
      </MemoryRouter>,
    );

    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toHaveValue("Acme Hospitality Group");

    await user.clear(nameInput);
    await user.type(nameInput, "Acme Restaurant Group");

    const submitBtn = screen.getByRole("button", { name: /Edit brand/i });
    await user.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Acme Restaurant Group",
        slug: "acme-hospitality",
      }),
    );
  });
});
