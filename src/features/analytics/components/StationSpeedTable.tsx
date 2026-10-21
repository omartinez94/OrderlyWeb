import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, Flame } from "lucide-react";
import type { StationSpeedMetric } from "../../../types/analytics";
import { cn } from "../../../lib/utils";

export interface StationSpeedTableProps {
  stations: StationSpeedMetric[];
  className?: string;
}

/**
 * StationSpeedTable — Kitchen station speed telemetry table.
 * Compares average actual prep time against target estimates across kitchen stations,
 * flagging bottlenecks exceeding 120% of target.
 */
export function StationSpeedTable({ stations, className }: StationSpeedTableProps) {
  const { t } = useTranslation("restaurant");

  const bottleneckStations = stations.filter(
    (s) =>
      s.isDelayed ||
      (s.targetPrepTimeMinutes > 0 && s.averagePrepTimeMinutes > s.targetPrepTimeMinutes * 1.2),
  );

  return (
    <div className={cn("space-y-4", className)} data-testid="station-speed-table">
      {/* Bottleneck Alert Banner if any station exceeds 120% target */}
      {bottleneckStations.length > 0 ? (
        <div
          role="alert"
          aria-live="polite"
          className="border-accent/40 bg-accent/5 text-accent flex items-start gap-3 rounded-lg border p-3.5 shadow-2xs"
        >
          <div className="bg-accent/15 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md">
            <Flame className="size-3.5" aria-hidden="true" />
          </div>
          <div className="flex-1 text-xs">
            <span className="font-semibold">{t("analytics.stations.bottleneckWarning")}: </span>
            <span>
              {bottleneckStations
                .map(
                  (s) =>
                    `${s.station} (${s.averagePrepTimeMinutes.toFixed(1)}m / ${s.targetPrepTimeMinutes.toFixed(1)}m target)`,
                )
                .join(", ")}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-700 shadow-2xs dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          <span>{t("analytics.stations.allOnTrack")}</span>
        </div>
      )}

      {/* Telemetry Table */}
      <div className="border-border-subtle bg-card overflow-hidden rounded-lg border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-border-subtle text-ink-muted border-b font-mono text-[11px] font-semibold tracking-wider uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">
                  {t("analytics.stations.station")}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  {t("analytics.stations.ordersPrepared")}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  {t("analytics.stations.actualTime")}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  {t("analytics.stations.targetTime")}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  {t("analytics.stations.variance")}
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  {t("analytics.stations.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {stations.map((metric) => {
                const target = metric.targetPrepTimeMinutes;
                const actual = metric.averagePrepTimeMinutes;
                const isOver120 = metric.isDelayed || (target > 0 && actual > target * 1.2);
                const variancePct = target > 0 ? ((actual - target) / target) * 100 : 0;
                const isVariancePositive = variancePct > 0;

                return (
                  <tr
                    key={metric.station}
                    className={cn(
                      "transition-colors hover:bg-surface/50",
                      isOver120 && "bg-accent/5",
                    )}
                  >
                    {/* Station Name */}
                    <td className="px-4 py-3.5">
                      <div className="text-ink flex items-center gap-2 font-medium">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            isOver120 ? "bg-accent animate-pulse" : "bg-emerald-500",
                          )}
                          aria-hidden="true"
                        />
                        <span className="font-mono font-semibold">{metric.station}</span>
                      </div>
                    </td>

                    {/* Orders Prepared */}
                    <td className="text-ink px-4 py-3.5 text-right font-mono">
                      {metric.orderCount}
                    </td>

                    {/* Actual Time */}
                    <td
                      className={cn(
                        "px-4 py-3.5 text-right font-mono font-semibold",
                        isOver120 ? "text-accent" : "text-ink",
                      )}
                    >
                      {actual.toFixed(1)} min
                    </td>

                    {/* Target Time */}
                    <td className="text-ink-muted px-4 py-3.5 text-right font-mono">
                      {target.toFixed(1)} min
                    </td>

                    {/* Variance */}
                    <td className="px-4 py-3.5 text-right font-mono">
                      <span
                        className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-xs font-semibold",
                          isOver120
                            ? "bg-accent/15 text-accent"
                            : isVariancePositive
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                        )}
                      >
                        {isVariancePositive ? "+" : ""}
                        {variancePct.toFixed(1)}%
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 text-center">
                      {isOver120 ? (
                        <span className="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold">
                          <AlertTriangle className="size-3" aria-hidden="true" />
                          <span>
                            {t("analytics.stations.bottleneck", {
                              pct: Math.round(variancePct),
                            })}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" aria-hidden="true" />
                          <span>{t("analytics.stations.onTrack")}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
