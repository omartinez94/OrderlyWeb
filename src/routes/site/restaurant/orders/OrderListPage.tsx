/**
 * OrderListPage — `/site/restaurant/orders`.
 *
 * Operational dashboard for floor staff, cashiers, and managers to monitor,
 * search, filter, and navigate active and historical orders.
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRestaurantContext } from "../../../../components/RestaurantContext/useRestaurantContext";
import { useGetOrdersQuery } from "../../../../app/api/orders";
import { OrderFilterBar, OrderListTable, useOrderFilters } from "../../../../features/orders";
import { Button } from "../../../../components/ui";
import { AlertCircle, RefreshCw } from "lucide-react";

export function OrderListPage() {
  const { t } = useTranslation("orders");
  const { restaurantId: contextRestaurantId } = useRestaurantContext();
  const effectiveRestaurantId = contextRestaurantId ?? "r-001";

  const {
    status,
    orderType,
    query,
    page,
    pageSize,
    setStatus,
    setOrderType,
    setQuery,
    setPage,
    setPageSize,
    resetFilters,
  } = useOrderFilters();

  const { data, isLoading, isError, refetch } = useGetOrdersQuery({
    restaurantId: effectiveRestaurantId,
    pageIndex: page - 1,
    pageSize,
    status,
    orderType,
  });

  const paginatedResult = data?.orders;
  const rawOrders = paginatedResult?.data ?? [];
  const backendCount = paginatedResult?.count ?? 0;

  // Client-side text search filter across order number, customer, and table
  const filteredOrders = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return rawOrders;
    return rawOrders.filter((order) => {
      const matchOrderNumber = order.orderNumber.toLowerCase().includes(trimmed);
      const matchCustomer = order.customerId.toLowerCase().includes(trimmed);
      const matchTable = order.tableId ? order.tableId.toLowerCase().includes(trimmed) : false;
      const matchItems = order.orderItems?.some((item) =>
        item.menuItemName.toLowerCase().includes(trimmed),
      );
      return matchOrderNumber || matchCustomer || matchTable || matchItems;
    });
  }, [rawOrders, query]);

  const hasActiveFilters = Boolean(status || orderType || query.trim());
  const displayCount = hasActiveFilters ? filteredOrders.length : backendCount;

  return (
    <div className="bg-surface text-ink min-h-[calc(100vh-64px)] font-sans antialiased">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header telemetry and zone indicator */}
        <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">
              Restaurant Ops
            </p>
            <h1 className="font-display text-primary text-3xl font-bold tracking-tight">
              {t("list.title")}
            </h1>
            <p className="text-ink-muted mt-1 text-sm">
              {t("list.subtitle", { count: displayCount })}
            </p>
          </div>
        </header>

        {/* Filter controls */}
        <OrderFilterBar
          status={status}
          orderType={orderType}
          query={query}
          pageSize={pageSize}
          onStatusChange={setStatus}
          onOrderTypeChange={setOrderType}
          onQueryChange={setQuery}
          onPageSizeChange={setPageSize}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Error state */}
        {isError ? (
          <div className="border-danger/30 bg-danger/5 text-ink flex flex-col items-center justify-center rounded-xl border p-8 text-center">
            <AlertCircle className="text-danger size-8" />
            <h3 className="font-display text-danger mt-3 text-lg font-semibold">
              Failed to load orders
            </h3>
            <p className="text-ink-muted mt-1 max-w-sm text-sm">
              We encountered an issue fetching the latest orders from the ordering service.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4 gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        ) : (
          /* High-density orders table */
          <OrderListTable
            orders={filteredOrders}
            totalCount={displayCount}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={setPage}
            onResetFilters={hasActiveFilters ? resetFilters : undefined}
          />
        )}
      </main>
    </div>
  );
}
