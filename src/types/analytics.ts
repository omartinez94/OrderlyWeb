/**
 * Analytics domain types matching Catalog.API GetMenuItemAnalyticsEndpoint contracts.
 */

export type AnalyticsDateRange = "today" | "yesterday" | "last7days" | "thisMonth";

export interface MenuItemAnalyticsDto {
  menuItemId: string;
  name: string;
  categoryName: string;
  unitsSold: number;
  grossRevenue: number;
  averagePrepTimeMinutes: number;
  estimatedPrepTimeMinutes: number;
  station: string;
}

export interface HourlySalesMetric {
  hour: string;
  orderCount: number;
  grossSales: number;
  topItemName?: string;
}

export interface CategoryRevenueMetric {
  categoryName: string;
  revenue: number;
  itemCount: number;
  percentage: number;
}

export interface StationSpeedMetric {
  station: string;
  orderCount: number;
  averagePrepTimeMinutes: number;
  targetPrepTimeMinutes: number;
  delayPercentage: number;
  isDelayed: boolean;
}

export interface AnalyticsSummary {
  grossSales: number;
  grossSalesDelta: number;
  orderCount: number;
  orderCountDelta: number;
  averageTicketSize: number;
  averageTicketSizeDelta: number;
  averagePrepTimeMinutes: number;
  targetPrepTimeMinutes: number;
  averagePrepTimeDelta: number;
}

export interface GetMenuItemAnalyticsParams {
  restaurantId: string;
  dateRange?: AnalyticsDateRange;
}

export interface GetMenuItemAnalyticsResponse {
  restaurantId: string;
  dateRange: string;
  summary: AnalyticsSummary;
  items: MenuItemAnalyticsDto[];
  hourlySales: HourlySalesMetric[];
  stationMetrics: StationSpeedMetric[];
}
