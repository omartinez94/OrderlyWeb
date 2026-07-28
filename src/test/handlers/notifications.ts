/**
 * MSW handlers for the Notification Service (REST inbox).
 *
 * Live push is not wired here — SignalR hub comes with the
 * notifications feature plan, not the foundation.
 */

import { http, HttpResponse } from "msw";

const BASE = "http://localhost:6004/notification-api";

export const notificationHandlers = [
  http.get(`${BASE}/notifications`, () =>
    HttpResponse.json([
      {
        id: "n-1",
        title: "Test notification",
        body: "Hello from MSW",
        timestamp: "2026-07-28T10:00:00Z",
        read: false,
      },
    ]),
  ),
  http.post(`${BASE}/notifications/:id/read`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${BASE}/notifications/read-all`, () => new HttpResponse(null, { status: 204 })),
];
