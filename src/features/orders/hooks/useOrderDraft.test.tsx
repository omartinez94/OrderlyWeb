import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { store } from "../../../app/store";
import { useOrderDraft } from "./useOrderDraft";

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useOrderDraft", () => {
  it("computes cart items, subtotal, tax, and grand total from basketApi", async () => {
    const { result } = renderHook(() => useOrderDraft("r-001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.itemCount).toBeGreaterThanOrEqual(1);
    expect(result.current.subtotal).toBeGreaterThan(0);
    expect(result.current.grandTotal).toBeGreaterThan(0);
  });

  it("exposes addItem, updateQuantity, removeItem, and checkout methods", async () => {
    const { result } = renderHook(() => useOrderDraft("r-001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.addItem).toBe("function");
    expect(typeof result.current.updateQuantity).toBe("function");
    expect(typeof result.current.removeItem).toBe("function");
    expect(typeof result.current.applyCoupon).toBe("function");
    expect(typeof result.current.checkout).toBe("function");
  });
});
