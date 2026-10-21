/**
 * OrderFilterBar — interactive filtering controls for the Order Operations table.
 *
 * Provides:
 *   - Status filter pill chips (All, Pending, Confirmed, Preparing, Ready, Delivered, Cancelled)
 *   - Search input with clear button (searches Order #, customer name, table)
 *   - Order type toggle (All, DineIn, Takeout, Delivery)
 *   - Page size dropdown selector (15, 30, 50)
 *   - "New order" CTA button linking to POS creator
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Search, X, Plus, UtensilsCrossed, ShoppingBag, Bike } from "lucide-react";
import { Button, Input } from "../../../components/ui";
import { PATH } from "../../../router/pathNames";
import { cn } from "../../../lib/utils";
import { BackendOrderStatus, OrderType } from "../../../types/order";

export interface OrderFilterBarProps {
  status: BackendOrderStatus | undefined;
  orderType: OrderType | undefined;
  query: string;
  pageSize: number;
  onStatusChange: (status: BackendOrderStatus | undefined) => void;
  onOrderTypeChange: (type: OrderType | undefined) => void;
  onQueryChange: (query: string) => void;
  onPageSizeChange: (pageSize: number) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

type StatusChipKey =
  | "list.filterAll"
  | "status.Pending"
  | "status.Confirmed"
  | "status.Preparing"
  | "status.Ready"
  | "status.Delivered"
  | "status.Cancelled";

type OrderTypeChipKey = "list.allTypes" | "types.DineIn" | "types.Takeout" | "types.Delivery";

const STATUS_CHIPS: Array<{ key: BackendOrderStatus | "All"; labelKey: StatusChipKey }> = [
  { key: "All", labelKey: "list.filterAll" },
  { key: BackendOrderStatus.Pending, labelKey: "status.Pending" },
  { key: BackendOrderStatus.Confirmed, labelKey: "status.Confirmed" },
  { key: BackendOrderStatus.Preparing, labelKey: "status.Preparing" },
  { key: BackendOrderStatus.Ready, labelKey: "status.Ready" },
  { key: BackendOrderStatus.Delivered, labelKey: "status.Delivered" },
  { key: BackendOrderStatus.Cancelled, labelKey: "status.Cancelled" },
];

const ORDER_TYPES: Array<{
  key: OrderType | "All";
  labelKey: OrderTypeChipKey;
  icon: typeof UtensilsCrossed;
}> = [
  { key: "All", labelKey: "list.allTypes", icon: UtensilsCrossed },
  { key: OrderType.DineIn, labelKey: "types.DineIn", icon: UtensilsCrossed },
  { key: OrderType.Takeout, labelKey: "types.Takeout", icon: ShoppingBag },
  { key: OrderType.Delivery, labelKey: "types.Delivery", icon: Bike },
];

export function OrderFilterBar({
  status,
  orderType,
  query,
  pageSize,
  onStatusChange,
  onOrderTypeChange,
  onQueryChange,
  onPageSizeChange,
  onReset,
  hasActiveFilters,
}: OrderFilterBarProps) {
  const { t } = useTranslation("orders");

  return (
    <div className="flex flex-col gap-4">
      {/* Top row: Search input, Type filter, Page Size, New Order CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search box with clear button */}
          <div className="relative w-full max-w-sm">
            <Search className="text-ink-subtle absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t("list.searchPlaceholder")}
              aria-label={t("list.searchPlaceholder")}
              className="pr-9 pl-9"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label={t("list.clearSearch")}
                className="text-ink-subtle hover:text-ink absolute top-1/2 right-2.5 -translate-y-1/2 p-0.5"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Type filter buttons */}
          <div className="border-border-subtle bg-surface-elevated hidden items-center rounded-lg border p-1 md:flex">
            {ORDER_TYPES.map(({ key, labelKey, icon: Icon }) => {
              const isActive = (key === "All" && !orderType) || orderType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onOrderTypeChange(key === "All" ? undefined : key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-ink-muted hover:text-ink hover:bg-surface",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{t(labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Page size selector */}
          <div className="text-ink-muted flex items-center gap-1.5 text-xs">
            <span className="hidden sm:inline">{t("list.rowsPerPage")}:</span>
            <select
              value={pageSize}
              aria-label={t("list.rowsPerPage")}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border-border-subtle bg-surface-elevated text-ink focus:border-primary h-8 rounded-md border px-2 py-1 text-xs focus:outline-none"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-ink-muted hover:text-ink h-8 text-xs"
            >
              {t("list.emptyReset")}
            </Button>
          )}

          {/* New Order Button */}
          <Button
            asChild
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent-hover h-8 gap-1.5 font-medium"
          >
            <Link to={PATH.RESTAURANT_ORDER_NEW}>
              <Plus className="size-4" />
              <span>{t("list.newOrder")}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Bottom row: Status Filter Chips */}
      <div
        className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1"
        role="toolbar"
        aria-label="Status filters"
      >
        {STATUS_CHIPS.map(({ key, labelKey }) => {
          const isActive = (key === "All" && !status) || status === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onStatusChange(key === "All" ? undefined : key)}
              aria-pressed={isActive}
              className={cn(
                "rounded-full px-3 py-1 font-sans text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-surface-elevated text-ink-muted border border-border-subtle hover:border-border-strong hover:text-ink",
              )}
            >
              {t(labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
