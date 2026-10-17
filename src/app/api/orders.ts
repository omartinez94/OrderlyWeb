/**
 * ordersApi — order CRUD, status mutations, modification approval,
 * split-bill, and activity timelines.
 *
 * Aligned with .NET 10 Carter Minimal API at `/ordering-api/v1/orders`.
 * Tags cache by `restaurantId` so the restaurant switcher invalidates by tag.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";
import type {
  OrderDto,
  OrderActivityDto,
  PaginatedResult,
  BackendOrderStatus,
} from "../../types/order";

export type { OrderDto } from "../../types/order";

// Backward-compatible alias for existing consumers
export type Order = OrderDto;

export interface GetOrdersParams {
  restaurantId?: string;
  pageIndex?: number;
  pageSize?: number;
  status?: BackendOrderStatus;
  orderType?: string;
  tableId?: string;
  customerId?: string;
}

export interface GetOrdersResponse {
  orders: PaginatedResult<OrderDto>;
}

export interface GetOrderByIdResponse {
  order: OrderDto;
}

export interface GetOrderActivitiesParams {
  orderId: string;
  type?: string;
  from?: string;
  to?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface GetOrderActivitiesResponse {
  activities: PaginatedResult<OrderActivityDto>;
}

export interface CreateOrderRequest {
  order: OrderDto;
}

export interface CreateOrderResponse {
  id: string;
}

export interface CancelOrderRequest {
  id: string;
  reason: string;
}

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    getOrders: build.query<GetOrdersResponse, GetOrdersParams | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.pageIndex !== undefined) qs.set("pageIndex", String(params.pageIndex));
        if (params?.pageSize !== undefined) qs.set("pageSize", String(params.pageSize));
        if (params?.status) qs.set("status", params.status);
        if (params?.orderType) qs.set("orderType", params.orderType);
        if (params?.tableId) qs.set("tableId", params.tableId);
        if (params?.customerId) qs.set("customerId", params.customerId);
        const queryStr = qs.toString();
        return `${env.apiBaseUrl}/ordering-api/v1/orders${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: (result, _e, params) => {
        const restaurantId = params?.restaurantId;
        const items = result?.orders.data ?? [];
        return [
          ...items.map(({ id }) => ({ type: "Orders" as const, id })),
          { type: "Orders" as const, id: restaurantId ? `LIST-${restaurantId}` : "LIST" },
        ];
      },
    }),

    getOrder: build.query<OrderDto, string>({
      query: (id) => `${env.apiBaseUrl}/ordering-api/v1/orders/${encodeURIComponent(id)}`,
      transformResponse: (response: GetOrderByIdResponse) => response.order,
      providesTags: (_r, _e, id) => [{ type: "Orders", id }],
    }),

    getOrderActivities: build.query<PaginatedResult<OrderActivityDto>, GetOrderActivitiesParams>({
      query: ({ orderId, ...rest }) => {
        const qs = new URLSearchParams();
        if (rest.type) qs.set("type", rest.type);
        if (rest.from) qs.set("from", rest.from);
        if (rest.to) qs.set("to", rest.to);
        if (rest.pageIndex !== undefined) qs.set("pageIndex", String(rest.pageIndex));
        if (rest.pageSize !== undefined) qs.set("pageSize", String(rest.pageSize));
        const queryStr = qs.toString();
        return `${env.apiBaseUrl}/ordering-api/v1/orders/${encodeURIComponent(orderId)}/activities${
          queryStr ? `?${queryStr}` : ""
        }`;
      },
      transformResponse: (response: GetOrderActivitiesResponse) => response.activities,
      providesTags: (_r, _e, { orderId }) => [{ type: "Orders", id: `ACTIVITIES-${orderId}` }],
    }),

    createOrder: build.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/ordering-api/v1/orders`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _e, { order }) => [
        { type: "Orders", id: `LIST-${order.restaurantId}` },
        { type: "Orders", id: "LIST" },
      ],
    }),

    cancelOrder: build.mutation<void, CancelOrderRequest>({
      query: ({ id, reason }) => ({
        url: `${env.apiBaseUrl}/ordering-api/v1/orders/${encodeURIComponent(id)}/cancel`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: `ACTIVITIES-${id}` },
      ],
    }),

    confirmOrder: build.mutation<void, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/ordering-api/v1/orders/${encodeURIComponent(id)}/confirm`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Orders", id },
        { type: "Orders", id: `ACTIVITIES-${id}` },
      ],
    }),

    startOrderPrep: build.mutation<void, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/ordering-api/v1/orders/${encodeURIComponent(id)}/start-prep`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Orders", id },
        { type: "Orders", id: `ACTIVITIES-${id}` },
      ],
    }),

    markOrderReady: build.mutation<void, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/ordering-api/v1/orders/${encodeURIComponent(id)}/mark-ready`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Orders", id },
        { type: "Orders", id: `ACTIVITIES-${id}` },
      ],
    }),

    markOrderDelivered: build.mutation<void, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/ordering-api/v1/orders/${encodeURIComponent(id)}/mark-delivered`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Orders", id },
        { type: "Orders", id: `ACTIVITIES-${id}` },
      ],
    }),

    startItemPrep: build.mutation<void, { orderId: string; itemId: string }>({
      query: ({ orderId, itemId }) => ({
        url: `${env.apiBaseUrl}/ordering-api/v1/orders/${encodeURIComponent(
          orderId,
        )}/items/${encodeURIComponent(itemId)}/start-prep`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: `ACTIVITIES-${orderId}` },
      ],
    }),

    markItemReady: build.mutation<void, { orderId: string; itemId: string }>({
      query: ({ orderId, itemId }) => ({
        url: `${env.apiBaseUrl}/ordering-api/v1/orders/${encodeURIComponent(
          orderId,
        )}/items/${encodeURIComponent(itemId)}/mark-ready`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: `ACTIVITIES-${orderId}` },
      ],
    }),
  }),
  tagTypes: ["Orders"],
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetOrderActivitiesQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useConfirmOrderMutation,
  useStartOrderPrepMutation,
  useMarkOrderReadyMutation,
  useMarkOrderDeliveredMutation,
  useStartItemPrepMutation,
  useMarkItemReadyMutation,
} = ordersApi;
