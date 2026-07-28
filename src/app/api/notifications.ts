/**
 * notificationsApi — inbox list + mark-as-read.
 *
 * Live push delivery is NOT wired here — the Notification Service
 * hub is part of the Notifications feature plan, not the foundation.
 * The REST surface below covers the inbox surface only.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  /** Optional deep-link target — Phase 4 wires this to the order detail. */
  link?: string;
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    getNotifications: build.query<AppNotification[], { unreadOnly?: boolean }>({
      query: ({ unreadOnly = false } = {}) => {
        const qs = unreadOnly ? "?unreadOnly=true" : "";
        return `${env.apiBaseUrl}/notification-api/notifications${qs}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Notifications" as const, id })),
              { type: "Notifications" as const, id: "LIST" },
            ]
          : [{ type: "Notifications" as const, id: "LIST" }],
    }),
    markRead: build.mutation<AppNotification, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/notification-api/notifications/${encodeURIComponent(id)}/read`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Notifications", id }],
    }),
    markAllRead: build.mutation<void, void>({
      query: () => ({
        url: `${env.apiBaseUrl}/notification-api/notifications/read-all`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),
  }),
  tagTypes: ["Notifications"],
});

export const { useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } =
  notificationsApi;
