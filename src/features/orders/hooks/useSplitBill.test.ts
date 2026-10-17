import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSplitBill } from "./useSplitBill";
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

describe("useSplitBill", () => {
  it("splits total amount evenly and balances cents on final bill", () => {
    const { result } = renderHook(() => useSplitBill({ order: mockOrder }));

    // Default 2 ways: $15.12 / 2 = $7.56 each
    expect(result.current.bills).toHaveLength(2);
    expect(result.current.bills[0].total).toBe(7.56);
    expect(result.current.bills[1].total).toBe(7.56);
    expect(result.current.isBalanced).toBe(true);

    const sum = result.current.bills.reduce((acc, b) => acc + b.total, 0);
    expect(Math.round(sum * 100) / 100).toBe(15.12);

    // Split 3 ways: 1512 / 3 = 504 cents ($5.04) each
    act(() => {
      result.current.setWays(3);
    });

    expect(result.current.bills).toHaveLength(3);
    const sum3 = result.current.bills.reduce((acc, b) => acc + b.total, 0);
    expect(Math.round(sum3 * 100) / 100).toBe(15.12);

    // Split 5 ways: 1512 / 5 = 302 base cents ($3.02), remainder 2 cents
    act(() => {
      result.current.setWays(5);
    });
    expect(result.current.bills).toHaveLength(5);
    const sum5 = result.current.bills.reduce((acc, b) => acc + b.total, 0);
    expect(Math.round(sum5 * 100) / 100).toBe(15.12);
  });

  it("handles custom split item assignment and unassigned items tracking", () => {
    const { result } = renderHook(() => useSplitBill({ order: mockOrder }));

    act(() => {
      result.current.setSplitMode("custom");
    });

    expect(result.current.unassignedItemCount).toBe(2);
    expect(result.current.isBalanced).toBe(false);

    // Assign item 1 to Payer 1
    act(() => {
      result.current.assignItemToPayer("i-1", "payer-1");
    });

    expect(result.current.unassignedItemCount).toBe(1);

    // Assign item 2 to Payer 2
    act(() => {
      result.current.assignItemToPayer("i-2", "payer-2");
    });

    expect(result.current.unassignedItemCount).toBe(0);
    expect(result.current.isBalanced).toBe(true);
  });

  it("records settlement and tracks payment status", () => {
    const { result } = renderHook(() => useSplitBill({ order: mockOrder }));

    expect(result.current.isFullyPaid).toBe(false);

    act(() => {
      result.current.recordPayment("equal-bill-1", "Cash", 10, 2.44);
    });

    expect(result.current.bills[0].isPaid).toBe(true);
    expect(result.current.bills[0].paymentMethod).toBe("Cash");
    expect(result.current.bills[0].changeDue).toBe(2.44);
    expect(result.current.isFullyPaid).toBe(false);

    act(() => {
      result.current.recordPayment("equal-bill-2", "CreditCard");
    });

    expect(result.current.bills[1].isPaid).toBe(true);
    expect(result.current.isFullyPaid).toBe(true);
  });
});
