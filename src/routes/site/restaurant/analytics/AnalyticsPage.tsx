/**
 * AnalyticsPage — `/site/restaurant/analytics`.
 *
 * Operational Analytics Dashboard & Kitchen Speed Telemetry.
 * Features executive KPI cards, hourly sales volume distributions,
 * category revenue mix (donut chart), and kitchen station prep speed heatmaps.
 */

import { useTranslation } from "react-i18next";
import { Activity, DollarSign, Receipt, TrendingUp, Timer, RefreshCw } from "lucide-react";
import { useRestaurantContext } from "../../../../components/RestaurantContext/useRestaurantContext";
import { useGetRestaurantQuery } from "../../../../app/api/catalog";
import {
  MetricKpiCard,
  HourlySalesChart,
  CategoryMixChart,
  StationSpeedTable,
  DateRangeSelector,
  useAnalyticsData,
} from "../../../../features/analytics";
import { Button } from "../../../../components/ui";
import { formatCurrency } from "../../../../utils/currency";

export function AnalyticsPage() {
  const { t, i18n } = useTranslation("restaurant");
  const { restaurantId: contextRestaurantId } = useRestaurantContext();
  const effectiveRestaurantId = contextRestaurantId ?? "r-001";

  const { data: restaurant } = useGetRestaurantQuery(effectiveRestaurantId);
  const currency = (restaurant as { currency?: string })?.currency ?? "USD";

  const {
    dateRange,
    setDateRange,
    summary,
    hourlySales,
    categoryMix,
    stationMetrics,
    isLoading,
    refetch,
  } = useAnalyticsData({ restaurantId: effectiveRestaurantId });

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="analytics-page">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
              <Activity className="size-4" aria-hidden="true" />
            </div>
            <h1 className="text-ink font-display text-xl font-bold tracking-tight">
              {t("analytics.title")}
            </h1>
          </div>
          <p className="text-ink-subtle mt-1 text-xs">{t("analytics.subtitle")}</p>
        </div>

        {/* Date / Shift Filter and Refresh Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="border-border-subtle hover:bg-surface h-9 gap-1.5 px-3 font-mono text-xs"
            aria-label={t("analytics.refresh")}
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">{t("analytics.refresh")}</span>
          </Button>
        </div>
      </div>

      {/* Top Operational KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Gross Sales */}
          <MetricKpiCard
            title={t("analytics.kpis.grossSales")}
            value={formatCurrency(summary.grossSales, currency, i18n.language)}
            icon={DollarSign}
            delta={summary.grossSalesDelta}
            deltaLabel={t("analytics.kpis.vsPrevious")}
          />

          {/* Total Orders */}
          <MetricKpiCard
            title={t("analytics.kpis.totalOrders")}
            value={summary.orderCount.toLocaleString()}
            icon={Receipt}
            delta={summary.orderCountDelta}
            deltaLabel={t("analytics.kpis.vsPrevious")}
          />

          {/* Average Ticket Size */}
          <MetricKpiCard
            title={t("analytics.kpis.averageTicket")}
            value={formatCurrency(summary.averageTicketSize, currency, i18n.language)}
            icon={TrendingUp}
            delta={summary.averageTicketSizeDelta}
            deltaLabel={t("analytics.kpis.vsPrevious")}
          />

          {/* Kitchen Average Prep Time */}
          <MetricKpiCard
            title={t("analytics.kpis.avgPrepTime")}
            value={`${summary.averagePrepTimeMinutes.toFixed(1)}m`}
            icon={Timer}
            delta={summary.averagePrepTimeDelta}
            deltaLabel={t("analytics.kpis.vsPrevious")}
            deltaInverted={true}
            target={t("analytics.kpis.targetPrepTime", {
              target: summary.targetPrepTimeMinutes.toFixed(0),
            })}
          />
        </div>
      </section>

      {/* Charts Grid */}
      <section aria-label="Visual Analytics Charts">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Hourly Sales & Volume Chart */}
          <HourlySalesChart data={hourlySales} currency={currency} />

          {/* Category Revenue Mix Donut Chart */}
          <CategoryMixChart data={categoryMix} currency={currency} />
        </div>
      </section>

      {/* Kitchen Station Speed Telemetry Heatmap Table */}
      <section aria-label="Kitchen Station Fulfillment Telemetry">
        <div className="mb-3">
          <h2 className="text-ink font-display text-base font-bold tracking-tight">
            {t("analytics.stations.title")}
          </h2>
          <p className="text-ink-subtle mt-0.5 text-xs">{t("analytics.stations.subtitle")}</p>
        </div>

        <StationSpeedTable stations={stationMetrics} />
      </section>
    </div>
  );
}
export default AnalyticsPage;
