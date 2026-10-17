import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { publishBumpAction } from "../hardware/bumpBarChannel";
import type { BumpBarAction } from "../hardware/types";

export interface VirtualBumpBarPadProps {
  /** Optional callback fired when any virtual key is pressed */
  onAction?: (action: BumpBarAction) => void;
  /** Optional class name to customize outer container */
  className?: string;
}

interface PadKeyDef {
  id: string;
  action?: BumpBarAction;
  labelKey?: string;
  fallbackLabel: string;
  hotkey: string;
  variant?: "default" | "slot" | "recall" | "bump" | "function" | "inactive";
  colSpan?: string;
}

export function VirtualBumpBarPad({ onAction, className = "" }: VirtualBumpBarPadProps) {
  const { t } = useTranslation();
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleKeyClick = useCallback(
    (action?: BumpBarAction, label?: string) => {
      if (!action) return;
      publishBumpAction(action, "virtual-popup");
      setLastAction(`${label || action}`);
      onAction?.(action);
    },
    [onAction],
  );

  const row1Keys: PadKeyDef[] = [
    { id: "s1", action: "SLOT_1", fallbackLabel: "1", hotkey: "1", variant: "slot" },
    { id: "s2", action: "SLOT_2", fallbackLabel: "2", hotkey: "2", variant: "slot" },
    { id: "s3", action: "SLOT_3", fallbackLabel: "3", hotkey: "3", variant: "slot" },
    { id: "s4", action: "SLOT_4", fallbackLabel: "4", hotkey: "4", variant: "slot" },
    { id: "s5", action: "SLOT_5", fallbackLabel: "5", hotkey: "5", variant: "slot" },
    { id: "s6", action: "SLOT_6", fallbackLabel: "6", hotkey: "6", variant: "slot" },
    { id: "s7", action: "SLOT_7", fallbackLabel: "7", hotkey: "7", variant: "slot" },
    { id: "s8", action: "SLOT_8", fallbackLabel: "8", hotkey: "8", variant: "slot" },
    {
      id: "prev",
      action: "PREV_PAGE",
      labelKey: "kds:bumpBar.prevPage",
      fallbackLabel: "PREV",
      hotkey: "PgUp",
      variant: "function",
    },
    {
      id: "next",
      action: "NEXT_PAGE",
      labelKey: "kds:bumpBar.nextPage",
      fallbackLabel: "NEXT",
      hotkey: "PgDn",
      variant: "function",
    },
    {
      id: "hold",
      action: "HOLD_ORDER",
      labelKey: "kds:bumpBar.hold",
      fallbackLabel: "HOLD",
      hotkey: "H",
      variant: "function",
    },
    {
      id: "item",
      action: "ITEM_PREP_TOGGLE",
      fallbackLabel: "ITEM",
      hotkey: "I",
      variant: "function",
    },
  ];

  const row2Keys: PadKeyDef[] = [
    { id: "f1", fallbackLabel: "F1", hotkey: "—", variant: "inactive" },
    { id: "f2", fallbackLabel: "F2", hotkey: "—", variant: "inactive" },
    { id: "f3", fallbackLabel: "F3", hotkey: "—", variant: "inactive" },
    { id: "f4", fallbackLabel: "F4", hotkey: "—", variant: "inactive" },
    { id: "f5", fallbackLabel: "F5", hotkey: "—", variant: "inactive" },
    {
      id: "summ",
      action: "SUMMARY_COUNTS",
      labelKey: "kds:bumpBar.summary",
      fallbackLabel: "SUMM",
      hotkey: "Space",
      variant: "function",
      colSpan: "col-span-2",
    },
    {
      id: "recall",
      action: "RECALL_LAST",
      labelKey: "kds:bumpBar.recall",
      fallbackLabel: "RECALL",
      hotkey: "R / -",
      variant: "recall",
      colSpan: "col-span-2",
    },
    {
      id: "bump",
      action: "BUMP_SELECTED",
      labelKey: "kds:bumpBar.bump",
      fallbackLabel: "BUMP",
      hotkey: "ENTER",
      variant: "bump",
      colSpan: "col-span-3",
    },
  ];

  const getKeyClasses = (key: PadKeyDef) => {
    const base =
      "relative flex flex-col items-center justify-center rounded border transition select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900";
    const span = key.colSpan ?? "col-span-1";

    switch (key.variant) {
      case "slot":
        return `${base} ${span} bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700 active:bg-slate-950 active:scale-[0.98] focus-visible:ring-sky-400 py-1.5 shadow-sm`;
      case "recall":
        return `${base} ${span} bg-amber-600 border-amber-500 text-slate-950 font-bold hover:bg-amber-500 active:bg-amber-700 active:scale-[0.98] focus-visible:ring-amber-300 py-1.5 shadow-md`;
      case "bump":
        return `${base} ${span} bg-emerald-600 border-emerald-400 text-white font-extrabold hover:bg-emerald-500 active:bg-emerald-700 active:scale-[0.98] focus-visible:ring-emerald-300 py-1.5 shadow-lg`;
      case "function":
        return `${base} ${span} bg-slate-700 border-slate-500 text-slate-200 hover:bg-slate-600 active:bg-slate-800 active:scale-[0.98] focus-visible:ring-slate-300 py-1.5 shadow-sm`;
      case "inactive":
        return `${base} ${span} bg-slate-850/60 border-slate-800 text-slate-500 cursor-not-allowed py-1.5`;
      default:
        return `${base} ${span} bg-slate-800 border-slate-600 text-slate-100 py-1.5`;
    }
  };

  return (
    <div
      className={`flex h-full w-full flex-col justify-between rounded-lg border-2 border-slate-700 bg-slate-900 p-2.5 font-sans text-slate-100 shadow-2xl ${className}`}
      role="region"
      aria-label={t("kds:bumpBar.virtualTitle", "KB9000 Bump Bar Simulator")}
    >
      {/* Hardware Chassis Header Strip */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-300">
            LOGIC CONTROLS KB9000
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            READY
          </span>
        </div>

        {/* Live status / last-pressed display */}
        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[10px] text-slate-500 sm:inline">
            CH: orderly-kds-bumpbar
          </span>
          <div
            className="min-w-[120px] rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-right font-mono text-[11px] text-emerald-400"
            aria-live="polite"
          >
            {lastAction ? `LAST: ${lastAction}` : "IDLE"}
          </div>
        </div>
      </div>

      {/* 24-Membrane Keypad Matrix */}
      <div className="mt-2 flex flex-1 flex-col justify-center gap-1.5">
        {/* Row 1: 12 keys (Slots 1-8 + Navigation/Action) */}
        <div className="grid grid-cols-12 gap-1.5">
          {row1Keys.map((k) => {
            const label = k.labelKey ? t(k.labelKey, k.fallbackLabel) : k.fallbackLabel;
            return (
              <button
                key={k.id}
                type="button"
                className={getKeyClasses(k)}
                onClick={() => handleKeyClick(k.action, label)}
                disabled={k.variant === "inactive"}
                aria-label={k.action ? `${label} (${k.hotkey})` : label}
              >
                <span className="text-sm leading-tight font-bold">{label}</span>
                <span className="font-mono text-[9px] tracking-tighter text-slate-400 opacity-80">
                  [{k.hotkey}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: 12 keys (Auxiliary + Summary + Recall + Bump) */}
        <div className="grid grid-cols-12 gap-1.5">
          {row2Keys.map((k) => {
            const label = k.labelKey ? t(k.labelKey, k.fallbackLabel) : k.fallbackLabel;
            return (
              <button
                key={k.id}
                type="button"
                className={getKeyClasses(k)}
                onClick={() => handleKeyClick(k.action, label)}
                disabled={k.variant === "inactive"}
                aria-label={k.action ? `${label} (${k.hotkey})` : label}
              >
                <span className="text-sm leading-tight font-bold">{label}</span>
                <span className="font-mono text-[9px] tracking-tighter opacity-75">
                  [{k.hotkey}]
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
