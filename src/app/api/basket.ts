/**
 * basketApi — Cart & Checkout RTK Query slice.
 *
 * Aligned with .NET 10 Carter Minimal APIs at `/basket-api/v1/cart`.
 * Supports token-bound identity, ETag/If-None-Match conditional caching,
 * and Idempotency-Key checkout.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";
import type {
  Basket,
  BasketCheckoutDto,
  GetBasketResponse,
  StoreBasketResponse,
  CheckoutBasketResponse,
} from "../../types/basket";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

export interface CheckoutCartArgs {
  checkout: Omit<BasketCheckoutDto, "userId" | "restaurantId"> & {
    userId?: string;
    restaurantId?: string;
  };
  idempotencyKey?: string;
}

export const basketApi = createApi({
  reducerPath: "basketApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    getCart: build.query<Basket, { restaurantId?: string } | void>({
      query: () => ({
        url: `${env.apiBaseUrl}/basket-api/v1/cart`,
        headers: {
          "Cache-Control": "no-cache",
        },
      }),
      transformResponse: (response: GetBasketResponse) => response.basket,
      providesTags: (result, _e, arg) => {
        const restaurantId = result?.restaurantId || arg?.restaurantId;
        return [{ type: "Cart" as const, id: restaurantId ? `CART-${restaurantId}` : "CART" }];
      },
    }),

    updateCart: build.mutation<StoreBasketResponse, Basket>({
      query: (basket) => {
        // Enforce Guid.Empty as required by backend BasketIdentityGuardBehavior & validator
        const payload: Basket = {
          ...basket,
          userId: EMPTY_GUID,
          restaurantId: EMPTY_GUID,
        };
        return {
          url: `${env.apiBaseUrl}/basket-api/v1/cart`,
          method: "PUT",
          body: payload,
        };
      },
      invalidatesTags: (_r, _e, basket) => [
        { type: "Cart", id: basket.restaurantId ? `CART-${basket.restaurantId}` : "CART" },
      ],
    }),

    clearCart: build.mutation<void, { restaurantId?: string } | void>({
      query: () => ({
        url: `${env.apiBaseUrl}/basket-api/v1/cart`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Cart", id: arg?.restaurantId ? `CART-${arg.restaurantId}` : "CART" },
      ],
    }),

    checkoutCart: build.mutation<CheckoutBasketResponse, CheckoutCartArgs>({
      query: ({ checkout, idempotencyKey }) => {
        const payload: BasketCheckoutDto = {
          ...checkout,
          userId: EMPTY_GUID,
          restaurantId: EMPTY_GUID,
        };
        const headers: Record<string, string> = {};
        if (idempotencyKey) {
          headers["Idempotency-Key"] = idempotencyKey;
        } else if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          headers["Idempotency-Key"] = crypto.randomUUID();
        }

        return {
          url: `${env.apiBaseUrl}/basket-api/v1/cart/checkout`,
          method: "POST",
          headers,
          body: payload,
        };
      },
      invalidatesTags: [
        { type: "Cart", id: "CART" },
        { type: "Orders", id: "LIST" },
      ],
    }),
  }),
  tagTypes: ["Cart", "Orders"],
});

export const {
  useGetCartQuery,
  useUpdateCartMutation,
  useClearCartMutation,
  useCheckoutCartMutation,
} = basketApi;
