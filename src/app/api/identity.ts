/**
 * identityApi — auth + staff endpoints, fronted through YARP at
 * `${VITE_API_BASE_URL}/identity-api`.
 *
 * Endpoints:
 *   - login        POST   /auth/login          {email, password}
 *   - refresh      POST   /auth/refresh         (httpOnly cookie)
 *   - logout       POST   /auth/logout
 *   - currentUser  GET    /users/me
 *   - userRestaurants GET /users/me/restaurants (Phase 3: distinct
 *                     from catalog.getRestaurants — this is the
 *                     user-scoped list of restaurants the caller
 *                     has access to, not the global catalog)
 *   - listStaff    GET    /staff?restaurantId=
 *   - getStaff     GET    /staff/:id
 *   - createStaff  POST   /staff
 *   - updateStaff  PUT    /staff/:id
 *   - deactivateStaff POST /staff/:id/deactivate
 *
 * Phase 3 wires `login` / `refresh` to dispatch `setCredentials` on
 * the session slice via `onQueryStarted`.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";
import { setCredentials, clearCredentials } from "../session/sessionSlice";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: number;
  user: { id: string; name: string; email: string; initials: string };
  roles: readonly import("../../types/auth").Role[];
  permissions: readonly import("../../types/auth").Permission[];
}

export interface RestaurantSummary {
  id: string;
  name: string;
  role: "Owner" | "Manager" | "Staff";
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  roles: readonly import("../../types/auth").Role[];
  restaurantIds: readonly string[];
  active: boolean;
}

export const identityApi = createApi({
  reducerPath: "identityApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/identity-api/auth/login`,
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // Login failed — leave session state untouched. The
          // mutation's `error` field surfaces the message to the
          // form.
        }
      },
    }),
    refresh: build.mutation<AuthResponse, void>({
      query: () => ({
        url: `${env.apiBaseUrl}/identity-api/auth/refresh`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // Refresh failed — session is dead. The apiClient's 401
          // interceptor dispatches clearCredentials on terminal
          // failure.
          dispatch(clearCredentials());
        }
      },
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: `${env.apiBaseUrl}/identity-api/auth/logout`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(clearCredentials());
      },
    }),
    currentUser: build.query<AuthResponse["user"], void>({
      query: () => `${env.apiBaseUrl}/identity-api/users/me`,
    }),
    userRestaurants: build.query<RestaurantSummary[], void>({
      query: () => `${env.apiBaseUrl}/identity-api/users/me/restaurants`,
      providesTags: ["Restaurants"],
    }),
    listStaff: build.query<StaffMember[], { restaurantId: string }>({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/identity-api/staff?restaurantId=${encodeURIComponent(restaurantId)}`,
      providesTags: (result, _err, { restaurantId }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Staff" as const, id })),
              { type: "Staff" as const, id: `LIST-${restaurantId}` },
            ]
          : [{ type: "Staff" as const, id: `LIST-${restaurantId}` }],
    }),
    getStaff: build.query<StaffMember, string>({
      query: (id) => `${env.apiBaseUrl}/identity-api/staff/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Staff", id }],
    }),
    createStaff: build.mutation<StaffMember, Omit<StaffMember, "id" | "active">>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/identity-api/staff`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { restaurantIds }) =>
        restaurantIds.map((rid) => ({ type: "Staff" as const, id: `LIST-${rid}` })),
    }),
    updateStaff: build.mutation<StaffMember, Partial<StaffMember> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `${env.apiBaseUrl}/identity-api/staff/${encodeURIComponent(id)}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Staff", id }],
    }),
    deactivateStaff: build.mutation<StaffMember, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/identity-api/staff/${encodeURIComponent(id)}/deactivate`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Staff", id }],
    }),
  }),
  tagTypes: ["Staff", "Restaurants"],
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useCurrentUserQuery,
  useUserRestaurantsQuery,
  useListStaffQuery,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeactivateStaffMutation,
} = identityApi;
