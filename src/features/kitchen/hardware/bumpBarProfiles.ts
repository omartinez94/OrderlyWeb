/**
 * Bump bar hardware profile definitions and scan-code resolver.
 *
 * Implements:
 *   - Logic Controls / Bematech KB9000 factory default profile
 *   - Standard 10-key numeric keypad auxiliary profile
 *   - Scan code / key event resolver
 */

import type { BumpBarProfile, BumpBarAction } from "./types";

export const KB9000_DEFAULT_PROFILE: BumpBarProfile = {
  id: "kb9000-default",
  name: "Logic Controls KB9000",
  description: "Standard 24-key commercial kitchen bump bar USB HID scan codes",
  bindings: [
    { key: "1", code: "Digit1", action: "SLOT_1", label: "1" },
    { key: "2", code: "Digit2", action: "SLOT_2", label: "2" },
    { key: "3", code: "Digit3", action: "SLOT_3", label: "3" },
    { key: "4", code: "Digit4", action: "SLOT_4", label: "4" },
    { key: "5", code: "Digit5", action: "SLOT_5", label: "5" },
    { key: "6", code: "Digit6", action: "SLOT_6", label: "6" },
    { key: "7", code: "Digit7", action: "SLOT_7", label: "7" },
    { key: "8", code: "Digit8", action: "SLOT_8", label: "8" },
    { key: "Enter", code: "Enter", action: "BUMP_SELECTED", label: "BUMP" },
    { key: "Control", code: "ControlLeft", action: "BUMP_SELECTED", label: "BUMP" },
    { key: "Control", code: "ControlRight", action: "BUMP_SELECTED", label: "BUMP" },
    { key: "-", code: "NumpadSubtract", action: "RECALL_LAST", label: "RECALL" },
    { key: "r", code: "KeyR", action: "RECALL_LAST", label: "RECALL" },
    { key: "R", code: "KeyR", action: "RECALL_LAST", label: "RECALL" },
    { key: " ", code: "Space", action: "SUMMARY_COUNTS", label: "SUMM" },
    { key: "s", code: "KeyS", action: "SUMMARY_COUNTS", label: "SUMM" },
    { key: "S", code: "KeyS", action: "SUMMARY_COUNTS", label: "SUMM" },
    { key: "ArrowDown", code: "ArrowDown", action: "NEXT_PAGE", label: "NEXT" },
    { key: "PageDown", code: "PageDown", action: "NEXT_PAGE", label: "NEXT" },
    { key: "ArrowUp", code: "ArrowUp", action: "PREV_PAGE", label: "PREV" },
    { key: "PageUp", code: "PageUp", action: "PREV_PAGE", label: "PREV" },
    { key: "0", code: "Digit0", action: "ITEM_PREP_TOGGLE", label: "ITEM" },
    { key: "i", code: "KeyI", action: "ITEM_PREP_TOGGLE", label: "ITEM" },
    { key: "I", code: "KeyI", action: "ITEM_PREP_TOGGLE", label: "ITEM" },
    { key: "h", code: "KeyH", action: "HOLD_ORDER", label: "HOLD" },
    { key: "H", code: "KeyH", action: "HOLD_ORDER", label: "HOLD" },
  ],
};

export const NUMPAD_PROFILE: BumpBarProfile = {
  id: "numpad-auxiliary",
  name: "10-Key Numeric Pad",
  description: "Standard USB numeric keypad profile for compact station prep lines",
  bindings: [
    { key: "1", code: "Numpad1", action: "SLOT_1", label: "1" },
    { key: "2", code: "Numpad2", action: "SLOT_2", label: "2" },
    { key: "3", code: "Numpad3", action: "SLOT_3", label: "3" },
    { key: "4", code: "Numpad4", action: "SLOT_4", label: "4" },
    { key: "5", code: "Numpad5", action: "SLOT_5", label: "5" },
    { key: "6", code: "Numpad6", action: "SLOT_6", label: "6" },
    { key: "7", code: "Numpad7", action: "SLOT_7", label: "7" },
    { key: "8", code: "Numpad8", action: "SLOT_8", label: "8" },
    { key: "Enter", code: "NumpadEnter", action: "BUMP_SELECTED", label: "BUMP" },
    { key: "-", code: "NumpadSubtract", action: "RECALL_LAST", label: "RECALL" },
    { key: "+", code: "NumpadAdd", action: "NEXT_PAGE", label: "NEXT" },
    { key: ".", code: "NumpadDecimal", action: "PREV_PAGE", label: "PREV" },
    { key: "0", code: "Numpad0", action: "SUMMARY_COUNTS", label: "SUMM" },
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
