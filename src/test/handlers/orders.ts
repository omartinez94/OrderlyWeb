/**
 * MSW handlers for the Ordering Service.
 * Aligned with /ordering-api/v1/orders.
 */

import { http, HttpResponse } from "msw";

const BASE = "http://localhost:6004/ordering-api/v1";

const mockOrder = {
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
  billingAddress: {
    street: "123 Main St",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    country: "US",
  },
  deliveryAddress: {
    street: "123 Main St",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    country: "US",
  },
  deliveryNotes: "",
  deliveryStatus: null,
  payment: {
    method: "CreditCard",
    brand: "Visa",
    lastFour: "4242",
  },
  estimatedPrepTimeMinutes: 20,
  actualPrepTimeMinutes: 15,
  isModified: false,
  requiresAdminApproval: false,
  tableId: "t-1",
  notes: "No onions",
  orderItems: [
    {
      id: "i-1",
      orderId: "o-001",
      menuItemId: "m-1",
      menuItemName: "Margherita",
      menuItemDescription: "Classic cheese pizza",
      menuItemImageUrl: "",
      quantity: 1,
      unitPrice: 14,
      basePrice: 14,
      totalPrice: 14,
      seatNumber: 1,
      specialInstructions: "",
      customizations: [],
      selectedVariations: [],
      prepStatus: "Preparing",
      createdAt: "2026-07-28T10:00:00Z",
      prepStartedAt: "2026-07-28T10:05:00Z",
      prepCompletedAt: null,
    },
  ],
  activities: [
    {
      id: "act-1",
      activityType: "OrderCreated",
      actorUserId: "u-001",
      occurredAt: "2026-07-28T10:00:00Z",
      correlationId: "corr-1",
      notes: null,
      metadata: null,
    },
  ],
};

export const orderHandlers = [
  http.get(`${BASE}/orders`, () =>
    HttpResponse.json({
      orders: {
        pageIndex: 1,
        pageSize: 50,
        count: 1,
        data: [mockOrder],
      },
    }),
  ),

  http.get(`${BASE}/orders/:id`, ({ params }) =>
    HttpResponse.json({
      order: {
        ...mockOrder,
        id: params.id,
      },
    }),
  ),

  http.get(`${BASE}/orders/:id/activities`, () =>
    HttpResponse.json({
      activities: {
        pageIndex: 1,
        pageSize: 50,
        count: mockOrder.activities.length,
        data: mockOrder.activities,
      },
    }),
  ),

  http.post(`${BASE}/orders`, () => HttpResponse.json({ id: "o-new-001" }, { status: 201 })),

  http.post(`${BASE}/orders/:id/cancel`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${BASE}/orders/:id/confirm`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${BASE}/orders/:id/start-prep`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${BASE}/orders/:id/mark-ready`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${BASE}/orders/:id/mark-delivered`, () => new HttpResponse(null, { status: 204 })),

  http.post(
    `${BASE}/orders/:id/items/:itemId/start-prep`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.post(
    `${BASE}/orders/:id/items/:itemId/mark-ready`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
