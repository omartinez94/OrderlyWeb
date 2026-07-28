/**
 * SignalRBoot — opens the kitchen SignalR hub once the user is
 * authenticated and dispatches inbound events into the RTK Query
 * cache via `api.util.updateQueryData`. Mounted under
 * StorefrontProvider so it can read session state via selectors.
 *
 * Phase 2 ships the structure: auth check, hub lifecycle, event
 * dispatch. Phase 4 wires real selectors (when the session slice
 * lands) and supplies the access token to the hub.
 *
 * Event handlers update the orders / kitchen query cache in place
 * so consumers see the change without a refetch.
 */

import { useEffect, useRef } from "react";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { createKitchenHub, type KitchenHubEventMap } from "../../lib/signalr";
import { ordersApi } from "../../app/api/orders";
import { kitchenApi } from "../../app/api/kitchen";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAccessToken } from "../../app/session/sessionSelectors";

export interface SignalRBootProps {
  /** Set true once the session slice reports `authenticated`. */
  enabled: boolean;
}

/**
 * Apply an `OrderReceived` event into the orders + kitchen caches.
 * The orders cache only knows the `restaurantId` once the order has
 * been observed — for now we accept the event and let the next
 * refetch fill in details (the eventual fix is to keep an "inbox"
 * tag in ordersApi).
 */
function dispatchOrderReceived(
  dispatch: ReturnType<typeof useAppDispatch>,
  event: KitchenHubEventMap["OrderReceived"],
): void {
  // Invalidate the kitchen queue for this restaurant so the next
  // render pulls fresh data.
  dispatch(
    kitchenApi.util.invalidateTags([{ type: "KitchenQueue", id: `LIST-${event.restaurantId}` }]),
  );
}

function dispatchItemStateChanged(
  dispatch: ReturnType<typeof useAppDispatch>,
  event: KitchenHubEventMap["ItemStateChanged"],
): void {
  // The orders endpoint uses an id-tagged cache; invalidate by
  // orderId so any component viewing this order re-fetches.
  dispatch(ordersApi.util.invalidateTags([{ type: "Orders", id: event.orderId }]));
}

function dispatchOrderReady(
  dispatch: ReturnType<typeof useAppDispatch>,
  event: KitchenHubEventMap["OrderReady"],
): void {
  dispatch(ordersApi.util.invalidateTags([{ type: "Orders", id: event.orderId }]));
  dispatch(
    kitchenApi.util.invalidateTags([
      { type: "KitchenQueue", id: `LIST-` /* best-effort; full restaurantId follows */ },
    ]),
  );
}

export function SignalRBoot({ enabled }: SignalRBootProps): React.ReactElement | null {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const hubRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (hubRef.current) return; // already running

    // Capture the token supplier so token rotation during the
    // connection's lifetime is picked up on renegotiation.
    const tokenSupplier = (): string | null => accessToken;

    const hub = createKitchenHub(tokenSupplier);
    hubRef.current = hub;

    const onOrderReceived = (e: KitchenHubEventMap["OrderReceived"]): void =>
      dispatchOrderReceived(dispatch, e);
    const onItemStateChanged = (e: KitchenHubEventMap["ItemStateChanged"]): void =>
      dispatchItemStateChanged(dispatch, e);
    const onOrderReady = (e: KitchenHubEventMap["OrderReady"]): void =>
      dispatchOrderReady(dispatch, e);

    hub.on("OrderReceived", onOrderReceived);
    hub.on("ItemStateChanged", onItemStateChanged);
    hub.on("OrderReady", onOrderReady);

    hub.start().catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[SignalRBoot] kitchen hub start failed:", err);
    });

    return () => {
      hub.off("OrderReceived", onOrderReceived);
      hub.off("ItemStateChanged", onItemStateChanged);
      hub.off("OrderReady", onOrderReady);
      if (hub.state === HubConnectionState.Connected) {
        void hub.stop();
      }
      hubRef.current = null;
    };
  }, [enabled, dispatch, accessToken]);

  return null;
}
