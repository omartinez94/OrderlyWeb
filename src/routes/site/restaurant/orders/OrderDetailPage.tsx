/**
 * OrderDetailPage — `/site/restaurant/orders/:id`.
 *
 * Operational order inspection workstation:
 *   - Header metadata card with 5-stop status badge, type, table, and timestamps.
 *   - Item breakdown with seat numbers, prep statuses, and kitchen instructions.
 *   - Financial summary card and split bill link.
 *   - Chronological vertical timeline powered by order.activities.
 */

import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Receipt,
  Clock,
  CreditCard,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useGetOrderQuery } from "../../../../app/api/orders";
import { OrderStatusBadge, OrderItemRow, OrderTimeline } from "../../../../features/orders";
import { Button, Separator, Skeleton } from "../../../../components/ui";
import { PATH } from "../../../../router/pathNames";
import { formatCurrency } from "../../../../utils/currency";
import { formatDate, getDateFnsLocale } from "../../../../utils/date";
import type { OrderType } from "../../../../types/order";

const TYPE_ICONS: Record<OrderType, typeof UtensilsCrossed> = {
  DineIn: UtensilsCrossed,
  Takeout: ShoppingBag,
  Delivery: Bike,
};

export function OrderDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation("orders");

  const { data: order, isLoading, isError } = useGetOrderQuery(id, { skip: !id });

  if (isLoading) {
    return (
      <div className="bg-surface text-ink mx-auto min-h-[calc(100vh-64px)] max-w-7xl space-y-6 p-6 font-sans">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div className="space-y-4 lg:col-span-5">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-surface flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="text-danger mb-3 size-12" />
        <h2 className="font-display text-ink text-2xl font-bold">{t("detail.orderNotFound")}</h2>
        <p className="text-ink-muted mt-1 max-w-sm text-sm">{t("detail.orderNotFoundDesc")}</p>
        <Button asChild variant="outline" size="sm" className="mt-5">
          <Link to={PATH.RESTAURANT_ORDERS}>{t("detail.backToOrders")}</Link>
        </Button>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[order.orderType] ?? UtensilsCrossed;
  const splitBillUrl = PATH.RESTAURANT_ORDER_SPLIT.replace(":id", order.id);
  const destination =
    order.orderType === "DineIn" && order.tableId
      ? t("list.tableNumber", { number: order.tableId.replace(/^[a-zA-Z]-/, "") })
      : order.orderType === "Delivery"
        ? order.deliveryAddress?.street || t("types.Delivery")
        : t("types.Takeout");

  return (
    <div className="bg-surface text-ink min-h-[calc(100vh-64px)] font-sans antialiased">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Action & Status Bar */}
        <header className="border-border-subtle bg-surface-elevated flex flex-col gap-3 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="size-8 p-0">
              <Link to={PATH.RESTAURANT_ORDERS} aria-label="Back to orders">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-primary font-mono text-xl font-bold sm:text-2xl">
                  {order.orderNumber}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="text-ink-muted mt-1 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 font-medium">
                  <TypeIcon className="text-ink-subtle size-3.5" />
                  <span>{t(`types.${order.orderType}`, order.orderType)}</span>
                </div>
                <span>•</span>
                <span>{destination}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Link to={splitBillUrl}>
                <Receipt className="text-ink-subtle size-3.5" />
                <span>{t("detail.splitBill")}</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Items Breakdown */}
          <div className="flex flex-col gap-5 lg:col-span-7">
            <div className="border-border-subtle bg-surface-elevated space-y-4 rounded-xl border p-4 shadow-xs">
              <div className="border-border-subtle flex items-center justify-between border-b pb-3">
                <h2 className="font-display text-ink text-base font-bold">
                  {t("detail.items")} ({order.orderItems?.length ?? 0})
                </h2>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {order.orderItems?.map((item) => (
                  <OrderItemRow key={item.id} item={item} currency={order.currency} />
                ))}
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="border-border-subtle bg-surface mt-4 rounded-lg border p-3 text-xs">
                  <span className="text-ink-muted text-[10px] font-semibold tracking-wider uppercase">
                    {t("detail.notes")}
                  </span>
                  <p className="text-ink mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Telemetry, Financials, and Timeline */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            {/* Time Tracking Card */}
            <div className="border-border-subtle bg-surface-elevated space-y-3 rounded-xl border p-4 shadow-xs">
              <h2 className="font-display text-ink flex items-center gap-1.5 text-sm font-bold">
                <Calendar className="text-ink-subtle size-4" />
                <span>Lifecycle Telemetry</span>
              </h2>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {order.activities?.[0] && (
                  <div className="bg-surface/50 rounded-lg p-2">
                    <span className="text-ink-subtle block text-[10px] font-semibold uppercase">
                      {t("detail.placedAt")}
                    </span>
                    <span className="text-ink font-mono text-xs font-medium">
                      {formatDate(
                        order.activities[0].occurredAt,
                        "h:mm a",
                        getDateFnsLocale(i18n.language),
                      )}
                    </span>
                  </div>
                )}
                {order.confirmedAt && (
                  <div className="bg-surface/50 rounded-lg p-2">
                    <span className="text-ink-subtle block text-[10px] font-semibold uppercase">
                      {t("detail.confirmedAt")}
                    </span>
                    <span className="text-ink font-mono text-xs font-medium">
                      {formatDate(order.confirmedAt, "h:mm a", getDateFnsLocale(i18n.language))}
                    </span>
                  </div>
                )}
                {order.preparingStartedAt && (
                  <div className="bg-surface/50 rounded-lg p-2">
                    <span className="text-ink-subtle block text-[10px] font-semibold uppercase">
                      {t("detail.preparingStartedAt")}
                    </span>
                    <span className="text-ink font-mono text-xs font-medium">
                      {formatDate(
                        order.preparingStartedAt,
                        "h:mm a",
                        getDateFnsLocale(i18n.language),
                      )}
                    </span>
                  </div>
                )}
                {order.readyAt && (
                  <div className="bg-surface/50 rounded-lg p-2">
                    <span className="text-ink-subtle block text-[10px] font-semibold uppercase">
                      {t("detail.readyAt")}
                    </span>
                    <span className="text-ink font-mono text-xs font-medium">
                      {formatDate(order.readyAt, "h:mm a", getDateFnsLocale(i18n.language))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="border-border-subtle bg-surface-elevated space-y-3 rounded-xl border p-4 shadow-xs">
              <h2 className="font-display text-ink flex items-center gap-1.5 text-sm font-bold">
                <CreditCard className="text-ink-subtle size-4" />
                <span>Financial Settlement</span>
              </h2>

              <div className="space-y-1.5 text-xs">
                <div className="text-ink-muted flex justify-between">
                  <span>{t("detail.subtotal")}</span>
                  <span className="text-ink font-mono font-medium">
                    {formatCurrency(order.subtotal, order.currency || "USD", i18n.language)}
                  </span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                    <span>Discount ({order.discountCode || "Promo"})</span>
                    <span className="font-mono font-medium">
                      -
                      {formatCurrency(order.discountAmount, order.currency || "USD", i18n.language)}
                    </span>
                  </div>
                )}

                <div className="text-ink-muted flex justify-between">
                  <span>
                    {t("detail.tax")} ({(order.taxRate * 100).toFixed(0)}%)
                  </span>
                  <span className="text-ink font-mono font-medium">
                    {formatCurrency(order.taxAmount, order.currency || "USD", i18n.language)}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex items-center justify-between text-sm">
                  <span className="font-display text-ink font-bold">{t("detail.total")}</span>
                  <span className="text-primary font-mono text-lg font-bold">
                    {formatCurrency(order.totalAmount, order.currency || "USD", i18n.language)}
                  </span>
                </div>

                {order.payment && (
                  <div className="bg-surface/70 mt-3 flex items-center justify-between rounded-lg p-2 text-xs">
                    <span className="text-ink-subtle">{t("detail.paymentMethod")}</span>
                    <span className="text-ink font-mono font-medium">
                      {order.payment.brand} •••• {order.payment.lastFour}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Chronological Activity Timeline Card */}
            <div className="border-border-subtle bg-surface-elevated space-y-4 rounded-xl border p-4 shadow-xs">
              <h2 className="font-display text-ink border-border-subtle flex items-center gap-1.5 border-b pb-2 text-sm font-bold">
                <Clock className="text-ink-subtle size-4" />
                <span>{t("detail.timeline")}</span>
              </h2>

              <OrderTimeline activities={order.activities ?? []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
