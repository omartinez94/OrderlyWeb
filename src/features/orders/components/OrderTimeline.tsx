/**
 * OrderTimeline — chronological audit feed displaying lifecycle transitions from order_activities.
 *
 * Implements "The Stainless Line" industrial aesthetic:
 *   - Machined vertical hairline guide line
 *   - Status bullet nodes with contextual service hue highlights
 *   - Actor stamps, timestamps, and correlation IDs
 */

import { useTranslation } from "react-i18next";
import {
  Sparkles,
  CheckCircle2,
  Flame,
  Bell,
  CheckCheck,
  XCircle,
  Utensils,
  Clock,
  User,
  Hash,
} from "lucide-react";
import { formatDate, getDateFnsLocale } from "../../../utils/date";
import type { OrderActivityDto, OrderActivityType } from "../../../types/order";
import { cn } from "../../../lib/utils";

export interface OrderTimelineProps {
  activities: OrderActivityDto[];
  className?: string;
}

type ActivityTranslationKey =
  | "activities.OrderCreated"
  | "activities.OrderUpdated"
  | "activities.OrderConfirmed"
  | "activities.OrderPreparingStarted"
  | "activities.OrderReady"
  | "activities.OrderDeliveryStarted"
  | "activities.OrderDelivered"
  | "activities.OrderCompleted"
  | "activities.OrderCancelled"
  | "activities.OrderItemPrepStarted"
  | "activities.OrderItemPrepCompleted";

const ACTIVITY_CONFIG: Record<
  OrderActivityType,
  {
    icon: typeof Sparkles;
    nodeStyle: string;
    labelKey: ActivityTranslationKey;
  }
> = {
  OrderCreated: {
    icon: Sparkles,
    nodeStyle: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    labelKey: "activities.OrderCreated",
  },
  OrderUpdated: {
    icon: Utensils,
    nodeStyle: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
    labelKey: "activities.OrderUpdated",
  },
  OrderConfirmed: {
    icon: CheckCircle2,
    nodeStyle: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    labelKey: "activities.OrderConfirmed",
  },
  OrderPreparingStarted: {
    icon: Flame,
    nodeStyle: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
    labelKey: "activities.OrderPreparingStarted",
  },
  OrderReady: {
    icon: Bell,
    nodeStyle:
      "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 animate-pulse",
    labelKey: "activities.OrderReady",
  },
  OrderDeliveryStarted: {
    icon: Clock,
    nodeStyle: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    labelKey: "activities.OrderDeliveryStarted",
  },
  OrderDelivered: {
    icon: CheckCheck,
    nodeStyle: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    labelKey: "activities.OrderDelivered",
  },
  OrderCompleted: {
    icon: CheckCheck,
    nodeStyle: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    labelKey: "activities.OrderCompleted",
  },
  OrderCancelled: {
    icon: XCircle,
    nodeStyle: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    labelKey: "activities.OrderCancelled",
  },
  OrderItemPrepStarted: {
    icon: Flame,
    nodeStyle: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
    labelKey: "activities.OrderItemPrepStarted",
  },
  OrderItemPrepCompleted: {
    icon: Bell,
    nodeStyle: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    labelKey: "activities.OrderItemPrepCompleted",
  },
};

export function OrderTimeline({ activities, className }: OrderTimelineProps) {
  const { t, i18n } = useTranslation("orders");

  if (!activities || activities.length === 0) {
    return (
      <div className="text-ink-muted flex flex-col items-center justify-center p-8 text-center text-xs">
        <Clock className="text-ink-subtle mb-2 size-6" />
        <p>{t("activities.noActivities")}</p>
      </div>
    );
  }

  // Sort chronological (oldest to newest for step timeline)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  return (
    <div className={cn("relative pl-6 space-y-6", className)}>
      {/* Vertical Timeline Guide Line */}
      <div className="bg-border-subtle absolute top-2 bottom-2 left-2.5 w-px" aria-hidden="true" />

      {sortedActivities.map((act) => {
        const config = ACTIVITY_CONFIG[act.activityType] ?? {
          icon: Clock,
          nodeStyle: "bg-slate-500/15 text-slate-600 border-slate-500/30",
          labelKey: "activities.OrderUpdated" as ActivityTranslationKey,
        };
        const Icon = config.icon;
        const formattedDate = formatDate(
          act.occurredAt,
          "MMM d, yyyy h:mm:ss a",
          getDateFnsLocale(i18n.language),
        );

        return (
          <div key={act.id} className="group relative flex items-start gap-3">
            {/* Timeline Bullet Node */}
            <div
              className={cn(
                "absolute -left-6 top-0.5 flex size-5 items-center justify-center rounded-full border shadow-xs transition-transform group-hover:scale-110",
                config.nodeStyle,
              )}
              aria-hidden="true"
            >
              <Icon className="size-3" />
            </div>

            {/* Content Card */}
            <div className="border-border-subtle/70 bg-surface-elevated/70 flex w-full flex-col gap-1 rounded-lg border p-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-ink font-sans text-xs font-bold">{t(config.labelKey)}</h3>
                <span className="text-ink-subtle font-mono text-[11px]">{formattedDate}</span>
              </div>

              {/* Actor & Metadata Row */}
              <div className="text-ink-muted flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                {act.actorUserId && (
                  <span className="bg-surface text-ink inline-flex items-center gap-1 rounded px-1.5 py-0.5">
                    <User className="text-ink-subtle size-3" />
                    <span>{act.actorUserId}</span>
                  </span>
                )}
                {act.correlationId && (
                  <span className="bg-surface text-ink-subtle inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px]">
                    <Hash className="size-2.5" />
                    <span className="max-w-[120px] truncate">{act.correlationId}</span>
                  </span>
                )}
              </div>

              {/* Activity Notes / Reason */}
              {act.notes && (
                <p className="mt-1 rounded border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-xs text-amber-800 dark:text-amber-300">
                  {act.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
