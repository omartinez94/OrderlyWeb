/**
 * BroadcastChannel message protocol for KDS inter-window bump bar communication.
 *
 * Decoupled, zero-latency Web API protocol allowing the standalone virtual popup
 * (`/site/kitchen/virtual-bumpbar`) to dispatch actions to the main KDS dashboard.
 */

import {
  type BumpBarAction,
  type BumpBarChannelMessage,
  BumpBarChannelMessageSchema,
  BUMP_ACTION_MESSAGE_TYPE,
} from "./types";

export const BUMP_BAR_CHANNEL_NAME = "orderly-kds-bumpbar";

let senderChannel: BroadcastChannel | null = null;

function getSenderChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!senderChannel) {
    senderChannel = new BroadcastChannel(BUMP_BAR_CHANNEL_NAME);
  }
  return senderChannel;
}

export function closeSenderChannel(): void {
  if (senderChannel) {
    try {
      senderChannel.close();
    } catch {
      // Ignore if already closed
    }
    senderChannel = null;
  }
}

/**
 * Publishes a typed BumpBarAction across the BroadcastChannel.
 */
export function publishBumpAction(
  action: BumpBarAction,
  source: "virtual-popup" | "hardware-bridge" = "virtual-popup",
): void {
  const channel = getSenderChannel();
  if (!channel) return;

  const rawMessage = {
    type: BUMP_ACTION_MESSAGE_TYPE,
    action,
    source,
    timestamp: Date.now(),
  };

  const parsed = BumpBarChannelMessageSchema.safeParse(rawMessage);
  if (!parsed.success) {
    console.error("Failed to serialize BumpBarChannelMessage:", parsed.error);
    return;
  }

  channel.postMessage(parsed.data);
}

/**
 * Subscribes to incoming BroadcastChannel bump bar actions.
 * Returns an unsubscription teardown function.
 */
export function subscribeBumpAction(
  onAction: (action: BumpBarAction, message: BumpBarChannelMessage) => void,
): () => void {
  if (typeof BroadcastChannel === "undefined") {
    return () => {};
  }

  const channel = new BroadcastChannel(BUMP_BAR_CHANNEL_NAME);

  channel.onmessage = (event: MessageEvent<unknown>) => {
    const parsed = BumpBarChannelMessageSchema.safeParse(event.data);
    if (parsed.success && parsed.data.type === BUMP_ACTION_MESSAGE_TYPE) {
      onAction(parsed.data.action, parsed.data);
    }
  };

  return () => {
    channel.close();
  };
}
