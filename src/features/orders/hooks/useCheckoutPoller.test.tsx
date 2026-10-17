import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { store } from "../../../app/store";
import { useCheckoutPoller } from "./useCheckoutPoller";

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    );
  };
}

describe("useCheckoutPoller", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with isPolling false and zero elapsed seconds", () => {
    const { result } = renderHook(() => useCheckoutPoller(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPolling).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0);
  });

  it("starts polling and sets isPolling to true", () => {
    const { result } = renderHook(() => useCheckoutPoller({ maxSeconds: 10 }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.startPolling("r-001");
    });

    expect(result.current.isPolling).toBe(true);

    act(() => {
      result.current.cancelPolling();
    });

    expect(result.current.isPolling).toBe(false);
  });
});
