import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CategoryRevenueMetric } from "../../../types/analytics";
import { formatCurrency } from "../../../utils/currency";
import { cn } from "../../../lib/utils";

export interface CategoryMixChartProps {
  data: CategoryRevenueMetric[];
  currency?: string;
  className?: string;
}

const CATEGORY_COLORS = [
  "var(--color-service-deep, #1d4ed8)",
  "var(--color-service-teal, #0284c7)",
  "var(--color-service-aqua, #0d9488)",
  "var(--color-service-amber, #d97706)",
  "var(--color-service-tangerine, #ea580c)",
  "var(--color-primary, #0f172a)",
];

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    payload?: CategoryRevenueMetric;
  }>;
  currency?: string;
  locale?: string;
}

function CategoryMixTooltip({
  active,
  payload,
  currency = "USD",
  locale = "en",
}: CustomPieTooltipProps) {
  const { t } = useTranslation("restaurant");
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-popover/95 border-border-subtle rounded-md border p-3 shadow-md backdrop-blur-xs">
      <div className="text-ink font-mono text-xs font-bold">{item.categoryName}</div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-ink-muted">{t("analytics.charts.revenue")}:</span>
          <span className="text-ink font-mono font-semibold">
            {formatCurrency(item.revenue, currency, locale)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-ink-muted">{t("analytics.charts.orders")}:</span>
          <span className="text-ink font-mono font-semibold">{item.itemCount}</span>
        </div>
        <div className="border-border-subtle/60 mt-1 flex items-center justify-between gap-4 border-t pt-1">
          <span className="text-ink-subtle text-[11px]">Share:</span>
          <span className="text-primary font-mono text-[11px] font-bold">
            {item.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * CategoryMixChart — Recharts donut chart visualizing revenue contribution per menu category.
 */
export function CategoryMixChart({ data, currency = "USD", className }: CategoryMixChartProps) {
  const { t, i18n } = useTranslation("restaurant");

  return (
    <div
      className={cn(
        "bg-card border-border-subtle flex flex-col justify-between rounded-lg border p-5 shadow-xs",
        className,
      )}
      data-testid="category-mix-chart"
    >
      <div className="mb-4">
        <h2 className="text-ink font-display text-sm font-bold tracking-tight">
          {t("analytics.charts.categoryMixTitle")}
        </h2>
        <p className="text-ink-subtle mt-0.5 text-xs">
          {t("analytics.charts.categoryMixSubtitle")}
        </p>
      </div>

      <div className="h-72 w-full min-w-0" data-testid="category-mix-chart-container">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={200}
          minHeight={200}
          initialDimension={{ width: 500, height: 288 }}
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`category-cell-${entry.categoryName}`}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  stroke="var(--color-surface-elevated, #ffffff)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CategoryMixTooltip currency={currency} locale={i18n.language} />} />
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "8px",
                fontFamily: "ui-monospace, monospace",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
