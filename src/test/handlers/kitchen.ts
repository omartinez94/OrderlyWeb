/**
 * MSW handlers for the Kitchen Service.
 * Aligned with /kitchen-api/v1/kitchen.
 */

import { http, HttpResponse } from "msw";

const BASE = "http://localhost:6004/kitchen-api/v1/kitchen";

const mockTicket = {
  id: "t-001",
  restaurantId: "r-001",
  customerId: "c-001",
  orderNumber: "ORD-2026-0001",
  status: "InProgress",
  receivedAt: "2026-07-28T10:00:00Z",
  startedAt: "2026-07-28T10:02:00Z",
  readyAt: null,
  bumpedAt: null,
  cancelledAt: null,
  cancellationReason: null,
  confirmedByUserId: "u-001",
  cancelledByUserId: null,
  notes: "Table 4 priority",
  estimatedPrepTimeMinutes: 15,
  items: [
    {
      id: "ti-001",
      orderItemId: "i-1",
      menuItemId: "m-1",
      menuItemName: "Margherita Pizza",
      quantity: 1,
      unitPrice: 1400,
      selectedVariations: [],
      customizations: [],
      specialInstructions: null,
      seatNumber: 1,
      status: "Preparing",
      startedAt: "2026-07-28T10:02:00Z",
      readyAt: null,
      stationId: "st-pizza",
    },
  ],
};

export const kitchenHandlers = [
  http.get(`${BASE}/queue`, () =>
    HttpResponse.json({
      pageIndex: 1,
      pageSize: 50,
      count: 1,
      data: [mockTicket],
    }),
  ),

  http.get(`${BASE}/tickets/:id`, ({ params }) =>
    HttpResponse.json({
      ...mockTicket,
      id: params.id,
    }),
  ),

  http.post(`${BASE}/tickets/:id/accept`, () => new HttpResponse(null, { status: 204 })),

  http.post(
    `${BASE}/tickets/:id/items/:itemId/start`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.post(
    `${BASE}/tickets/:id/items/:itemId/ready`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.post(`${BASE}/tickets/:id/mark-ready`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${BASE}/tickets/:id/bump`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${BASE}/tickets/:id/recall`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${BASE}/tickets/:id/cancel`, () => new HttpResponse(null, { status: 204 })),
];
