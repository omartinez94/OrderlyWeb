/**
 * catalogApi — restaurants, tables, menu.
 *
 * Note on `getRestaurants` vs `identityApi.userRestaurants`:
 *   - `getRestaurants` is the *global* catalog (admin-level view
 *     of every restaurant in the Orderly tenant). Only SuperAdmin
 *     / RestaurantAdmin can call it; the gateway enforces the
 *     authorization claim.
 *   - `identityApi.userRestaurants` is the *user-scoped* list — the
 *     subset of restaurants the *current* caller can access. This
 *     powers the Header restaurant switcher.
 *
 * Both lists come from different upstream endpoints; the cache tags
 * differ so invalidation is precise.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";

export interface CatalogRestaurant {
  id: string;
  name: string;
  cuisine: string;
  city: string;
  country: string;
  active: boolean;
}

export interface Table {
  id: string;
  restaurantId: string;
  label: string;
  capacity: number;
  section: string;
}

export type MenuItemStatus = "available" | "sold_out" | "hidden";

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  priceCents: number;
  status: MenuItemStatus;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  position: number;
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
    getTables: build.query<Table[], { restaurantId: string }>({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/catalog-api/restaurants/${encodeURIComponent(restaurantId)}/tables`,
      providesTags: (_r, _e, { restaurantId }) => [{ type: "Tables", id: `LIST-${restaurantId}` }],
    }),
    getMenu: build.query<
      { categories: MenuCategory[]; items: MenuItem[] },
      { restaurantId: string }
    >({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/catalog-api/restaurants/${encodeURIComponent(restaurantId)}/menu`,
      providesTags: (_r, _e, { restaurantId }) => [{ type: "Menu", id: `MENU-${restaurantId}` }],
    }),
  }),
  tagTypes: ["Restaurants", "Tables", "Menu"],
});

export const { useGetRestaurantsQuery, useGetRestaurantQuery, useGetTablesQuery, useGetMenuQuery } =
  catalogApi;
