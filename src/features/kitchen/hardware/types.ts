/**
 * KDS Bump Bar Hardware Types & Message Contracts.
 *
 * Covers physical Logic Controls KB9000, 10-key numpad presets,
 * and inter-window BroadcastChannel message schemas.
 */

import { z } from "zod";

export const BUMP_BAR_ACTIONS = [
  "SLOT_1",
  "SLOT_2",
  "SLOT_3",
  "SLOT_4",
  "SLOT_5",
  "SLOT_6",
  "SLOT_7",
  "SLOT_8",
  "NEXT_SLOT",
  "PREV_SLOT",
  "BUMP_SELECTED",
  "RECALL_LAST",
  "SUMMARY_COUNTS",
  "NEXT_PAGE",
  "PREV_PAGE",
  "ITEM_PREP_TOGGLE",
  "HOLD_ORDER",
] as const;

export type BumpBarAction = (typeof BUMP_BAR_ACTIONS)[number];

export interface BumpBarKeyBinding {
  key: string; // e.g. "Enter", "Control", "1"
  code: string; // e.g. "Enter", "ControlLeft", "Digit1", "NumpadSubtract"
  action: BumpBarAction;
  label: string; // Button legend (e.g. "BUMP", "RECALL")
}

export interface BumpBarProfile {
  id: string;
  name: string;
  description: string;
  bindings: BumpBarKeyBinding[];
}

export const BumpBarChannelMessageSchema = z.object({
  type: z.literal("BUMP_ACTION"),
  action: z.enum(BUMP_BAR_ACTIONS),
  source: z.enum(["virtual-popup", "hardware-bridge"]),
  timestamp: z.number(),
});

export type BumpBarChannelMessage = z.infer<typeof BumpBarChannelMessageSchema>;
