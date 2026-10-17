import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { OrderListTable } from "./OrderListTable";
import type { OrderDto } from "../../../types/order";

const mockOrders: OrderDto[] = [
  {
    id: "o-001",
    customerId: "c-001",
    orderNumber: "ORD-2026-0001",
    restaurantId: "r-001",
    currency: "USD",
    subtotal: 28,
    taxRate: 0.08,
    taxAmount: 2.24,
    discountAmount: 0,
    discountCode: "",
    totalAmount: 30.24,
    status: "Preparing",
    orderType: "DineIn",
    billingAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
    deliveryAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
    deliveryNotes: "",
    deliveryStatus: null,
    payment: { method: "CreditCard", brand: "Visa", lastFour: "4242" },
    estimatedPrepTimeMinutes: 20,
    actualPrepTimeMinutes: 10,
    isModified: false,
    requiresAdminApproval: false,
    tableId: "t-4",
    notes: "",
    orderItems: [
      {
        id: "i-1",
        orderId: "o-001",
        menuItemId: "m-1",
        menuItemName: "Margherita Pizza",
        menuItemDescription: "",
        menuItemImageUrl: "",
        quantity: 2,
        unitPrice: 1400,
        basePrice: 1400,
        totalPrice: 2800,
        seatNumber: 1,
        specialInstructions: "",
        customizations: [],
        selectedVariations: [],
        prepStatus: "Preparing",
        createdAt: "2026-07-28T12:00:00Z",
        prepStartedAt: "2026-07-28T12:05:00Z",
        prepCompletedAt: null,
      },
    ],
    activities: [
      {
        id: "act-1",
        activityType: "OrderCreated",
        actorUserId: "u-1",
        occurredAt: "2026-07-28T12:00:00Z",
      },
    ],
  },
  {
    id: "o-002",
    customerId: "c-002",
    orderNumber: "ORD-2026-0002",
    restaurantId: "r-001",
    currency: "USD",
    subtotal: 12,
    taxRate: 0.08,
    taxAmount: 0.96,
    discountAmount: 0,
    discountCode: "",
    totalAmount: 12.96,
    status: "Ready",
    orderType: "Takeout",
    billingAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
    deliveryAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
    deliveryNotes: "",
    deliveryStatus: null,
    payment: { method: "Cash", brand: "", lastFour: "" },
    estimatedPrepTimeMinutes: 15,
    actualPrepTimeMinutes: 15,
    isModified: false,
    requiresAdminApproval: false,
    tableId: null,
    notes: "",
    orderItems: [
      {
        id: "i-2",
        orderId: "o-002",
        menuItemId: "m-2",
        menuItemName: "Classic Burger",
        menuItemDescription: "",
        menuItemImageUrl: "",
        quantity: 1,
        unitPrice: 1200,
        basePrice: 1200,
        totalPrice: 1200,
        seatNumber: 1,
        specialInstructions: "",
        customizations: [],
        selectedVariations: [],
        prepStatus: "Ready",
        createdAt: "2026-07-28T12:10:00Z",
        prepStartedAt: "2026-07-28T12:12:00Z",
        prepCompletedAt: "2026-07-28T12:25:00Z",
      },
    ],
    activities: [],
  },
];

describe("OrderListTable", () => {
  it("renders order rows with telemetry, 5-stop status badges, and formatted amounts", () => {
    const handlePageChange = vi.fn();
    renderWithI18n(
      <MemoryRouter>
        <OrderListTable
          orders={mockOrders}
          totalCount={2}
          page={1}
          pageSize={15}
          isLoading={false}
          onPageChange={handlePageChange}
        />
      </MemoryRouter>,
      "en",
    );

    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0002")).toBeInTheDocument();
    expect(screen.getByText("Table 4")).toBeInTheDocument();
    expect(screen.getAllByText("Takeout").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/2x Margherita Pizza/)).toBeInTheDocument();
    expect(screen.getByText("$30.24")).toBeInTheDocument();
    expect(screen.getByText("$12.96")).toBeInTheDocument();
  });

  it("renders empty state when orders list is empty", () => {
    const handleReset = vi.fn();
    renderWithI18n(
      <MemoryRouter>
        <OrderListTable
          orders={[]}
          totalCount={0}
          page={1}
          pageSize={15}
          isLoading={false}
          onPageChange={vi.fn()}
          onResetFilters={handleReset}
        />
      </MemoryRouter>,
      "en",
    );

    expect(screen.getByText("No orders found")).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: /reset filters/i });
    expect(resetBtn).toBeInTheDocument();
  });

  it("renders DataTableSkeleton when isLoading is true", () => {
    renderWithI18n(
      <MemoryRouter>
        <OrderListTable
          orders={[]}
          totalCount={0}
          page={1}
          pageSize={15}
          isLoading={true}
          onPageChange={vi.fn()}
        />
      </MemoryRouter>,
      "en",
    );

    expect(screen.getByTestId("data-table-skeleton")).toBeInTheDocument();
  });

  it("handles pagination clicks", async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();

    renderWithI18n(
      <MemoryRouter>
        <OrderListTable
          orders={mockOrders}
          totalCount={40}
          page={1}
          pageSize={15}
          isLoading={false}
          onPageChange={handlePageChange}
        />
      </MemoryRouter>,
      "en",
    );

    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("passes accessibility audit with zero axe violations", async () => {
    const { container } = renderWithI18n(
      <MemoryRouter>
        <OrderListTable
          orders={mockOrders}
          totalCount={2}
          page={1}
          pageSize={15}
          isLoading={false}
          onPageChange={vi.fn()}
        />
      </MemoryRouter>,
      "en",
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
