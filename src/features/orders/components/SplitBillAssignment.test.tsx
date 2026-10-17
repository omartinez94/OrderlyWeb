import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { SplitBillAssignment } from "./SplitBillAssignment";
import type { OrderDto } from "../../../types/order";

const mockOrder: OrderDto = {
  id: "o-001",
  customerId: "c-001",
  orderNumber: "ORD-2026-0001",
  restaurantId: "r-001",
  currency: "USD",
  subtotal: 14,
  taxRate: 0.08,
  taxAmount: 1.12,
  discountAmount: 0,
  discountCode: "",
  totalAmount: 15.12,
  status: "Preparing",
  orderType: "DineIn",
  billingAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
  deliveryAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
  deliveryNotes: "",
  payment: { method: "CreditCard", brand: "Visa", lastFour: "4242" },
  estimatedPrepTimeMinutes: 20,
  actualPrepTimeMinutes: 15,
  isModified: false,
  requiresAdminApproval: false,
  notes: "",
  orderItems: [
    {
      id: "i-1",
      orderId: "o-001",
      menuItemId: "m-1",
      menuItemName: "Margherita",
      menuItemDescription: "",
      menuItemImageUrl: "",
      quantity: 1,
      unitPrice: 10,
      basePrice: 10,
      totalPrice: 10,
      seatNumber: 1,
      specialInstructions: "",
      customizations: [],
      selectedVariations: [],
      prepStatus: "Preparing",
      createdAt: "2026-07-28T10:00:00Z",
      prepStartedAt: null,
      prepCompletedAt: null,
    },
    {
      id: "i-2",
      orderId: "o-001",
      menuItemId: "m-2",
      menuItemName: "Coke",
      menuItemDescription: "",
      menuItemImageUrl: "",
      quantity: 1,
      unitPrice: 4,
      basePrice: 4,
      totalPrice: 4,
      seatNumber: 2,
      specialInstructions: "",
      customizations: [],
      selectedVariations: [],
      prepStatus: "Ready",
      createdAt: "2026-07-28T10:00:00Z",
      prepStartedAt: null,
      prepCompletedAt: null,
    },
  ],
  activities: [],
};

describe("SplitBillAssignment", () => {
  it("renders Equal Split mode with balanced status", () => {
    renderWithI18n(<SplitBillAssignment order={mockOrder} />, "en");

    expect(screen.getByText("Equal Split")).toBeInTheDocument();
    expect(screen.getByText("Custom / By Seat")).toBeInTheDocument();
    expect(screen.getByText(/Balanced/)).toBeInTheDocument();

    expect(screen.getByText("Bill 1")).toBeInTheDocument();
    expect(screen.getByText("Bill 2")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Mark Paid" })).toHaveLength(2);
  });

  it("switches to Custom mode and renders item allocation matrix", async () => {
    const user = userEvent.setup();
    renderWithI18n(<SplitBillAssignment order={mockOrder} />, "en");

    const customTab = screen.getByRole("button", { name: "Custom / By Seat" });
    await user.click(customTab);

    expect(screen.getByText("Payer Item Assignments")).toBeInTheDocument();
    expect(screen.getByText("Margherita")).toBeInTheDocument();
    expect(screen.getByText("Coke")).toBeInTheDocument();
  });

  it("settles a bill with Cash tender calculation and opens receipt modal", async () => {
    const user = userEvent.setup();
    renderWithI18n(<SplitBillAssignment order={mockOrder} />, "en");

    // Select cash for Bill 1
    const cashBtns = screen.getAllByRole("button", { name: /cash/i });
    await user.click(cashBtns[0]);

    // Click quick $20 bill button
    const bill20Btn = screen.getByRole("button", { name: "$20" });
    await user.click(bill20Btn);

    // Verify change due appears
    expect(screen.getByText("Change Due:")).toBeInTheDocument();

    // Mark Bill 1 Paid
    const markPaidBtns = screen.getAllByRole("button", { name: "Mark Paid" });
    await user.click(markPaidBtns[0]);

    // Print receipt button appears for Bill 1
    const printReceiptBtn = screen.getByRole("button", { name: "Print Receipt" });
    expect(printReceiptBtn).toBeInTheDocument();

    // Open receipt modal
    await user.click(printReceiptBtn);
    expect(screen.getByText("ORDERLY RESTAURANT")).toBeInTheDocument();
    expect(screen.getByText("Thermal Receipt Voucher")).toBeInTheDocument();
  });

  it("passes axe accessibility checks", async () => {
    const { container } = renderWithI18n(<SplitBillAssignment order={mockOrder} />, "en");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
