/**
 * useBumpBar — unified input capture engine for KDS hardware operations.
 *
 * Aggregates:
 *   1. Physical USB keyboard HID keystrokes (KB9000 scan codes or Numpad).
 *   2. Inter-window virtual bump bar BroadcastChannel messages.
 *
 * Security & Ergonomics:
 *   - Ignores keystrokes targeting active input/textarea/select/editable elements.
 *   - Hardware debounce window (300ms) on BUMP and RECALL to prevent double-bumping.
 */

import { useEffect, useRef } from "react";
import { type BumpBarAction, type BumpBarProfile } from "./types";
import { KB9000_DEFAULT_PROFILE, resolveKeyToAction } from "./bumpBarProfiles";
import { subscribeBumpAction } from "./bumpBarChannel";

export interface UseBumpBarOptions {
  onAction: (action: BumpBarAction) => void;
  profile?: BumpBarProfile;
  enabled?: boolean;
  debounceMs?: number;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toUpperCase();
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    Boolean(target.isContentEditable) ||
    target.contentEditable === "true" ||
    target.getAttribute("contenteditable") === "true" ||
    target.getAttribute("contenteditable") === ""
  );
}

const DEBOUNCED_ACTIONS: Set<BumpBarAction> = new Set(["BUMP_SELECTED", "RECALL_LAST"]);

export function useBumpBar(
  optionsOrHandler: UseBumpBarOptions | ((action: BumpBarAction) => void),
) {
  const options: UseBumpBarOptions =
    typeof optionsOrHandler === "function" ? { onAction: optionsOrHandler } : optionsOrHandler;

  const { onAction, profile = KB9000_DEFAULT_PROFILE, enabled = true, debounceMs = 300 } = options;

  const handlerRef = useRef(onAction);
  handlerRef.current = onAction;

  const lastActionTimeRef = useRef<{ action: BumpBarAction; time: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const dispatchAction = (action: BumpBarAction) => {
      const now = Date.now();
      if (DEBOUNCED_ACTIONS.has(action)) {
        if (
          lastActionTimeRef.current &&
          lastActionTimeRef.current.action === action &&
          now - lastActionTimeRef.current.time < debounceMs
        ) {
          // Debounce duplicate bounce
          return;
        }
        lastActionTimeRef.current = { action, time: now };
      }

      handlerRef.current(action);
    };

    // 1. Physical Keyboard Event Interception
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const action = resolveKeyToAction(event, profile);
      if (action) {
        event.preventDefault();
        dispatchAction(action);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });

    // 2. Virtual Bump Bar BroadcastChannel Subscription
    const unsubscribeChannel = subscribeBumpAction((action) => {
      dispatchAction(action);
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      unsubscribeChannel();
    };
  }, [enabled, profile, debounceMs]);
}
