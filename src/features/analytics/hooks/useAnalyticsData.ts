import { useMemo, useState } from "react";
import { useGetMenuItemAnalyticsQuery } from "../../../app/api/catalog";
import type {
  AnalyticsDateRange,
  AnalyticsSummary,
  CategoryRevenueMetric,
  HourlySalesMetric,
  StationSpeedMetric,
} from "../../../types/analytics";

export interface UseAnalyticsDataOptions {
  restaurantId: string;
  initialDateRange?: AnalyticsDateRange;
}

export function useAnalyticsData({
  restaurantId,
  initialDateRange = "today",
}: UseAnalyticsDataOptions) {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>(initialDateRange);

  const { data, isLoading, isError, refetch } = useGetMenuItemAnalyticsQuery(
    { restaurantId, dateRange },
    { skip: !restaurantId },
  );

  // Computed / aggregated summary
  const summary: AnalyticsSummary = useMemo(() => {
    if (data?.summary) {
      return data.summary;
    }

    const items = data?.items ?? [];
    const totalSales = items.reduce((acc, item) => acc + item.grossRevenue, 0);
    const totalOrders = items.reduce((acc, item) => acc + item.unitsSold, 0);
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    const avgPrep =
      items.length > 0
        ? items.reduce((acc, item) => acc + item.averagePrepTimeMinutes, 0) / items.length
        : 0;

    return {
      grossSales: totalSales,
      grossSalesDelta: 0,
      orderCount: totalOrders,
      orderCountDelta: 0,
      averageTicketSize: avgTicket,
      averageTicketSizeDelta: 0,
      averagePrepTimeMinutes: avgPrep,
      targetPrepTimeMinutes: 12.0,
      averagePrepTimeDelta: 0,
    };
  }, [data]);

  // Hourly sales metrics
  const hourlySales: HourlySalesMetric[] = useMemo(() => {
    return data?.hourlySales ?? [];
  }, [data]);

  // Category revenue mix
  const categoryMix: CategoryRevenueMetric[] = useMemo(() => {
    const items = data?.items ?? [];
    const totalSales = items.reduce((acc, item) => acc + item.grossRevenue, 0);

    const categoryMap = new Map<string, { revenue: number; count: number }>();
    for (const item of items) {
      const cat = item.categoryName || "Other";
      const existing = categoryMap.get(cat) ?? { revenue: 0, count: 0 };
      existing.revenue += item.grossRevenue;
      existing.count += item.unitsSold;
      categoryMap.set(cat, existing);
    }

    const result: CategoryRevenueMetric[] = [];
    for (const [categoryName, stats] of categoryMap.entries()) {
      const percentage = totalSales > 0 ? (stats.revenue / totalSales) * 100 : 0;
      result.push({
        categoryName,
        revenue: stats.revenue,
        itemCount: stats.count,
        percentage,
      });
    }

    return result.sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  // Station speed telemetry metrics
  const stationMetrics: StationSpeedMetric[] = useMemo(() => {
    if (data?.stationMetrics && data.stationMetrics.length > 0) {
      return data.stationMetrics.map((sm) => {
        const isDelayed =
          sm.isDelayed ||
          (sm.targetPrepTimeMinutes > 0 &&
            sm.averagePrepTimeMinutes > sm.targetPrepTimeMinutes * 1.2);
        const delayPercentage =
          sm.targetPrepTimeMinutes > 0
            ? ((sm.averagePrepTimeMinutes - sm.targetPrepTimeMinutes) / sm.targetPrepTimeMinutes) *
              100
            : 0;
        return {
          ...sm,
          isDelayed,
          delayPercentage,
        };
      });
    }

    // Fallback: derive from items if stationMetrics is not returned directly
    const items = data?.items ?? [];
    const stationMap = new Map<
      string,
      { count: number; totalActual: number; totalTarget: number; entries: number }
    >();

    for (const item of items) {
      const st = item.station || "Expedite";
      const existing = stationMap.get(st) ?? {
        count: 0,
        totalActual: 0,
        totalTarget: 0,
        entries: 0,
      };
      existing.count += item.unitsSold;
      existing.totalActual += item.averagePrepTimeMinutes;
      existing.totalTarget += item.estimatedPrepTimeMinutes;
      existing.entries += 1;
      stationMap.set(st, existing);
    }

    const result: StationSpeedMetric[] = [];
    for (const [station, stats] of stationMap.entries()) {
      const avgActual = stats.entries > 0 ? stats.totalActual / stats.entries : 0;
      const avgTarget = stats.entries > 0 ? stats.totalTarget / stats.entries : 0;
      const isDelayed = avgTarget > 0 && avgActual > avgTarget * 1.2;
      const delayPercentage = avgTarget > 0 ? ((avgActual - avgTarget) / avgTarget) * 100 : 0;

      result.push({
        station,
        orderCount: stats.count,
        averagePrepTimeMinutes: avgActual,
        targetPrepTimeMinutes: avgTarget,
        delayPercentage,
        isDelayed,
      });
    }

    return result;
  }, [data]);

  return {
    dateRange,
    setDateRange,
    summary,
    hourlySales,
    categoryMix,
    stationMetrics,
    rawData: data,
    isLoading,
    isError,
    refetch,
  };
}
