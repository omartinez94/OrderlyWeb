import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import type { PropsWithChildren } from "react";
import { store } from "../../../app/store";
import { resetMockCatalogState } from "../../../test/handlers/catalog";
import { useReservations } from "./useReservations";

function wrapper({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}

describe("useReservations", () => {
  beforeEach(() => {
    resetMockCatalogState();
  });

  it("loads reservations, calculates status counts, and provides available tables", async () => {
    const { result } = renderHook(() => useReservations({ restaurantId: "r-001" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.reservations.length).toBeGreaterThan(0);
    });

    expect(result.current.totalCount).toBe(2);
    expect(result.current.confirmedCount).toBe(1);
    expect(result.current.pendingCount).toBe(1);
    expect(result.current.availableTables.length).toBeGreaterThan(0);
  });

  it("checks in a pending reservation", async () => {
    const { result } = renderHook(() => useReservations({ restaurantId: "r-001" }), { wrapper });

    await waitFor(() => {
      expect(result.current.reservations.length).toBeGreaterThan(0);
    });

    const pending = result.current.reservations.find((r) => r.status === "pending")!;
    expect(pending).toBeDefined();

    await act(async () => {
      await result.current.checkInReservation(pending, "t-1", "T1");
    });

    await waitFor(() => {
      const updated = result.current.allReservations.find((r) => r.id === pending.id);
      expect(updated?.status).toBe("confirmed");
      expect(updated?.tableNumber).toBe("T1");
    });
  });

  it("seats a confirmed reservation", async () => {
    const { result } = renderHook(() => useReservations({ restaurantId: "r-001" }), { wrapper });

    await waitFor(() => {
      expect(result.current.reservations.length).toBeGreaterThan(0);
    });

    const confirmed = result.current.reservations.find((r) => r.status === "confirmed")!;
    expect(confirmed).toBeDefined();

    await act(async () => {
      await result.current.seatReservation(confirmed);
    });

    await waitFor(() => {
      const updated = result.current.allReservations.find((r) => r.id === confirmed.id);
      expect(updated?.status).toBe("seated");
    });
  });
});
