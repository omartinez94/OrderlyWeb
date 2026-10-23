import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useElapsedTimer } from "./useElapsedTimer";
import { setServerClockOffset, resetClockSync } from "../utils/clock";

describe("useElapsedTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetClockSync();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 00:00 when startTime is empty or invalid", () => {
    const { result } = renderHook(() => useElapsedTimer(null));
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.formatted).toBe("00:00");
  });

  it("computes elapsed time based on local clock when no offset is set", () => {
    const baseTime = Date.now();
    const startTime = new Date(baseTime - 90_000).toISOString(); // 90 seconds ago

    const { result } = renderHook(() => useElapsedTimer(startTime));

    expect(result.current.elapsedSeconds).toBe(90);
    expect(result.current.formatted).toBe("01:30");

    // Advance 10 seconds
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.elapsedSeconds).toBe(100);
    expect(result.current.formatted).toBe("01:40");
  });

  it("applies server clock offset correctly to eliminate skew", () => {
    const baseTime = Date.now();
    // Server is 60 seconds ahead of client
    setServerClockOffset(60_000);

    // Order created at baseTime according to server
    const serverOrderReceivedAt = new Date(baseTime).toISOString();

    const { result } = renderHook(() => useElapsedTimer(serverOrderReceivedAt));

    // Client's clock is 60 seconds behind server, but with offset, elapsed time is accurately 60 seconds
    expect(result.current.elapsedSeconds).toBe(60);
    expect(result.current.formatted).toBe("01:00");
  });
});
