import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import {
  getServerTime,
  getServerClockOffset,
  isClockSynced,
  setServerClockOffset,
  syncWithHttpDate,
  resetClockSync,
} from "./clock";

describe("clock synchronization utility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T12:00:00.000Z"));
    resetClockSync();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to 0 offset and not synced", () => {
    expect(getServerClockOffset()).toBe(0);
    expect(isClockSynced()).toBe(false);
  });

  it("sets direct offset and marks synced", () => {
    setServerClockOffset(5000);
    expect(getServerClockOffset()).toBe(5000);
    expect(isClockSynced()).toBe(true);
    expect(getServerTime()).toBe(Date.now() + 5000);
  });

  it("syncs from valid HTTP Date header and accounts for round-trip latency", () => {
    const localNow = Date.now();
    // Server is 10 seconds ahead
    const serverHeaderDate = new Date(localNow + 10_000).toUTCString();

    // 200ms round trip duration -> 100ms one-way latency
    syncWithHttpDate(serverHeaderDate, 200);

    expect(isClockSynced()).toBe(true);
    // Offset should be 10,100ms (10,000ms server ahead + 100ms transit compensation)
    expect(getServerClockOffset()).toBe(10_100);
  });

  it("ignores invalid or missing Date headers", () => {
    syncWithHttpDate(null);
    expect(isClockSynced()).toBe(false);

    syncWithHttpDate("not a real date string");
    expect(isClockSynced()).toBe(false);
  });

  it("smoothes multiple samples using moving average", () => {
    const localNow = Date.now();
    const serverHeaderDate = new Date(localNow + 10_000).toUTCString();
    syncWithHttpDate(serverHeaderDate, 0);

    expect(getServerClockOffset()).toBe(10_000);

    // Second sample with variance (+12_000ms)
    // Moving average: 10_000 * 0.7 + 12_000 * 0.3 = 7000 + 3600 = 10_600
    const secondDate = new Date(localNow + 12_000).toUTCString();
    syncWithHttpDate(secondDate, 0);

    expect(getServerClockOffset()).toBe(10_600);
  });
});
