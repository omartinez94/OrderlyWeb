import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../app/store";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { AdminDashboardPage } from "./AdminDashboardPage";

describe("AdminDashboardPage", () => {
  it("renders KPIs, brand cards, attention restaurants, and audit timeline in English", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dashboard");

    // Wait for queries to resolve and brand cards to render
    await waitFor(() => {
      expect(screen.getByText("Acme Hospitality Group")).toBeInTheDocument();
    });

    // Check KPIs
    expect(screen.getByText("Brands")).toBeInTheDocument();
    expect(screen.getByText("Restaurants")).toBeInTheDocument();

    // Check audit section
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
  });

  it("renders localized text in Spanish", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </Provider>,
      "es",
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Panel");

    await waitFor(() => {
      expect(screen.getByText("Marcas bajo gestión")).toBeInTheDocument();
    });

    expect(screen.getByText("Actividad reciente")).toBeInTheDocument();
  });

  it("passes a11y audit once loaded", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("Brands under management")).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
