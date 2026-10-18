import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import type { PropsWithChildren } from "react";
import { store } from "../../../app/store";
import { resetMockMenuItems } from "../../../test/handlers/catalog";
import { useMenuAvailability } from "./useMenuAvailability";

function wrapper({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}

describe("useMenuAvailability", () => {
  beforeEach(() => {
    resetMockMenuItems();
  });
  it("fetches categories, items, and computes accurate counts", async () => {
    const { result } = renderHook(() => useMenuAvailability({ restaurantId: "r-001" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.allItems.length).toBeGreaterThan(0);
    });

    expect(result.current.categories.length).toBe(3);
    expect(result.current.totalCount).toBe(4);
    expect(result.current.availableCount).toBe(3);
    expect(result.current.soldOutCount).toBe(1);
  });

  it("filters items by category and text search", async () => {
    const { result } = renderHook(() => useMenuAvailability({ restaurantId: "r-001" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.allItems.length).toBe(4);
    });

    act(() => {
      result.current.setSelectedCategoryId("c-pasta");
    });

    expect(result.current.filteredItems.length).toBe(1);
    expect(result.current.filteredItems[0].name).toBe("Rigatoni Carbonara");

    act(() => {
      result.current.setSelectedCategoryId("all");
      result.current.setSearchQuery("Margherita");
    });

    expect(result.current.filteredItems.length).toBe(1);
    expect(result.current.filteredItems[0].name).toBe("Margherita");
  });

  it("optimistically toggles item availability", async () => {
    const { result } = renderHook(() => useMenuAvailability({ restaurantId: "r-001" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.allItems.length).toBe(4);
    });

    const margherita = result.current.allItems.find((i) => i.id === "m-1")!;
    expect(margherita.status).toBe("available");

    await act(async () => {
      await result.current.toggleAvailability(margherita);
    });

    await waitFor(() => {
      const updated = result.current.allItems.find((i) => i.id === "m-1");
      expect(updated?.status).toBe("sold_out");
    });
  });
});
