/**
 * OrderStatusBadge — 5-stop service hue status badge for OrderlyWeb.
 *
 * Implements "The Stainless Line" design system specifications:
 *   1. Cold Station Blue (`#1D4ED8`): Pending / New
 *   2. Station Cyan (`#0284C7`): Confirmed / Acknowledged
 *   3. Line Teal (`#0D9488`): Preparing
 *   4. Range Amber (`#D97706`): Plating / OnHold
 *   5. Induction Flame (`#EA580C`): Ready
 *
 * Terminal / Semantic States:
 *   - Clean Station Emerald (`#059669`): Delivered / Completed / Served
 *   - Flame Red (`#DC2626`): Cancelled
 *   - Slate / Steel: Ordering (Draft)
 */

import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { BackendOrderStatus, OrderStatus } from "../../../types/order";

export interface OrderStatusBadgeProps {
  status: BackendOrderStatus | OrderStatus;
  className?: string;
  hideDot?: boolean;
}

interface StatusStyleConfig {
  badge: string;
  dot: string;
}

const STATUS_STYLES: Record<string, StatusStyleConfig> = {
  // Service Hue 1: Cold Station Blue
  [BackendOrderStatus.Pending]: {
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    dot: "bg-blue-600 dark:bg-blue-400",
  },
  [OrderStatus.New]: {
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    dot: "bg-blue-600 dark:bg-blue-400",
  },

  // Service Hue 2: Station Cyan
  [BackendOrderStatus.Confirmed]: {
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
    dot: "bg-sky-600 dark:bg-sky-400",
  },
  [OrderStatus.Acknowledged]: {
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
    dot: "bg-sky-600 dark:bg-sky-400",
  },

  // Service Hue 3: Line Teal
  [BackendOrderStatus.Preparing]: {
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
    dot: "bg-teal-600 dark:bg-teal-400",
  },
  [OrderStatus.Preparing]: {
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
    dot: "bg-teal-600 dark:bg-teal-400",
  },

  // Service Hue 4: Range Amber
  Plating: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dot: "bg-amber-600 dark:bg-amber-400",
  },
  [OrderStatus.Plating]: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dot: "bg-amber-600 dark:bg-amber-400",
  },
  [BackendOrderStatus.OnHold]: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dot: "bg-amber-600 dark:bg-amber-400",
  },

  // Service Hue 5: Induction Flame (Urgency)
  [BackendOrderStatus.Ready]: {
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    dot: "bg-orange-600 dark:bg-orange-400 animate-pulse",
  },
  [OrderStatus.Ready]: {
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    dot: "bg-orange-600 dark:bg-orange-400 animate-pulse",
  },

  // Clean Station Emerald: Terminal Success
  [BackendOrderStatus.Delivered]: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },
  [BackendOrderStatus.Completed]: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },
  [OrderStatus.Served]: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },
  closed: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },

  // Flame Red: Voids & Cancellations
  [BackendOrderStatus.Cancelled]: {
    badge: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
    dot: "bg-red-600 dark:bg-red-400",
  },
  cancelled: {
    badge: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
    dot: "bg-red-600 dark:bg-red-400",
  },

  // Neutral Gunmetal: Draft / Ordering
  [BackendOrderStatus.Ordering]: {
    badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30",
    dot: "bg-slate-600 dark:bg-slate-400",
  },
  open: {
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    dot: "bg-blue-600 dark:bg-blue-400",
  },
};

const DEFAULT_STYLE: StatusStyleConfig = {
  badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30",
  dot: "bg-slate-500",
};

export function OrderStatusBadge({ status, className, hideDot = false }: OrderStatusBadgeProps) {
  const { t } = useTranslation("orders");
  const style = STATUS_STYLES[status] ?? DEFAULT_STYLE;
  const label = t(`status.${status}`, status);

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium tracking-wide",
        style.badge,
        className,
      )}
    >
      {!hideDot && (
        <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  );
}
