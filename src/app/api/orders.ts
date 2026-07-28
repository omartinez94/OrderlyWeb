/**
 * ordersApi — order CRUD, status mutations, modification approval,
 * split-bill. Tag the cache by `restaurantId` so the restaurant
 * switcher can invalidate by tag.
 *
 * Status filter list types mirror `docs/website-spec.md` §5.4.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";
import type { OrderStatus } from "../../types/order";

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalCents: number;
  openedAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  qty: number;
  priceCents: number;
}

export interface CreateOrderRequest {
  restaurantId: string;
  tableId: string;
  items: Array<{ menuItemId: string; qty: number }>;
}

export interface SplitBillRequest {
  orderId: string;
  payers: Array<{ name: string; itemIds: string[] }>;
}

export interface ProposeModificationRequest {
  orderId: string;
  add: Array<{ menuItemId: string; qty: number }>;
  remove: Array<{ itemId: string }>;
}

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    getOrders: build.query<Order[], { restaurantId: string; status?: OrderStatus[] }>({
      query: ({ restaurantId, status }) => {
        const qs = new URLSearchParams({ restaurantId });
        if (status?.length) qs.set("status", status.join(","));
        return `${env.apiBaseUrl}/order-api/orders?${qs.toString()}`;
      },
      providesTags: (result, _e, { restaurantId }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Orders" as const, id })),
              { type: "Orders" as const, id: `LIST-${restaurantId}` },
            ]
          : [{ type: "Orders" as const, id: `LIST-${restaurantId}` }],
    }),
    getOrder: build.query<Order, string>({
      query: (id) => `${env.apiBaseUrl}/order-api/orders/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Orders", id }],
    }),
    createOrder: build.mutation<Order, CreateOrderRequest>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/order-api/orders`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Orders", id: `LIST-${restaurantId}` },
      ],
    }),
    updateOrderStatus: build.mutation<Order, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `${env.apiBaseUrl}/order-api/orders/${encodeURIComponent(id)}/status`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Orders", id }],
    }),
    proposeModification: build.mutation<Order, ProposeModificationRequest>({
      query: ({ orderId, ...body }) => ({
        url: `${env.apiBaseUrl}/order-api/orders/${encodeURIComponent(orderId)}/modifications`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { orderId }) => [{ type: "Orders", id: orderId }],
    }),
    approveModification: build.mutation<Order, { orderId: string; modificationId: string }>({
      query: ({ orderId, modificationId }) => ({
        url: `${env.apiBaseUrl}/order-api/orders/${encodeURIComponent(orderId)}/modifications/${encodeURIComponent(modificationId)}/approve`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { orderId }) => [{ type: "Orders", id: orderId }],
    }),
    splitBill: build.mutation<Order, SplitBillRequest>({
      query: ({ orderId, ...body }) => ({
        url: `${env.apiBaseUrl}/order-api/orders/${encodeURIComponent(orderId)}/split-bill`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { orderId }) => [{ type: "Orders", id: orderId }],
    }),
  }),
  tagTypes: ["Orders"],
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useProposeModificationMutation,
  useApproveModificationMutation,
  useSplitBillMutation,
} = ordersApi;
