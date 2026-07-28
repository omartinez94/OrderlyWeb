/**
 * MSW handlers for the Order Service.
 */

import { http, HttpResponse } from "msw";

const BASE = "http://localhost:6004/order-api";

export const orderHandlers = [
  http.get(`${BASE}/orders`, () =>
    HttpResponse.json([
      {
        id: "o-001",
        restaurantId: "r-001",
        tableId: "t-1",
        status: "preparing",
        items: [{ id: "i-1", menuItemId: "m-1", name: "Margherita", qty: 1, priceCents: 1400 }],
        totalCents: 1400,
        openedAt: "2026-07-28T10:00:00Z",
        updatedAt: "2026-07-28T10:05:00Z",
      },
    ]),
  ),
  http.get(`${BASE}/orders/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      restaurantId: "r-001",
      tableId: "t-1",
      status: "preparing",
      items: [],
      totalCents: 0,
      openedAt: "2026-07-28T10:00:00Z",
      updatedAt: "2026-07-28T10:05:00Z",
    }),
  ),
];
