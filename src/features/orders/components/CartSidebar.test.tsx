import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { axe } from "jest-axe";
import { store } from "../../../app/store";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { CartSidebar } from "./CartSidebar";
import type { useOrderDraft } from "../hooks/useOrderDraft";

describe("CartSidebar", () => {
  const mockDraft: ReturnType<typeof useOrderDraft> = {
    cart: undefined,
    items: [
      {
        menuItemId: 1,
        quantity: 2,
        unitPrice: 14,
        variations: [],
        customizations: [],
        totalPrice: 28,
      },
    ],
    itemCount: 2,
    subtotal: 28,
    discountAmount: 0,
    taxAmount: 2.24,
    grandTotal: 30.24,
    isLoading: false,
    isUpdating: false,
    isClearing: false,
    isCheckingOut: false,
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    applyCoupon: vi.fn(),
    clearDraft: vi.fn(),
    checkout: vi.fn(),
  };

  it("renders cart items, quantities, subtotal, and total", () => {
    const handleSend = vi.fn();
    renderWithI18n(
      <Provider store={store}>
        <CartSidebar
          restaurantId="r-001"
          orderType="DineIn"
          onOrderTypeChange={vi.fn()}
          tableId="t-1"
          onTableChange={vi.fn()}
          guestCount={2}
          onGuestCountChange={vi.fn()}
          draft={mockDraft}
          onSendToKitchen={handleSend}
        />
      </Provider>,
      "en",
    );

    expect(screen.getByText("Item #1")).toBeInTheDocument();
    expect(screen.getAllByText("$28.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$30.24")).toBeInTheDocument();
  });

  it("fires onSendToKitchen when primary CTA is clicked", async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();

    renderWithI18n(
      <Provider store={store}>
        <CartSidebar
          restaurantId="r-001"
          orderType="DineIn"
          onOrderTypeChange={vi.fn()}
          tableId="t-1"
          onTableChange={vi.fn()}
          guestCount={2}
          onGuestCountChange={vi.fn()}
          draft={mockDraft}
          onSendToKitchen={handleSend}
        />
      </Provider>,
      "en",
    );

    const sendBtn = screen.getByRole("button", { name: /send to kitchen/i });
    await user.click(sendBtn);

    expect(handleSend).toHaveBeenCalled();
  });

  it("passes accessibility audit with zero axe violations", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <CartSidebar
          restaurantId="r-001"
          orderType="DineIn"
          onOrderTypeChange={vi.fn()}
          tableId="t-1"
          onTableChange={vi.fn()}
          guestCount={2}
          onGuestCountChange={vi.fn()}
          draft={mockDraft}
          onSendToKitchen={vi.fn()}
        />
      </Provider>,
      "en",
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
