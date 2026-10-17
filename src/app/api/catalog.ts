/**
 * catalogApi — restaurants, tables, merged tables, and menu.
 *
 * Aligned with .NET 10 Carter Minimal APIs at `/catalog-api/v1`.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";
import type {
  CatalogRestaurant,
  Table,
  MergedTableDto,
  MenuCategory,
  MenuItem,
  TableStatus,
} from "../../types/catalog";

export type * from "../../types/catalog";

export interface GetTablesParams {
  restaurantId: string;
  status?: TableStatus;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetTablesResponse {
  tables: Table[];
  totalCount: number;
}

export interface GetMergedTablesResponse {
  mergedTables: MergedTableDto[];
}

export interface MergeTablesRequest {
  restaurantId: string;
  parentTableId: string;
  childTableId: string;
}

export interface MergeTablesResponse {
  id: string;
}

export interface SplitTablesRequest {
  restaurantId: string;
  mergedTableId: string;
}

export interface UpdateMenuItemAvailabilityRequest {
  id: string;
  isAvailable: boolean;
}

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    getRestaurants: build.query<CatalogRestaurant[], void>({
      query: () => `${env.apiBaseUrl}/catalog-api/restaurants`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Restaurants" as const, id })),
              { type: "Restaurants" as const, id: "LIST" },
            ]
          : [{ type: "Restaurants" as const, id: "LIST" }],
    }),

    getRestaurant: build.query<CatalogRestaurant, string>({
      query: (id) => `${env.apiBaseUrl}/catalog-api/restaurants/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Restaurants", id }],
    }),

    getTables: build.query<Table[], GetTablesParams | { restaurantId: string }>({
      query: (params) => {
        const { restaurantId, ...rest } = params as GetTablesParams;
        const qs = new URLSearchParams();
        if (rest.status) qs.set("status", rest.status);
        if (rest.pageNumber !== undefined) qs.set("pageNumber", String(rest.pageNumber));
        if (rest.pageSize !== undefined) qs.set("pageSize", String(rest.pageSize));
        const queryStr = qs.toString();
        return `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/tables${queryStr ? `?${queryStr}` : ""}`;
      },
      transformResponse: (response: GetTablesResponse | Table[]) => {
        // Backend returns GetTablesResponse { tables: Table[], totalCount: number }, or raw array in mock
        if (Array.isArray(response)) return response;
        return response?.tables ?? [];
      },
      providesTags: (_r, _e, { restaurantId }) => [{ type: "Tables", id: `LIST-${restaurantId}` }],
    }),

    getMergedTables: build.query<MergedTableDto[], { restaurantId: string }>({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/merged-tables`,
      transformResponse: (response: GetMergedTablesResponse | MergedTableDto[]) => {
        if (Array.isArray(response)) return response;
        return response?.mergedTables ?? [];
      },
      providesTags: (_r, _e, { restaurantId }) => [
        { type: "MergedTables", id: `LIST-${restaurantId}` },
      ],
    }),

    mergeTables: build.mutation<MergeTablesResponse, MergeTablesRequest>({
      query: ({ restaurantId, parentTableId, childTableId }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/merged-tables`,
        method: "POST",
        body: { parentTableId, childTableId },
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Tables", id: `LIST-${restaurantId}` },
        { type: "MergedTables", id: `LIST-${restaurantId}` },
      ],
    }),

    splitTables: build.mutation<void, SplitTablesRequest>({
      query: ({ restaurantId, mergedTableId }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/merged-tables/${encodeURIComponent(mergedTableId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Tables", id: `LIST-${restaurantId}` },
        { type: "MergedTables", id: `LIST-${restaurantId}` },
      ],
    }),

    getMenu: build.query<
      { categories: MenuCategory[]; items: MenuItem[] },
      { restaurantId: string }
    >({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/catalog-api/restaurants/${encodeURIComponent(restaurantId)}/menu`,
      providesTags: (_r, _e, { restaurantId }) => [{ type: "Menu", id: `MENU-${restaurantId}` }],
    }),

    updateMenuItemAvailability: build.mutation<void, UpdateMenuItemAvailabilityRequest>({
      query: ({ id, isAvailable }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/menu-items/${encodeURIComponent(id)}`,
        method: "PUT",
        body: { isAvailable },
      }),
      invalidatesTags: [{ type: "Menu", id: "LIST" }],
    }),
  }),
  tagTypes: ["Restaurants", "Tables", "MergedTables", "Menu", "Brands", "AdminSettings", "Audit"],
});

export const {
  useGetRestaurantsQuery,
  useGetRestaurantQuery,
  useGetTablesQuery,
  useGetMergedTablesQuery,
  useMergeTablesMutation,
  useSplitTablesMutation,
  useGetMenuQuery,
  useUpdateMenuItemAvailabilityMutation,
} = catalogApi;
