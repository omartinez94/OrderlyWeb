/**
 * OrderListTable — high-density data table for the Order Operations module.
 *
 * Adheres to "The Stainless Line" industrial design guidelines:
 *   - Monospace telemetry for Order #, time, and amounts
 *   - 5-stop service hue status badge via OrderStatusBadge
 *   - Distinct order type icons (DineIn, Takeout, Delivery)
 *   - Keyboard-accessible and cursor-pointer row navigation
 *   - Clean empty state and DataTableSkeleton integration
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  ChevronRight,
  ChevronLeft,
  Inbox,
  Clock,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  DataTableSkeleton,
} from "../../../components/ui";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PATH } from "../../../router/pathNames";
import { useNavigateWithTransition } from "../../../hooks/useNavigateWithTransition";
import { formatCurrency } from "../../../utils/currency";
import { formatRelativeTime, getDateFnsLocale } from "../../../utils/date";
import type { OrderDto, OrderType } from "../../../types/order";

export interface OrderListTableProps {
  orders: OrderDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onResetFilters?: () => void;
}

const TYPE_ICONS: Record<OrderType, typeof UtensilsCrossed> = {
  DineIn: UtensilsCrossed,
  Takeout: ShoppingBag,
  Delivery: Bike,
};

function formatItemsSummary(items: OrderDto["orderItems"]): { count: number; summary: string } {
  if (!items || items.length === 0) {
    return { count: 0, summary: "—" };
  }
  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const preview = items
    .slice(0, 2)
    .map((item) => `${item.quantity > 1 ? `${item.quantity}x ` : ""}${item.menuItemName}`)
    .join(", ");
  const remaining = items.length - 2;
  const summary = remaining > 0 ? `${preview} +${remaining}` : preview;
  return { count: totalCount, summary };
}

type OrdersT = ReturnType<typeof useTranslation<"orders">>["t"];

function resolveDestination(order: OrderDto, t: OrdersT): string {
  if (order.orderType === "DineIn") {
    if (order.tableId) {
      const cleanNum = order.tableId.replace(/^[a-zA-Z]-/, "");
      return t("list.tableNumber", { number: cleanNum });
    }
    return t("types.DineIn");
  }
  if (order.orderType === "Delivery") {
    return order.deliveryAddress?.street || t("types.Delivery");
  }
  return t("types.Takeout");
}

function resolveOrderTimestamp(order: OrderDto): string | null {
  if (order.activities && order.activities.length > 0) {
    return order.activities[0].occurredAt;
  }
  if (order.confirmedAt) return order.confirmedAt;
  if (order.preparingStartedAt) return order.preparingStartedAt;
  if (order.orderItems && order.orderItems.length > 0 && order.orderItems[0].createdAt) {
    return order.orderItems[0].createdAt;
  }
  return null;
}

export function OrderListTable({
  orders,
  totalCount,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onResetFilters,
}: OrderListTableProps) {
  const { t, i18n } = useTranslation("orders");
  const navigate = useNavigateWithTransition();

  if (isLoading) {
    return <DataTableSkeleton rows={Math.min(pageSize, 8)} columns={7} className="my-4" />;
  }

  if (orders.length === 0) {
    return (
      <div className="border-border-subtle bg-surface-elevated/50 flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
        <div className="bg-surface text-ink-muted flex size-12 items-center justify-center rounded-full">
          <Inbox className="size-6" />
        </div>
        <h3 className="font-display text-ink mt-4 text-lg font-semibold">{t("list.emptyTitle")}</h3>
        <p className="text-ink-muted mt-1.5 max-w-sm text-sm">{t("list.emptyDescription")}</p>
        {onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-5">
            {t("list.emptyReset")}
          </Button>
        )}
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromIndex = Math.min((page - 1) * pageSize + 1, totalCount);
  const toIndex = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3">
      {/* Table Container with horizontal overflow protection for tablets */}
      <div className="border-border-subtle bg-surface-elevated overflow-x-auto rounded-xl border shadow-xs">
        <Table className="w-full text-left">
          <TableHeader>
            <TableRow className="border-border-subtle bg-surface/50 hover:bg-surface/50 border-b">
              <TableHead className="text-ink-muted font-mono text-xs tracking-wider uppercase">
                {t("list.tableHeaderOrder")}
              </TableHead>
              <TableHead className="text-ink-muted font-sans text-xs tracking-wider uppercase">
                {t("list.tableHeaderType")}
              </TableHead>
              <TableHead className="text-ink-muted font-sans text-xs tracking-wider uppercase">
                {t("list.tableHeaderDestination")}
              </TableHead>
              <TableHead className="text-ink-muted font-sans text-xs tracking-wider uppercase">
                {t("list.tableHeaderStatus")}
              </TableHead>
              <TableHead className="text-ink-muted font-sans text-xs tracking-wider uppercase">
                {t("list.tableHeaderItems")}
              </TableHead>
              <TableHead className="text-ink-muted font-sans text-xs tracking-wider uppercase">
                {t("list.tableHeaderTime")}
              </TableHead>
              <TableHead className="text-ink-muted text-right font-mono text-xs tracking-wider uppercase">
                {t("list.tableHeaderTotal")}
              </TableHead>
              <TableHead className="w-12 text-center">
                <span className="sr-only">{t("list.tableHeaderActions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-border-subtle divide-y [content-visibility:auto]">
            {orders.map((order) => {
              const TypeIcon = TYPE_ICONS[order.orderType] ?? UtensilsCrossed;
              const { summary } = formatItemsSummary(order.orderItems);
              const destination = resolveDestination(order, t);
              const timestamp = resolveOrderTimestamp(order);
              const relativeTime = timestamp
                ? formatRelativeTime(timestamp, true, getDateFnsLocale(i18n.language))
                : "—";
              const formattedTotal = formatCurrency(
                order.totalAmount,
                order.currency || "USD",
                i18n.language,
              );
              const detailUrl = PATH.RESTAURANT_ORDER_DETAIL.replace(":id", order.id);

              return (
                <TableRow
                  key={order.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest("a, button")) {
                      navigate(detailUrl);
                    }
                  }}
                  className="hover:bg-surface/60 cursor-pointer transition-colors"
                >
                  {/* Order Number */}
                  <TableCell className="text-ink font-mono text-sm font-bold">
                    <Link
                      to={detailUrl}
                      className="hover:text-accent transition-colors focus-visible:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>

                  {/* Order Type */}
                  <TableCell>
                    <div className="text-ink-muted flex items-center gap-1.5 text-xs">
                      <TypeIcon className="text-ink-subtle size-3.5 shrink-0" />
                      <span>{t(`types.${order.orderType}`, order.orderType)}</span>
                    </div>
                  </TableCell>

                  {/* Table / Destination */}
                  <TableCell className="text-ink text-sm font-medium">{destination}</TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>

                  {/* Items summary */}
                  <TableCell
                    className="text-ink-muted max-w-[200px] truncate text-xs"
                    title={summary}
                  >
                    {summary}
                  </TableCell>

                  {/* Elapsed / Placed At */}
                  <TableCell className="text-ink-subtle text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="size-3" />
                      <span>{relativeTime}</span>
                    </div>
                  </TableCell>

                  {/* Total Amount */}
                  <TableCell className="text-ink text-right font-mono text-sm font-bold whitespace-nowrap">
                    {formattedTotal}
                  </TableCell>

                  {/* Action Link */}
                  <TableCell className="text-center">
                    <Link
                      to={detailUrl}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`${t("list.viewDetails")}: ${order.orderNumber}`}
                      className="text-ink-subtle hover:bg-surface hover:text-ink inline-flex size-7 items-center justify-center rounded-md transition-colors"
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <div className="text-ink-muted flex flex-col items-center justify-between gap-3 px-2 py-1 text-xs sm:flex-row">
        <div>
          {t("list.paginationShowing", {
            from: fromIndex,
            to: toIndex,
            total: totalCount,
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 gap-1 px-2.5 text-xs"
          >
            <ChevronLeft className="size-3.5" />
            <span>{t("list.paginationPrev")}</span>
          </Button>

          <span className="text-ink px-1 font-mono text-xs font-medium">
            {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 gap-1 px-2.5 text-xs"
          >
            <span>{t("list.paginationNext")}</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
