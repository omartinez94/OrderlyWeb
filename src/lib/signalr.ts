/**
 * signalr — the shared SignalR client factory.
 *
 * Phase 2 only exposes `createKitchenHub()`. Future hubs (orders,
 * notifications) get their own factories once those features land.
 *
 * Connection URL:
 *   `${env.signalrUrl}/hubs/kitchen`
 *
 * `env.signalrUrl` already carries the upstream `/kitchen-api`
 * prefix; the factory appends only `/hubs/kitchen` (no
 * double-prefix). Example: `http://localhost:6004/kitchen-api/hubs/kitchen`.
 *
 * Auto-reconnect policy (per AGENTS.md §Backend integration):
 *   1s, 2s, 5s, 10s, 30s — then stop. After the sixth failure the
 *   user sees a "Connection lost" surface and a manual reconnect
 *   button.
 *
 * Hub events (typed in `KitchenHubEvent`):
 *   - OrderReceived     — a new order was placed
 *   - ItemStateChanged  — one line item moved to a new status
 *   - OrderReady        — the whole order is ready to serve
 *
 * Usage:
 *   const hub = createKitchenHub();
 *   hub.on("OrderReceived", (order) => dispatch(kitchenReceived(order)));
 *   await hub.start();
 *
 *   // ...later...
 *   await hub.stop();
 */

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type IHttpConnectionOptions,
} from "@microsoft/signalr";
import { env } from "./env";

/**
 * OrderReceived — a new order just arrived from the floor.
 */
export interface OrderReceivedEvent {
  orderId: string;
  restaurantId: string;
  tableLabel: string;
  receivedAt: string;
}

/**
 * ItemStateChanged — one item within an order moved status.
 */
export interface ItemStateChangedEvent {
  orderId: string;
  itemId: string;
  nextStatus: import("../types/order").OrderStatus;
}

/**
 * OrderReady — the entire order has reached the `ready` terminal.
 */
export interface OrderReadyEvent {
  orderId: string;
  readyAt: string;
}

/**
 * The full map of hub event names to their payloads. Keep this in
 * sync with the server's Hub Protocol definition.
 */
export interface KitchenHubEventMap {
  OrderReceived: OrderReceivedEvent;
  ItemStateChanged: ItemStateChangedEvent;
  OrderReady: OrderReadyEvent;
}

export type KitchenHubEventName = keyof KitchenHubEventMap;

/**
 * Auto-reconnect delays in milliseconds. The server's Hub Protocol
 * negotiates these, but the client also retries on transport errors.
 */
const RECONNECT_DELAYS_MS: ReadonlyArray<number> = [1000, 2000, 5000, 10000, 30000];

function buildHttpOptions(): IHttpConnectionOptions {
  return {
    // Phase 4 supplies an accessTokenFactory here. Until then, the
    // hub runs anonymously (the gateway-side policy decides what
    // events an anonymous client may see).
    logger: import.meta.env.DEV
      ? new (class {
          // Minimal console-backed ILogger so we don't pull in
          // @microsoft/signalr's full logger surface.
          log(level: LogLevel, message: string): void {
            if (level >= LogLevel.Warning) {
              // eslint-disable-next-line no-console
              console.warn(`[signalr] ${message}`);
            }
          }
        })()
      : undefined,
  };
}

/**
 * createKitchenHub — factory that returns a configured HubConnection.
 * The connection is *not* started; consumers call `.start()` when
 * ready (typically after authentication).
 */
export function createKitchenHub(): HubConnection {
  const url = `${env.signalrUrl}/hubs/kitchen`;
  return new HubConnectionBuilder()
    .withUrl(url, buildHttpOptions())
    .withAutomaticReconnect([...RECONNECT_DELAYS_MS])
    .build();
}

/**
 * isConnected — small helper for callers that need to gate UI on the
 * hub state without poking at SignalR internals.
 */
export function isConnected(hub: HubConnection): boolean {
  return hub.state === HubConnectionState.Connected;
}
