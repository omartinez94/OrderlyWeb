import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { OrderListPage } from "./OrderListPage";

describe("OrderListPage", () => {
  it("renders live orders from orderingApi through MSW handler", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/orders"]}>
          <OrderListPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    // Initial render displays headers and filter bar
    expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();

    // MSW mockOrder has orderNumber: "ORD-2026-0001", status: "Preparing", total: 1512 -> $15.12
    await waitFor(() => {
      expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    });

    expect(screen.getByText("$15.12")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("filters orders by search query", async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/orders"]}>
          <OrderListPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    });

    const searchInput = screen.getByRole("textbox", { name: /search by order/i });
    await user.type(searchInput, "NON_EXISTENT_ORDER");

    await waitFor(() => {
      expect(screen.queryByText("ORD-2026-0001")).not.toBeInTheDocument();
      expect(screen.getByText("No orders found")).toBeInTheDocument();
    });
  });
});
