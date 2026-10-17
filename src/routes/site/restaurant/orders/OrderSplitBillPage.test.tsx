import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { OrderSplitBillPage } from "./OrderSplitBillPage";

describe("OrderSplitBillPage", () => {
  it("renders order metadata and split bill workstation from orderingApi", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/orders/o-001/split-bill"]}>
          <Routes>
            <Route path="/site/restaurant/orders/:id/split-bill" element={<OrderSplitBillPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    });

    expect(screen.getByText("Equal Split")).toBeInTheDocument();
    expect(screen.getByText("Custom / By Seat")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders correctly in Spanish", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/orders/o-001/split-bill"]}>
          <Routes>
            <Route path="/site/restaurant/orders/:id/split-bill" element={<OrderSplitBillPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
      "es",
    );

    await waitFor(() => {
      expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    });

    expect(screen.getByText("En partes iguales")).toBeInTheDocument();
    expect(screen.getByText("Personalizado / Por asiento")).toBeInTheDocument();
  });
});
