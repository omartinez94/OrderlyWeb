import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { RestaurantListPage } from "./RestaurantListPage";
import { RestaurantDetailPage } from "./RestaurantDetailPage";
import { RestaurantNewPage } from "./RestaurantNewPage";
import { RestaurantStaffPage } from "./RestaurantStaffPage";
import { RestaurantAuditPage } from "./RestaurantAuditPage";

describe("Restaurant Admin Pages", () => {
  describe("RestaurantListPage", () => {
    it("renders restaurant list from catalogApi and passes accessibility checks", async () => {
      const { container } = renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/restaurants"]}>
            <RestaurantListPage />
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

    it("filters restaurants by search query", async () => {
      const user = userEvent.setup();
      renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/restaurants"]}>
            <RestaurantListPage />
          </MemoryRouter>
        </Provider>,
        "en",
      );

      await waitFor(() => {
        expect(screen.getByText("Acme Bistro — Downtown")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, "Marina");

      expect(screen.queryByText("Acme Bistro — Downtown")).not.toBeInTheDocument();
      expect(screen.getByText("Acme Bistro — Marina")).toBeInTheDocument();
    });
  });

  describe("RestaurantDetailPage", () => {
    it("renders restaurant detail overview, metrics, address, and hours", async () => {
      const { container } = renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/restaurants/r-001"]}>
            <Routes>
              <Route path="/site/admin/restaurants/:id" element={<RestaurantDetailPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
        "en",
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Acme Bistro — Downtown" })).toBeInTheDocument();
      });

      expect(screen.getByText("123 Main St")).toBeInTheDocument();
      expect(screen.getByText("90m")).toBeInTheDocument();
      expect(screen.getByText("USD")).toBeInTheDocument();
      expect(screen.getByText("8.88%")).toBeInTheDocument();

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("RestaurantNewPage", () => {
    it("renders restaurant creation form and submits data", async () => {
      const { container } = renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/restaurants/new"]}>
            <Routes>
              <Route path="/site/admin/restaurants/new" element={<RestaurantNewPage />} />
              <Route path="/site/admin/restaurants/:id" element={<RestaurantDetailPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
        "en",
      );

      expect(screen.getByRole("heading", { name: "New restaurant" })).toBeInTheDocument();
      expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("RestaurantStaffPage", () => {
    it("renders staff members assigned to the restaurant", async () => {
      const { container } = renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/restaurants/r-001/staff"]}>
            <Routes>
              <Route path="/site/admin/restaurants/:id/staff" element={<RestaurantStaffPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
        "en",
      );

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Staff management" })).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("RestaurantAuditPage", () => {
    it("renders EntityAuditLog for restaurant", async () => {
      const { container } = renderWithI18n(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/site/admin/restaurants/r-001/audit"]}>
            <Routes>
              <Route path="/site/admin/restaurants/:id/audit" element={<RestaurantAuditPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
        "en",
      );

      await waitFor(() => {
        expect(screen.getByText("Created")).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
