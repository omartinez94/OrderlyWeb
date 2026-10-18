import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import type { PropsWithChildren } from "react";
import { store } from "../../../app/store";
import { resetMockCatalogState } from "../../../test/handlers/catalog";
import { useWaitlist } from "./useWaitlist";

function wrapper({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}

describe("useWaitlist", () => {
  beforeEach(() => {
    resetMockCatalogState();
  });

  it("loads queue parties and computes status metrics", async () => {
    const { result } = renderHook(() => useWaitlist({ restaurantId: "r-001" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.queue.length).toBeGreaterThan(0);
    });

    expect(result.current.waitingCount).toBe(1);
    expect(result.current.notifiedCount).toBe(1);
    expect(result.current.availableTables.length).toBeGreaterThan(0);
  });

  it("notifies a waiting party", async () => {
    const { result } = renderHook(() => useWaitlist({ restaurantId: "r-001" }), { wrapper });

    await waitFor(() => {
      expect(result.current.queue.length).toBeGreaterThan(0);
    });

    const waitingParty = result.current.queue.find((p) => p.status === "waiting")!;
    expect(waitingParty).toBeDefined();

    await act(async () => {
      await result.current.notifyParty(waitingParty);
    });

    await waitFor(() => {
      const updated = result.current.queue.find((p) => p.id === waitingParty.id);
      expect(updated?.status).toBe("notified");
    });
  });

  it("seats a party at an available table and marks table occupied", async () => {
    const { result } = renderHook(() => useWaitlist({ restaurantId: "r-001" }), { wrapper });

    await waitFor(() => {
      expect(result.current.queue.length).toBeGreaterThan(0);
      expect(result.current.availableTables.length).toBeGreaterThan(0);
    });

    const party = result.current.queue[0];
    const table = result.current.availableTables[0];

    await act(async () => {
      await result.current.seatParty(party, table);
    });

    await waitFor(() => {
      const updatedParty = result.current.queue.find((p) => p.id === party.id);
      expect(updatedParty?.status).toBe("seated");
    });
  });
});
