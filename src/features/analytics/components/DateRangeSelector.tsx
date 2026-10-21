import { useTranslation } from "react-i18next";
import type { AnalyticsDateRange } from "../../../types/analytics";
import { cn } from "../../../lib/utils";

export interface DateRangeSelectorProps {
  value: AnalyticsDateRange;
  onChange: (value: AnalyticsDateRange) => void;
  className?: string;
}

const RANGES: AnalyticsDateRange[] = ["today", "yesterday", "last7days", "thisMonth"];

/**
 * DateRangeSelector — Segmented control for filtering operational analytics by shift / time window.
 */
export function DateRangeSelector({ value, onChange, className }: DateRangeSelectorProps) {
  const { t } = useTranslation("restaurant");

  return (
    <div
      role="radiogroup"
      aria-label={t("analytics.dateRange.label")}
      className={cn(
        "bg-surface border-border-subtle inline-flex items-center rounded-lg border p-1 shadow-2xs",
        className,
      )}
    >
      {RANGES.map((range) => {
        const isSelected = value === range;
        return (
          <button
            key={range}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(range)}
            className={cn(
              "rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isSelected
                ? "bg-card text-ink border-border-subtle shadow-xs font-semibold border"
                : "text-ink-muted hover:text-ink hover:bg-surface-elevated/60",
            )}
          >
            {t(`analytics.dateRange.${range}`)}
          </button>
        );
      })}
    </div>
  );
}
