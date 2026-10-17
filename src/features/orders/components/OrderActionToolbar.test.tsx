import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../app/store";
import { sessionSlice } from "../../../app/session/sessionSlice";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { OrderActionToolbar } from "./OrderActionToolbar";
import type { OrderDto } from "../../../types/order";
import type { Role } from "../../../types/auth";

function setupUserRoles(roles: Role[]) {
  store.dispatch(
    sessionSlice.actions.setCredentials({
      accessToken: "test-token",
      expiresAt: Date.now() + 60000,
      user: { id: "u-1", name: "Test User", email: "test@orderly.com", initials: "TU" },
      roles,
      permissions: [],
    }),
  );
}

const baseOrder: OrderDto = {
  id: "o-001",
  customerId: "c-001",
  orderNumber: "ORD-2026-0001",
  restaurantId: "r-001",
  currency: "USD",
  subtotal: 20,
  taxRate: 0.08,
  taxAmount: 1.6,
  discountAmount: 0,
  discountCode: "",
  totalAmount: 21.6,
  status: "Pending",
  orderType: "DineIn",
  billingAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
  deliveryAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
  deliveryNotes: "",
  deliveryStatus: null,
  payment: { method: "CreditCard", brand: "Visa", lastFour: "4242" },
  estimatedPrepTimeMinutes: 15,
  actualPrepTimeMinutes: 10,
  isModified: false,
  requiresAdminApproval: false,
  tableId: "t-1",
  notes: "",
  orderItems: [],
  activities: [],
};

describe("OrderActionToolbar", () => {
  it("renders Confirm Order and Cancel Order for Pending orders", () => {
    setupUserRoles(["Waiter"]);
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <OrderActionToolbar order={baseOrder} />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    expect(screen.getByRole("button", { name: /confirm order/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel order/i })).toBeEnabled();
    expect(screen.getByRole("link", { name: /split bill/i })).toBeInTheDocument();
  });

  it("disables Cancel Order for non-manager when order is Confirmed or Preparing", () => {
    setupUserRoles(["Waiter"]);
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <OrderActionToolbar order={{ ...baseOrder, status: "Preparing" }} />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    const cancelBtn = screen.getByRole("button", { name: /cancel order/i });
    expect(cancelBtn).toBeDisabled();
  });

  it("enables Cancel Order for Manager when order is Preparing", () => {
    setupUserRoles(["Manager"]);
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <OrderActionToolbar order={{ ...baseOrder, status: "Preparing" }} />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    const cancelBtn = screen.getByRole("button", { name: /cancel order/i });
    expect(cancelBtn).toBeEnabled();
  });

  it("disables Cancel Order when order is Ready or Delivered", () => {
    setupUserRoles(["Manager"]);
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <OrderActionToolbar order={{ ...baseOrder, status: "Delivered" }} />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    const cancelBtn = screen.getByRole("button", { name: /cancel order/i });
    expect(cancelBtn).toBeDisabled();
  });

  it("opens CancelOrderDialog when Cancel Order is clicked", async () => {
    const user = userEvent.setup();
    setupUserRoles(["Manager"]);

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <OrderActionToolbar order={{ ...baseOrder, status: "Pending" }} />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    const cancelBtn = screen.getByRole("button", { name: /cancel order/i });
    await user.click(cancelBtn);

    await waitFor(() => {
      expect(screen.getByText("Cancel Order ORD-2026-0001")).toBeInTheDocument();
    });
  });

  it("passes axe accessibility checks", async () => {
    setupUserRoles(["Manager"]);
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <OrderActionToolbar order={baseOrder} />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
