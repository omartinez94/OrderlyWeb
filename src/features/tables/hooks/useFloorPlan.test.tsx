import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import type { PropsWithChildren } from "react";
import { store } from "../../../app/store";
import { resetMockCatalogState } from "../../../test/handlers/catalog";
import { useFloorPlan } from "./useFloorPlan";

function wrapper({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}

describe("useFloorPlan", () => {
  beforeEach(() => {
    resetMockCatalogState();
  });

  it("loads tables, calculates status counts and merged clusters", async () => {
    const { result } = renderHook(() => useFloorPlan({ restaurantId: "r-001" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.tables.length).toBe(6);
    });

    expect(result.current.counts.Available).toBe(3);
    expect(result.current.counts.Occupied).toBe(1);
    expect(result.current.counts.Reserved).toBe(1);
    expect(result.current.counts["Needs Cleaning"]).toBe(1);
    expect(result.current.activeMergedClusters.length).toBe(1);
    expect(result.current.activeMergedClusters[0].combinedCapacity).toBe(4);
  });

  it("filters tables by section and status", async () => {
    const { result } = renderHook(() => useFloorPlan({ restaurantId: "r-001" }), { wrapper });

    await waitFor(() => {
      expect(result.current.tables.length).toBe(6);
    });

    act(() => {
      result.current.setSelectedSection("Window");
    });
    expect(result.current.filteredTables.length).toBe(2);

    act(() => {
      result.current.setSelectedSection("all");
      result.current.setSelectedStatus("Occupied");
    });
    expect(result.current.filteredTables.length).toBe(1);
    expect(result.current.filteredTables[0].tableNumber).toBe("T2");
  });

  it("marks table as cleaned", async () => {
    const { result } = renderHook(() => useFloorPlan({ restaurantId: "r-001" }), { wrapper });

    await waitFor(() => {
      expect(result.current.tables.length).toBe(6);
    });

    await act(async () => {
      await result.current.markCleaned("t-4");
    });

    await waitFor(() => {
      const t4 = result.current.tables.find((t) => t.id === "t-4");
      expect(t4?.status).toBe("Available");
    });
  });
});
