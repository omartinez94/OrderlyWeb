import { useEffect, useState } from "react";
import { getServerTime } from "../utils/clock";

/**
 * useElapsedTimer — High-resolution timer hook computing elapsed seconds
 * from an ISO timestamp or Unix epoch, synchronized with the server's clock.
 *
 * Consumed across:
 *   - Phase 2 (KDS ticket cards elapsed counter)
 *   - Phase 3 (Waitlist and floor table elapsed timers)
 *
 * Updates on a 1-second cadence, automatically cleans up on unmount,
 * and handles invalid or missing timestamps gracefully.
 */
export function useElapsedTimer(startTime: string | number | null | undefined): {
  elapsedSeconds: number;
  formatted: string;
} {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!startTime) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = typeof startTime === "number" ? startTime : new Date(startTime).getTime();
    if (Number.isNaN(startMs)) {
      setElapsedSeconds(0);
      return;
    }

    const update = () => {
      const now = getServerTime();
      const diff = Math.max(0, Math.floor((now - startMs) / 1000));
      setElapsedSeconds(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return { elapsedSeconds, formatted };
}
