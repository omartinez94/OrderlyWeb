import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBumpBar, isEditableTarget } from "./useBumpBar";
import { NUMPAD_PROFILE, resolveKeyToAction } from "./bumpBarProfiles";
import { publishBumpAction, closeSenderChannel } from "./bumpBarChannel";

describe("bumpBarProfiles", () => {
  it("resolves KB9000 scan codes accurately", () => {
    expect(resolveKeyToAction({ code: "Digit1" })).toBe("SLOT_1");
    expect(resolveKeyToAction({ code: "Digit8" })).toBe("SLOT_8");
    expect(resolveKeyToAction({ code: "Enter" })).toBe("BUMP_SELECTED");
    expect(resolveKeyToAction({ code: "ControlLeft" })).toBe("BUMP_SELECTED");
    expect(resolveKeyToAction({ code: "NumpadSubtract" })).toBe("RECALL_LAST");
    expect(resolveKeyToAction({ code: "KeyR" })).toBe("RECALL_LAST");
    expect(resolveKeyToAction({ code: "Space" })).toBe("SUMMARY_COUNTS");
    expect(resolveKeyToAction({ code: "ArrowDown" })).toBe("NEXT_PAGE");
    expect(resolveKeyToAction({ code: "PageDown" })).toBe("NEXT_PAGE");
    expect(resolveKeyToAction({ code: "ArrowUp" })).toBe("PREV_PAGE");
    expect(resolveKeyToAction({ code: "PageUp" })).toBe("PREV_PAGE");
    expect(resolveKeyToAction({ code: "ArrowRight" })).toBe("NEXT_SLOT");
    expect(resolveKeyToAction({ code: "ArrowLeft" })).toBe("PREV_SLOT");
    expect(resolveKeyToAction({ code: "KeyH" })).toBe("HOLD_ORDER");
    expect(resolveKeyToAction({ code: "KeyI" })).toBe("ITEM_PREP_TOGGLE");
  });

  it("resolves Numpad auxiliary profile bindings", () => {
    expect(resolveKeyToAction({ code: "Numpad1" }, NUMPAD_PROFILE)).toBe("SLOT_1");
    expect(resolveKeyToAction({ code: "NumpadEnter" }, NUMPAD_PROFILE)).toBe("BUMP_SELECTED");
    expect(resolveKeyToAction({ code: "NumpadAdd" }, NUMPAD_PROFILE)).toBe("NEXT_PAGE");
    expect(resolveKeyToAction({ code: "NumpadDecimal" }, NUMPAD_PROFILE)).toBe("PREV_PAGE");
    expect(resolveKeyToAction({ code: "ArrowRight" }, NUMPAD_PROFILE)).toBe("NEXT_SLOT");
    expect(resolveKeyToAction({ code: "ArrowLeft" }, NUMPAD_PROFILE)).toBe("PREV_SLOT");
  });

  it("returns null for unbound keys", () => {
    expect(resolveKeyToAction({ code: "KeyZ" })).toBeNull();
    expect(resolveKeyToAction({ code: "F1" })).toBeNull();
  });
});

describe("isEditableTarget", () => {
  it("detects input, textarea, select, and contenteditable elements", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    const divEditable = document.createElement("div");
    divEditable.contentEditable = "true";

    const divRegular = document.createElement("div");
    const button = document.createElement("button");

    expect(isEditableTarget(input)).toBe(true);
    expect(isEditableTarget(textarea)).toBe(true);
    expect(isEditableTarget(select)).toBe(true);
    expect(isEditableTarget(divEditable)).toBe(true);

    expect(isEditableTarget(divRegular)).toBe(false);
    expect(isEditableTarget(button)).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});

describe("useBumpBar", () => {
  let originalBroadcastChannel: typeof BroadcastChannel;
  let mockChannels: Set<{
    postMessage: (msg: unknown) => void;
    onmessage: ((e: MessageEvent) => void) | null;
    close: () => void;
  }>;

  beforeEach(() => {
    mockChannels = new Set();
    originalBroadcastChannel = globalThis.BroadcastChannel;

    // Simple in-memory mock of BroadcastChannel for Vitest
    globalThis.BroadcastChannel = class MockBroadcastChannel {
      name: string;
      onmessage: ((e: MessageEvent) => void) | null = null;

      constructor(name: string) {
        this.name = name;
        mockChannels.add(this);
      }

      postMessage(data: unknown) {
        mockChannels.forEach((ch) => {
          if (ch !== this && ch.onmessage) {
            ch.onmessage(new MessageEvent("message", { data }));
          }
        });
      }

      close() {
        mockChannels.delete(this);
      }
    } as unknown as typeof BroadcastChannel;
  });

  afterEach(() => {
    closeSenderChannel();
    globalThis.BroadcastChannel = originalBroadcastChannel;
  });

  it("dispatches physical USB keyboard events and prevents default", () => {
    const onAction = vi.fn();
    renderHook(() => useBumpBar({ onAction }));

    const event = new KeyboardEvent("keydown", { code: "Digit2", bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(onAction).toHaveBeenCalledWith("SLOT_2");
  });

  it("ignores keydown events originating from editable inputs", () => {
    const onAction = vi.fn();
    renderHook(() => useBumpBar({ onAction }));

    const input = document.createElement("input");
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", { code: "Enter", bubbles: true });
    Object.defineProperty(event, "target", { value: input });

    window.dispatchEvent(event);

    expect(onAction).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("debounces rapid consecutive BUMP_SELECTED actions within debounce window", () => {
    vi.useFakeTimers();
    const onAction = vi.fn();

    renderHook(() => useBumpBar({ onAction, debounceMs: 300 }));

    const event1 = new KeyboardEvent("keydown", { code: "Enter", bubbles: true });
    window.dispatchEvent(event1);
    expect(onAction).toHaveBeenCalledTimes(1);

    // Immediate second press within 100ms
    vi.advanceTimersByTime(100);
    const event2 = new KeyboardEvent("keydown", { code: "Enter", bubbles: true });
    window.dispatchEvent(event2);
    expect(onAction).toHaveBeenCalledTimes(1); // debounced!

    // After debounce window (301ms total)
    vi.advanceTimersByTime(250);
    const event3 = new KeyboardEvent("keydown", { code: "Enter", bubbles: true });
    window.dispatchEvent(event3);
    expect(onAction).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("receives actions from BroadcastChannel published by virtual bump bar", () => {
    const onAction = vi.fn();
    renderHook(() => useBumpBar({ onAction }));

    act(() => {
      publishBumpAction("RECALL_LAST", "virtual-popup");
    });

    expect(onAction).toHaveBeenCalledWith("RECALL_LAST");
  });

  it("cleans up event listeners and channel subscription on unmount", () => {
    const onAction = vi.fn();
    const { unmount } = renderHook(() => useBumpBar({ onAction }));

    unmount();

    const event = new KeyboardEvent("keydown", { code: "Digit1", bubbles: true });
    window.dispatchEvent(event);
    expect(onAction).not.toHaveBeenCalled();
  });
});
