import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { MenuPage } from "./MenuPage";

describe("MenuPage", () => {
  it("renders menu categories, items, and passes accessibility checks", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/menu"]}>
          <MenuPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    // Initial heading and KPI counters
    expect(screen.getByRole("heading", { name: "Menu Availability" })).toBeInTheDocument();

    // Items from MSW catalog handler
    await waitFor(() => {
      expect(screen.getByText("Margherita")).toBeInTheDocument();
      expect(screen.getByText("Pepperoni Piccante")).toBeInTheDocument();
      expect(screen.getByText("Rigatoni Carbonara")).toBeInTheDocument();
      expect(screen.getByText("San Pellegrino")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("filters items when clicking a category tab", async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/menu"]}>
          <MenuPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("Margherita")).toBeInTheDocument();
    });

    // Click on Pasta tab
    const pastaTab = screen.getByRole("tab", { name: /Pasta/i });
    await user.click(pastaTab);

    // Only pasta should show
    expect(screen.getByText("Rigatoni Carbonara")).toBeInTheDocument();
    expect(screen.queryByText("Margherita")).not.toBeInTheDocument();
    expect(screen.queryByText("San Pellegrino")).not.toBeInTheDocument();
  });

  it("renders correctly in Spanish", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/menu"]}>
          <MenuPage />
        </MemoryRouter>
      </Provider>,
      "es",
    );

    expect(screen.getByRole("heading", { name: "Disponibilidad del Menú" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Margherita")).toBeInTheDocument();
    });
  });
});
