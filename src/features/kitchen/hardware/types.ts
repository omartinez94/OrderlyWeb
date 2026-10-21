/**
 * KDS Bump Bar Hardware Types & Message Contracts.
 *
 * Covers physical Logic Controls KB9000, 10-key numpad presets,
 * and inter-window BroadcastChannel message schemas.
 */

import { z } from "zod";

export const BumpBarAction = {
  Slot1: "SLOT_1",
  Slot2: "SLOT_2",
  Slot3: "SLOT_3",
  Slot4: "SLOT_4",
  Slot5: "SLOT_5",
  Slot6: "SLOT_6",
  Slot7: "SLOT_7",
  Slot8: "SLOT_8",
  NextSlot: "NEXT_SLOT",
  PrevSlot: "PREV_SLOT",
  BumpSelected: "BUMP_SELECTED",
  RecallLast: "RECALL_LAST",
  SummaryCounts: "SUMMARY_COUNTS",
  NextPage: "NEXT_PAGE",
  PrevPage: "PREV_PAGE",
  ItemPrepToggle: "ITEM_PREP_TOGGLE",
  HoldOrder: "HOLD_ORDER",
} as const;

export type BumpBarAction = (typeof BumpBarAction)[keyof typeof BumpBarAction];

export const BUMP_BAR_ACTIONS = Object.values(BumpBarAction) as [BumpBarAction, ...BumpBarAction[]];

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

export const BUMP_ACTION_MESSAGE_TYPE = "BUMP_ACTION" as const;

export const BumpBarChannelMessageSchema = z.object({
  type: z.literal(BUMP_ACTION_MESSAGE_TYPE),
  action: z.enum(BUMP_BAR_ACTIONS),
  source: z.enum(["virtual-popup", "hardware-bridge"]),
  timestamp: z.number(),
});

export type BumpBarChannelMessage = z.infer<typeof BumpBarChannelMessageSchema>;
