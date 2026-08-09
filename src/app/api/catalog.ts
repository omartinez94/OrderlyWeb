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

export type CuisineType = "Italian" | "Mexican" | "Japanese" | "American" | "Other";

export interface CatalogBrand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  contactEmail: string;
  contactPhone: string | null;
  cuisineType: CuisineType;
  websiteUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RestaurantStatus = "active" | "inactive" | "archived";

export interface OperatingHoursDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string | null;
  close: string | null;
}

export interface AdminRestaurantAddress {
  line1: string;
  line2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface AdminRestaurantDetail extends CatalogRestaurant {
  brandId: string;
  ownerId: string | null;
  address: AdminRestaurantAddress;
  phone: string | null;
  email: string | null;
  timezone: string;
  currency: string;
  taxRate: number;
  operatingHours: OperatingHoursDay[];
  estimatedTurnoverMinutes: number;
  autoConfirmReservations: boolean;
  autoConfirmOrders: boolean;
  allowAutoSubstitute: boolean;
  status: RestaurantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  defaultTimezone: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  reservationReminderMinutes: number;
  maxReservationPartySize: number;
  enableAutoSubstitute: boolean;
  emailFromAddress: string;
  supportContactUrl: string;
  featureFlags: Record<string, boolean>;
}

export type AuditEntityType = "brand" | "restaurant" | "staff";

export interface AdminAuditEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  actorId: string;
  actorName: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: string;
  reason?: string;
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
  tagTypes: ["Restaurants", "Tables", "Menu", "Brands", "AdminSettings", "Audit"],
});

export const { useGetRestaurantsQuery, useGetRestaurantQuery, useGetTablesQuery, useGetMenuQuery } =
  catalogApi;
