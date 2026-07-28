/**
 * Combined MSW handlers — one array per service. Mounted by the
 * shared `setupServer` instance in `src/test/server.ts`.
 */

import { identityHandlers } from "./identity";
import { catalogHandlers } from "./catalog";
import { orderHandlers } from "./orders";
import { notificationHandlers } from "./notifications";

export const handlers = [
  ...identityHandlers,
  ...catalogHandlers,
  ...orderHandlers,
  ...notificationHandlers,
];
