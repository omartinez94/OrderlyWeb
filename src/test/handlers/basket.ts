/**
 * MSW handlers for the Basket Service.
 * Aligned with /basket-api/v1/cart.
 */

import { http, HttpResponse } from "msw";

const BASE = "http://localhost:6004/basket-api/v1/cart";

let currentCart = {
  userId: "u-001",
  restaurantId: "r-001",
  items: [
    {
      menuItemId: 1,
      quantity: 2,
      unitPrice: 1200,
      variations: [],
      customizations: [],
      totalPrice: 2400,
    },
  ],
  appliedDiscounts: [],
  appliedCoupons: [],
  appliedDiscountBreakdown: [],
  discountAmount: 0,
  effectiveSubtotal: 2400,
  subtotal: 2400,
  total: 2400,
  createdAt: "2026-07-28T10:00:00Z",
  expiresAt: "2026-07-28T12:00:00Z",
  lastModifiedAt: "2026-07-28T10:00:00Z",
};

export const basketHandlers = [
  http.get(BASE, () =>
    HttpResponse.json({
      basket: currentCart,
    }),
  ),

  http.put(BASE, async ({ request }) => {
    const body = (await request.json()) as typeof currentCart;
    currentCart = {
      ...currentCart,
      ...body,
      lastModifiedAt: new Date().toISOString(),
    };
    return HttpResponse.json({
      isCreated: false,
      userId: currentCart.userId,
      restaurantId: currentCart.restaurantId,
    });
  }),

  http.delete(BASE, () => {
    currentCart = {
      ...currentCart,
      items: [],
      discountAmount: 0,
      effectiveSubtotal: 0,
      subtotal: 0,
      total: 0,
    };
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/checkout`, () =>
    HttpResponse.json({
      success: true,
      message: "Order placed successfully",
    }),
  ),
];
