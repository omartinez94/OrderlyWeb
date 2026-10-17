import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router";
import type { ReactNode } from "react";
import { useOrderFilters } from "./useOrderFilters";

function createWrapper(initialEntries = ["/orders"]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
  };
}

describe("useOrderFilters", () => {
  it("initializes with default values when URL has no params", () => {
    const { result } = renderHook(() => useOrderFilters(), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBeUndefined();
    expect(result.current.orderType).toBeUndefined();
    expect(result.current.query).toBe("");
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(15);
  });

  it("reads initial filter state from URL search params", () => {
    const { result } = renderHook(() => useOrderFilters(), {
      wrapper: createWrapper([
        "/orders?status=Preparing&orderType=DineIn&q=Margherita&page=2&pageSize=30",
      ]),
    });

    expect(result.current.status).toBe("Preparing");
    expect(result.current.orderType).toBe("DineIn");
    expect(result.current.query).toBe("Margherita");
    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(30);
  });

  it("updates status and resets page to 1", () => {
    const { result } = renderHook(
      () => {
        const filters = useOrderFilters();
        const [params] = useSearchParams();
        return { filters, params };
      },
      { wrapper: createWrapper(["/orders?page=3"]) },
    );

    act(() => {
      result.current.filters.setStatus("Ready");
    });

    expect(result.current.filters.status).toBe("Ready");
    expect(result.current.filters.page).toBe(1);
    expect(result.current.params.get("status")).toBe("Ready");
    expect(result.current.params.get("page")).toBeNull();
  });

  it("updates orderType and query", () => {
    const { result } = renderHook(() => useOrderFilters(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setOrderType("Takeout");
    });
    act(() => {
      result.current.setQuery("ORD-123");
    });

    expect(result.current.orderType).toBe("Takeout");
    expect(result.current.query).toBe("ORD-123");
  });

  it("resets all active filters", () => {
    const { result } = renderHook(() => useOrderFilters(), {
      wrapper: createWrapper(["/orders?status=Ready&orderType=Delivery&q=Main&page=2"]),
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.status).toBeUndefined();
    expect(result.current.orderType).toBeUndefined();
    expect(result.current.query).toBe("");
    expect(result.current.page).toBe(1);
  });
});
