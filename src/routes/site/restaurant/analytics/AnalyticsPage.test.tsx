import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { AnalyticsPage } from "./AnalyticsPage";

describe("AnalyticsPage", () => {
  it("renders operations analytics dashboard, KPI cards, charts, and passes axe check", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/analytics?restaurantId=r-001"]}>
          <AnalyticsPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    // Initial heading
    expect(
      screen.getByRole("heading", { name: "Operations & Speed Telemetry" }),
    ).toBeInTheDocument();

    // KPI card titles
    expect(screen.getByText("Gross Sales")).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Average Ticket Size")).toBeInTheDocument();
    expect(screen.getByText("Avg Kitchen Prep Time")).toBeInTheDocument();

    // Data from MSW catalog handler
    await waitFor(() => {
      expect(screen.getByText("$4,820.50")).toBeInTheDocument();
      expect(screen.getAllByText("142").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("$33.95")).toBeInTheDocument();
      expect(screen.getByText("14.2m")).toBeInTheDocument();
    });

    // Station Speed Table
    expect(screen.getByText("Kitchen Station Fulfillment Telemetry")).toBeInTheDocument();
    expect(screen.getByText("Grill")).toBeInTheDocument();
    expect(screen.getByText("Fryer")).toBeInTheDocument();
    expect(screen.getByText("Sauté")).toBeInTheDocument();

    // Bottleneck flag check for stations exceeding 120% target
    expect(
      screen.getByText(/Station exceeding 120% target prep time threshold/i),
    ).toBeInTheDocument();

    // Accessibility test
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("allows switching date range filter", async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/analytics?restaurantId=r-001"]}>
          <AnalyticsPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("$4,820.50")).toBeInTheDocument();
    });

    const yesterdayRadio = screen.getByRole("radio", { name: "Yesterday" });
    await user.click(yesterdayRadio);

    expect(yesterdayRadio).toHaveAttribute("aria-checked", "true");
  });

  it("renders correctly under Spanish locale", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/analytics?restaurantId=r-001"]}>
          <AnalyticsPage />
        </MemoryRouter>
      </Provider>,
      "es",
    );

    expect(
      screen.getByRole("heading", { name: "Telemetría y Analítica de Operaciones" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Ventas Brutas")).toBeInTheDocument();
    expect(screen.getByText("Total de Pedidos")).toBeInTheDocument();
    expect(screen.getByText("Ticket Promedio")).toBeInTheDocument();
    expect(screen.getByText("Tiempo Prom. Prep. Cocina")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("142").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("14.2m")).toBeInTheDocument();
    });
  });
});
