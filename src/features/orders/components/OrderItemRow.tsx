/**
 * OrderItemRow — individual item breakdown component for OrderDetailPage.
 *
 * Displays:
 *   - Item quantity and name
 *   - Prep status badge (Pending / Preparing / Ready)
 *   - Seat number badge
 *   - Variations and special kitchen instructions with amber styling
 *   - Formatted unit and total prices
 */

import { useTranslation } from "react-i18next";
import { AlertCircle, User } from "lucide-react";
import { Badge } from "../../../components/ui";
import { formatCurrency } from "../../../utils/currency";
import type { OrderItemDto, PrepStatus } from "../../../types/order";
import { cn } from "../../../lib/utils";

export interface OrderItemRowProps {
  item: OrderItemDto;
  currency?: string;
}

const PREP_STATUS_STYLES: Record<PrepStatus, { badge: string; label: string }> = {
  Pending: {
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    label: "Pending",
  },
  Preparing: {
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
    label: "Preparing",
  },
  Ready: {
    badge:
      "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30 font-bold animate-pulse",
    label: "Ready",
  },
};

export function OrderItemRow({ item, currency = "USD" }: OrderItemRowProps) {
  const { t, i18n } = useTranslation("orders");
  const prepStyle = PREP_STATUS_STYLES[item.prepStatus] ?? PREP_STATUS_STYLES.Pending;

  return (
    <div className="border-border-subtle bg-surface-elevated flex flex-col gap-2 rounded-xl border p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Quantity & Name */}
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold">
            {item.quantity}x
          </span>
          <div>
            <h3 className="text-ink font-sans text-sm font-bold">{item.menuItemName}</h3>
            {item.menuItemDescription && (
              <p className="text-ink-muted mt-0.5 line-clamp-1 text-xs">
                {item.menuItemDescription}
              </p>
            )}
          </div>
        </div>

        {/* Status & Pricing */}
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-ink font-mono text-sm font-bold">
            {formatCurrency(item.totalPrice, currency, i18n.language)}
          </span>
          <div className="flex items-center gap-1.5">
            {item.seatNumber > 0 && (
              <span className="bg-surface text-ink-muted inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium">
                <User className="text-ink-subtle size-3" />
                <span>{t("detail.seat", { number: item.seatNumber })}</span>
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                prepStyle.badge,
              )}
            >
              {prepStyle.label}
            </span>
          </div>
        </div>
      </div>

      {/* Variations */}
      {item.selectedVariations && item.selectedVariations.length > 0 && (
        <div className="text-ink-muted flex flex-wrap gap-1.5 pt-1 text-xs">
          {item.selectedVariations.map((v) => (
            <Badge
              key={`${v.name}-${v.value}`}
              variant="outline"
              className="text-[10px] font-normal"
            >
              {v.name}: {v.value}
            </Badge>
          ))}
        </div>
      )}

      {/* Special Kitchen Notes (Amber alert styling) */}
      {(item.specialInstructions || (item.customizations && item.customizations.length > 0)) && (
        <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/5 px-2.5 py-1.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            {item.specialInstructions && <p>{item.specialInstructions}</p>}
            {item.customizations &&
              item.customizations.map((c) => (
                <p key={`${c.ingredient}-${c.action}`} className="font-medium">
                  {c.action}: {c.ingredient}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
