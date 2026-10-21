import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HourlySalesMetric } from "../../../types/analytics";
import { formatCurrency } from "../../../utils/currency";
import { cn } from "../../../lib/utils";

export interface HourlySalesChartProps {
  data: HourlySalesMetric[];
  currency?: string;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    payload?: HourlySalesMetric;
    color?: string;
  }>;
  label?: string;
  currency?: string;
  locale?: string;
}

function HourlySalesTooltip({
  active,
  payload,
  label,
  currency = "USD",
  locale = "en",
}: CustomTooltipProps) {
  const { t } = useTranslation("restaurant");
  if (!active || !payload || payload.length === 0) return null;

  const metric = payload[0]?.payload;
  if (!metric) return null;

  return (
    <div className="bg-popover/95 border-border-subtle rounded-md border p-3 shadow-md backdrop-blur-xs">
      <div className="text-ink font-mono text-xs font-bold">{label}</div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-ink-muted">{t("analytics.charts.revenue")}:</span>
          <span className="text-ink font-mono font-semibold">
            {formatCurrency(metric.grossSales, currency, locale)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-ink-muted">{t("analytics.charts.orders")}:</span>
          <span className="text-ink font-mono font-semibold">{metric.orderCount}</span>
        </div>
        {metric.topItemName && (
          <div className="border-border-subtle/60 mt-1 flex items-center justify-between gap-4 border-t pt-1">
            <span className="text-ink-subtle text-[11px]">{t("analytics.charts.topItem")}:</span>
            <span className="text-primary text-[11px] font-semibold">{metric.topItemName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * HourlySalesChart — Recharts dual-axis bar chart displaying order count & gross revenue per hour.
 */
export function HourlySalesChart({ data, currency = "USD", className }: HourlySalesChartProps) {
  const { t, i18n } = useTranslation("restaurant");

  return (
    <div
      className={cn(
        "bg-card border-border-subtle flex flex-col justify-between rounded-lg border p-5 shadow-xs",
        className,
      )}
      data-testid="hourly-sales-chart"
    >
      <div className="mb-4">
        <h2 className="text-ink font-display text-sm font-bold tracking-tight">
          {t("analytics.charts.hourlySalesTitle")}
        </h2>
        <p className="text-ink-subtle mt-0.5 text-xs">
          {t("analytics.charts.hourlySalesSubtitle")}
        </p>
      </div>

      <div className="h-72 w-full min-w-0" data-testid="hourly-sales-chart-container">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={200}
          minHeight={200}
          initialDimension={{ width: 500, height: 288 }}
        >
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle, #e2e8f0)"
              opacity={0.6}
            />
            <XAxis
              dataKey="hour"
              stroke="var(--color-ink-muted, #64748b)"
              fontSize={11}
              tickLine={false}
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              yAxisId="sales"
              orientation="left"
              stroke="var(--color-ink-muted, #64748b)"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              stroke="var(--color-ink-muted, #64748b)"
              fontSize={11}
              tickLine={false}
              tick={{ fill: "currentColor" }}
            />
            <Tooltip content={<HourlySalesTooltip currency={currency} locale={i18n.language} />} />
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "12px",
                fontFamily: "ui-monospace, monospace",
              }}
            />
            <Bar
              yAxisId="sales"
              dataKey="grossSales"
              name={t("analytics.charts.revenue")}
              fill="var(--color-primary, #0f172a)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="orders"
              dataKey="orderCount"
              name={t("analytics.charts.orders")}
              fill="var(--color-service-teal, #0284c7)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
