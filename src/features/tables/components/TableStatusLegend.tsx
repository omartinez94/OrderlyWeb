import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import type { TableStatus } from "../../../types/catalog";

export interface TableStatusLegendProps {
  counts: Record<TableStatus | "all", number>;
  selectedStatus: "all" | TableStatus;
  onSelectStatus: (status: "all" | TableStatus) => void;
}

export function TableStatusLegend({
  counts,
  selectedStatus,
  onSelectStatus,
}: TableStatusLegendProps) {
  const { t } = useTranslation("restaurant");

  const statusItems: Array<{
    status: "all" | TableStatus;
    label: string;
    count: number;
    badgeStyle: string;
    dotStyle: string;
  }> = [
    {
      status: "all",
      label: t("tables.status.all", "All Tables"),
      count: counts.all ?? 0,
      badgeStyle: "border-border/60 bg-surface text-ink",
      dotStyle: "bg-ink-subtle",
    },
    {
      status: "Available",
      label: t("tables.status.available", "Available"),
      count: counts.Available ?? 0,
      badgeStyle: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      dotStyle: "bg-emerald-500",
    },
    {
      status: "Occupied",
      label: t("tables.status.occupied", "Occupied"),
      count: counts.Occupied ?? 0,
      badgeStyle: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400",
      dotStyle: "bg-blue-500",
    },
    {
      status: "Reserved",
      label: t("tables.status.reserved", "Reserved"),
      count: counts.Reserved ?? 0,
      badgeStyle: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      dotStyle: "bg-amber-500",
    },
    {
      status: "Needs Cleaning",
      label: t("tables.status.cleaning", "Needs Cleaning"),
      count: counts["Needs Cleaning"] ?? 0,
      badgeStyle: "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-400",
      dotStyle: "bg-slate-500",
    },
  ];

  return (
    <div
      role="group"
      aria-label="Table status filters"
      className="flex flex-wrap items-center gap-2"
    >
      {statusItems.map((item) => {
        const isSelected = selectedStatus === item.status;

        return (
          <button
            key={item.status}
            type="button"
            onClick={() => onSelectStatus(item.status)}
            aria-pressed={isSelected}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              "focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2",
              isSelected
                ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-primary"
                : "bg-surface hover:bg-surface-elevated text-ink border border-border/60",
            )}
          >
            <span className={cn("size-2 rounded-full", isSelected ? "bg-white" : item.dotStyle)} />
            <span>{item.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums",
                isSelected ? "bg-white/20 text-white" : "bg-surface-elevated text-ink-subtle",
              )}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
