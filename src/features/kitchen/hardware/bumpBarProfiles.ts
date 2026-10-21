/**
 * Bump bar hardware profile definitions and scan-code resolver.
 *
 * Implements:
 *   - Logic Controls / Bematech KB9000 factory default profile
 *   - Standard 10-key numeric keypad auxiliary profile
 *   - Scan code / key event resolver
 */

import { type BumpBarProfile, BumpBarAction } from "./types";

export const KB9000_DEFAULT_PROFILE: BumpBarProfile = {
  id: "kb9000-default",
  name: "Logic Controls KB9000",
  description: "Standard 24-key commercial kitchen bump bar USB HID scan codes",
  bindings: [
    { key: "1", code: "Digit1", action: BumpBarAction.Slot1, label: "1" },
    { key: "2", code: "Digit2", action: BumpBarAction.Slot2, label: "2" },
    { key: "3", code: "Digit3", action: BumpBarAction.Slot3, label: "3" },
    { key: "4", code: "Digit4", action: BumpBarAction.Slot4, label: "4" },
    { key: "5", code: "Digit5", action: BumpBarAction.Slot5, label: "5" },
    { key: "6", code: "Digit6", action: BumpBarAction.Slot6, label: "6" },
    { key: "7", code: "Digit7", action: BumpBarAction.Slot7, label: "7" },
    { key: "8", code: "Digit8", action: BumpBarAction.Slot8, label: "8" },
    { key: "Enter", code: "Enter", action: BumpBarAction.BumpSelected, label: "BUMP" },
    { key: "Control", code: "ControlLeft", action: BumpBarAction.BumpSelected, label: "BUMP" },
    { key: "Control", code: "ControlRight", action: BumpBarAction.BumpSelected, label: "BUMP" },
    { key: "-", code: "NumpadSubtract", action: BumpBarAction.RecallLast, label: "RECALL" },
    { key: "r", code: "KeyR", action: BumpBarAction.RecallLast, label: "RECALL" },
    { key: "R", code: "KeyR", action: BumpBarAction.RecallLast, label: "RECALL" },
    { key: " ", code: "Space", action: BumpBarAction.SummaryCounts, label: "SUMM" },
    { key: "s", code: "KeyS", action: BumpBarAction.SummaryCounts, label: "SUMM" },
    { key: "S", code: "KeyS", action: BumpBarAction.SummaryCounts, label: "SUMM" },
    { key: "ArrowDown", code: "ArrowDown", action: BumpBarAction.NextPage, label: "NEXT" },
    { key: "PageDown", code: "PageDown", action: BumpBarAction.NextPage, label: "NEXT" },
    { key: "ArrowUp", code: "ArrowUp", action: BumpBarAction.PrevPage, label: "PREV" },
    { key: "PageUp", code: "PageUp", action: BumpBarAction.PrevPage, label: "PREV" },
    { key: "ArrowRight", code: "ArrowRight", action: BumpBarAction.NextSlot, label: "NEXT TICKET" },
    { key: "ArrowLeft", code: "ArrowLeft", action: BumpBarAction.PrevSlot, label: "PREV TICKET" },
    { key: "0", code: "Digit0", action: BumpBarAction.ItemPrepToggle, label: "ITEM" },
    { key: "i", code: "KeyI", action: BumpBarAction.ItemPrepToggle, label: "ITEM" },
    { key: "I", code: "KeyI", action: BumpBarAction.ItemPrepToggle, label: "ITEM" },
    { key: "h", code: "KeyH", action: BumpBarAction.HoldOrder, label: "HOLD" },
    { key: "H", code: "KeyH", action: BumpBarAction.HoldOrder, label: "HOLD" },
  ],
};

export const NUMPAD_PROFILE: BumpBarProfile = {
  id: "numpad-auxiliary",
  name: "10-Key Numeric Pad",
  description: "Standard USB numeric keypad profile for compact station prep lines",
  bindings: [
    { key: "1", code: "Numpad1", action: BumpBarAction.Slot1, label: "1" },
    { key: "2", code: "Numpad2", action: BumpBarAction.Slot2, label: "2" },
    { key: "3", code: "Numpad3", action: BumpBarAction.Slot3, label: "3" },
    { key: "4", code: "Numpad4", action: BumpBarAction.Slot4, label: "4" },
    { key: "5", code: "Numpad5", action: BumpBarAction.Slot5, label: "5" },
    { key: "6", code: "Numpad6", action: BumpBarAction.Slot6, label: "6" },
    { key: "7", code: "Numpad7", action: BumpBarAction.Slot7, label: "7" },
    { key: "8", code: "Numpad8", action: BumpBarAction.Slot8, label: "8" },
    { key: "Enter", code: "NumpadEnter", action: BumpBarAction.BumpSelected, label: "BUMP" },
    { key: "-", code: "NumpadSubtract", action: BumpBarAction.RecallLast, label: "RECALL" },
    { key: "+", code: "NumpadAdd", action: BumpBarAction.NextPage, label: "NEXT" },
    { key: ".", code: "NumpadDecimal", action: BumpBarAction.PrevPage, label: "PREV" },
    { key: "ArrowRight", code: "ArrowRight", action: BumpBarAction.NextSlot, label: "NEXT TICKET" },
    { key: "ArrowLeft", code: "ArrowLeft", action: BumpBarAction.PrevSlot, label: "PREV TICKET" },
    { key: "0", code: "Numpad0", action: BumpBarAction.SummaryCounts, label: "SUMM" },
  ],
};

export const BUMP_BAR_PROFILES: Record<string, BumpBarProfile> = {
  [KB9000_DEFAULT_PROFILE.id]: KB9000_DEFAULT_PROFILE,
  [NUMPAD_PROFILE.id]: NUMPAD_PROFILE,
};

export const DEFAULT_PROFILE_ID = KB9000_DEFAULT_PROFILE.id;

/**
 * Resolves a physical KeyboardEvent into a typed BumpBarAction using active profile bindings.
 */
export function resolveKeyToAction(
  event: KeyboardEvent | { code?: string; key?: string },
  profile: BumpBarProfile = KB9000_DEFAULT_PROFILE,
): BumpBarAction | null {
  const code = event.code;
  const key = event.key;

  // 1. Strict match on scan code first
  if (code) {
    const codeMatch = profile.bindings.find((b) => b.code === code);
    if (codeMatch) return codeMatch.action;
  }

  // 2. Fallback to key value match
  if (key) {
    const keyMatch = profile.bindings.find((b) => b.key === key);
    if (keyMatch) return keyMatch.action;
  }

  return null;
}
