/**
 * OrderSplitBillPage — `/site/restaurant/orders/:id/split-bill`.
 *
 * Operational bill splitting and settlement simulation workstation:
 *   - Equal and Custom / By-Seat split balancing
 *   - Cent-balanced rounding engine
 *   - Cash tender calculator and change due readouts
 *   - Thermal receipt preview and print simulation
 */

import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useGetOrderQuery } from "../../../../app/api/orders";
import { OrderStatusBadge, SplitBillAssignment } from "../../../../features/orders";
import { Button, Skeleton } from "../../../../components/ui";
import { PATH } from "../../../../router/pathNames";
import { formatCurrency } from "../../../../utils/currency";

export function OrderSplitBillPage() {
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
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
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

  const detailUrl = PATH.RESTAURANT_ORDER_DETAIL.replace(":id", order.id);

  return (
    <div className="bg-surface text-ink min-h-[calc(100vh-64px)] font-sans antialiased">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Action & Status Bar */}
        <header className="border-border-subtle bg-surface-elevated flex flex-col gap-3 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="size-8 p-0">
              <Link to={detailUrl} aria-label="Back to order detail">
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
              <p className="text-ink-muted mt-0.5 text-xs">{t("split.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-ink-muted block text-[11px] font-semibold tracking-wider uppercase">
                Order Total
              </span>
              <span className="text-primary font-mono text-lg font-bold">
                {formatCurrency(order.totalAmount, order.currency || "USD", i18n.language)}
              </span>
            </div>
          </div>
        </header>

        {/* Bill Splitting Workstation */}
        <SplitBillAssignment order={order} />
      </main>
    </div>
  );
}
