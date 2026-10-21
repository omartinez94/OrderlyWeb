import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "../../../lib/utils";

export interface MetricKpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  delta?: number;
  deltaLabel?: string;
  deltaInverted?: boolean;
  target?: string;
  className?: string;
}

/**
 * MetricKpiCard — Chamfered high-density operational telemetry card.
 * Adheres to "The Stainless Line": monospace numbers, precision border styling,
 * and high heat for critical thresholds.
 */
export function MetricKpiCard({
  title,
  value,
  icon: Icon,
  subtitle,
  delta,
  deltaLabel,
  deltaInverted = false,
  target,
  className,
}: MetricKpiCardProps) {
  const hasDelta = delta !== undefined && Number.isFinite(delta);
  const isZero = hasDelta && Math.abs(delta) < 0.01;
  // If inverted (e.g. prep time), a negative delta is favorable (faster), positive is unfavorable (slower)
  const isPositive = hasDelta && delta > 0;
  const isFavorable = deltaInverted ? hasDelta && delta < 0 : isPositive;

  return (
    <div
      className={cn(
        "bg-card border-border-subtle relative flex flex-col justify-between rounded-lg border p-5 shadow-xs transition-colors",
        className,
      )}
      data-testid="metric-kpi-card"
    >
      {/* Header: Title and Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-ink-muted font-mono text-xs font-semibold tracking-wider uppercase">
          {title}
        </span>
        <div className="border-border-subtle bg-surface text-primary flex size-8 items-center justify-center rounded-md border shadow-2xs">
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </div>

      {/* Primary Value */}
      <div className="mt-3">
        <div className="text-ink font-mono text-2xl font-extrabold tracking-tight sm:text-3xl">
          {value}
        </div>
        {subtitle && <p className="text-ink-subtle mt-0.5 text-xs">{subtitle}</p>}
      </div>

      {/* Footer: Delta and Target */}
      {(hasDelta || target) && (
        <div className="border-border-subtle/60 mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          {hasDelta && (
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold",
                  isZero
                    ? "bg-surface text-ink-muted border-border-subtle border"
                    : isFavorable
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border"
                      : "border-accent/20 bg-accent/10 text-accent border",
                )}
              >
                {isZero ? (
                  <Minus className="size-3" aria-hidden="true" />
                ) : isPositive ? (
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="size-3" aria-hidden="true" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {delta.toFixed(1)}%
                </span>
              </span>
              {deltaLabel && <span className="text-ink-subtle text-xs">{deltaLabel}</span>}
            </div>
          )}

          {target && <span className="text-ink-subtle font-mono text-xs">{target}</span>}
        </div>
      )}
    </div>
  );
}
