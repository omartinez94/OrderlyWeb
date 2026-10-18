import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { BrandRestaurantsPage } from "./BrandRestaurantsPage";
import { BrandStaffPage } from "./BrandStaffPage";
import { BrandAuditPage } from "./BrandAuditPage";
import { axe } from "jest-axe";

describe("Brand Detail Tabs", () => {
  describe("BrandRestaurantsPage", () => {
    it("renders restaurants belonging to the brand and passes axe checks", async () => {
      const { container } = renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/brands/b-001/restaurants"]}>
            <Routes>
              <Route path="/site/admin/brands/:id/restaurants" element={<BrandRestaurantsPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
        "en",
      );

      await waitFor(() => {
        expect(screen.getByText("Acme Bistro — Downtown")).toBeInTheDocument();
        expect(screen.getByText("Acme Bistro — Marina")).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });

    it("renders empty state when brand has no restaurants", async () => {
      renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/brands/b-003/restaurants"]}>
            <Routes>
              <Route path="/site/admin/brands/:id/restaurants" element={<BrandRestaurantsPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
        "en",
      );

      await waitFor(() => {
        expect(
          screen.getByText(/No restaurants yet. Create a restaurant to get started./i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("BrandStaffPage", () => {
    it("renders the informational banner and passes axe checks", async () => {
      const { container } = renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/brands/b-001/staff"]}>
            <Routes>
              <Route path="/site/admin/brands/:id/staff" element={<BrandStaffPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
        "en",
      );

      await waitFor(() => {
        expect(screen.getByText(/Staff list by brand is not yet available/i)).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("BrandAuditPage", () => {
    it("renders EntityAuditLog for the brand and passes axe checks", async () => {
      const { container } = renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/brands/b-001/audit"]}>
            <Routes>
              <Route path="/site/admin/brands/:id/audit" element={<BrandAuditPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
        "en",
      );

      await waitFor(() => {
        expect(screen.getByText(/Initial brand creation/i)).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
