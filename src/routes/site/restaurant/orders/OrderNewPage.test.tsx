import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { OrderNewPage } from "./OrderNewPage";

describe("OrderNewPage", () => {
  it("renders POS catalog and pre-populates table from URL query params", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/site/restaurant/orders/new?tableId=t-1&orderType=DineIn&guestCount=4"]}
        >
          <OrderNewPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    // Header title and pre-filled table badge
    expect(screen.getByRole("heading", { name: "New order" })).toBeInTheDocument();
    expect(screen.getByText("Table t-1")).toBeInTheDocument();

    // Catalog items rendered from MSW
    await waitFor(() => {
      expect(screen.getByText("Margherita")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("adds item to draft and triggers checkout", async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/orders/new?tableId=t-1"]}>
          <OrderNewPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("Margherita")).toBeInTheDocument();
    });

    // Send to Kitchen button exists and is clickable
    const sendBtn = screen.getByRole("button", { name: /send to kitchen/i });
    expect(sendBtn).toBeInTheDocument();

    await user.click(sendBtn);

    // Triggering checkout starts polling or displays sending state
    await waitFor(() => {
      expect(screen.getByText(/sending to kitchen/i)).toBeInTheDocument();
    });
  });
});
