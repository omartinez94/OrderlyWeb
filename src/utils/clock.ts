/**
 * Clock offset synchronization utility.
 *
 * Keeps browser/client timers strictly aligned with the server's clock,
 * preventing skewed machine clocks from causing false urgency or 00:00 clamp.
 */

let serverClockOffsetMs = 0;
let hasSynced = false;

/**
 * Returns the estimated current server time in epoch milliseconds.
 */
export function getServerTime(): number {
  return Date.now() + serverClockOffsetMs;
}

/**
 * Returns the current calculated clock offset (serverTime - localTime).
 */
export function getServerClockOffset(): number {
  return serverClockOffsetMs;
}

/**
 * Whether at least one synchronization sample has been applied.
 */
export function isClockSynced(): boolean {
  return hasSynced;
}

/**
 * Sets the clock offset directly (in milliseconds).
 */
export function setServerClockOffset(offsetMs: number): void {
  if (Number.isFinite(offsetMs)) {
    serverClockOffsetMs = Math.round(offsetMs);
    hasSynced = true;
  }
}

/**
 * Synchronizes client clock using an HTTP Date header value.
 *
 * @param dateHeader - String value from response.headers.get("date")
 * @param requestDurationMs - Optional total request round-trip time in milliseconds
 */
export function syncWithHttpDate(
  dateHeader: string | null | undefined,
  requestDurationMs = 0,
): void {
  if (!dateHeader) return;
  const serverMs = new Date(dateHeader).getTime();
  if (Number.isNaN(serverMs)) return;

  const now = Date.now();
  // Account for estimated one-way transit time (half round-trip)
  const estimatedServerNow = serverMs + Math.max(0, requestDurationMs / 2);
  const calculatedOffset = estimatedServerNow - now;

  // Exponential moving average if already synced, or immediate set if first sample
  if (!hasSynced) {
    serverClockOffsetMs = Math.round(calculatedOffset);
    hasSynced = true;
  } else {
    // Smooth out jitter from network latency
    serverClockOffsetMs = Math.round(serverClockOffsetMs * 0.7 + calculatedOffset * 0.3);
  }
}

/**
 * Resets the clock offset state (useful for tests).
 */
export function resetClockSync(): void {
  serverClockOffsetMs = 0;
  hasSynced = false;
}
