import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { OrderDetailPage } from "./OrderDetailPage";

describe("OrderDetailPage", () => {
  it("renders order metadata, item breakdown, and timeline from orderingApi", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/orders/o-001"]}>
          <Routes>
            <Route path="/site/restaurant/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
      "en",
    );

    // Initial loading or loaded check
    await waitFor(() => {
      expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    });

    // Check item details
    expect(screen.getByText("Margherita")).toBeInTheDocument();
    expect(screen.getByText("1x")).toBeInTheDocument();

    // Check financial figures
    expect(screen.getByText("$15.12")).toBeInTheDocument();

    // Check Split Bill action link
    const splitBtn = screen.getByRole("link", { name: /split bill/i });
    expect(splitBtn).toBeInTheDocument();
    expect(splitBtn).toHaveAttribute("href", "/site/restaurant/orders/o-001/split-bill");

    // Axe audit
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders correctly in Spanish", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/orders/o-001"]}>
          <Routes>
            <Route path="/site/restaurant/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
      "es",
    );

    await waitFor(() => {
      expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /dividir cuenta/i })).toBeInTheDocument();
    expect(screen.getByText("Cronología de actividades")).toBeInTheDocument();
  });
});
