import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Users, Sparkles, ShoppingBag, Eye, Armchair } from "lucide-react";
import { Card, CardContent, Badge, Button } from "../../../components/ui";
import { cn } from "../../../lib/utils";
import type { Table } from "../../../types/catalog";

export interface TableCardProps {
  table: Table;
  isMerged?: boolean;
  onMarkCleaned?: (tableId: string) => void;
  onSelectTable?: (table: Table) => void;
}

export function TableCard({
  table,
  isMerged = false,
  onMarkCleaned,
  onSelectTable,
}: TableCardProps) {
  const { t } = useTranslation("restaurant");
  const status = table.status ?? "Available";
  const shape = (table.shape ?? "square").toLowerCase();

  const statusStyles: Record<
    string,
    { border: string; bg: string; text: string; badgeVariant: string }
  > = {
    Available: {
      border: "border-emerald-500/40 hover:border-emerald-500/70",
      bg: "bg-emerald-500/5",
      text: "text-emerald-700 dark:text-emerald-400",
      badgeVariant:
        "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    Occupied: {
      border: "border-blue-500/40 hover:border-blue-500/70",
      bg: "bg-blue-500/5",
      text: "text-blue-700 dark:text-blue-400",
      badgeVariant: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
    Reserved: {
      border: "border-amber-500/40 hover:border-amber-500/70",
      bg: "bg-amber-500/5",
      text: "text-amber-700 dark:text-amber-400",
      badgeVariant: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    "Needs Cleaning": {
      border: "border-slate-500/40 hover:border-slate-500/70",
      bg: "bg-slate-500/5",
      text: "text-slate-700 dark:text-slate-400",
      badgeVariant: "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-400",
    },
  };

  const currentStyle = statusStyles[status] ?? statusStyles.Available;

  const shapeStyles = cn(
    shape === "round" && "rounded-2xl",
    shape === "booth" && "border-t-4 border-t-amber-500/60",
    shape === "long" && "col-span-2",
  );

  return (
    <Card
      data-testid={`table-card-${table.tableNumber}`}
      className={cn(
        "relative flex flex-col justify-between transition-all duration-200 shadow-xs",
        currentStyle.border,
        currentStyle.bg,
        shapeStyles,
        isMerged && "border-dashed ring-2 ring-primary/40",
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Top Header: Table Number & Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-ink font-display text-lg font-bold tracking-tight">
              {table.tableNumber}
            </h2>
            {table.section && (
              <Badge variant="secondary" className="text-ink-subtle text-[10px] font-medium">
                {table.section}
              </Badge>
            )}
            {shape === "booth" && (
              <Badge variant="outline" className="text-ink-subtle gap-1 text-[10px]">
                <Armchair className="size-2.5" />
                Booth
              </Badge>
            )}
          </div>

          <Badge
            variant="outline"
            className={cn("text-[11px] font-semibold", currentStyle.badgeVariant)}
          >
            {status}
          </Badge>
        </div>

        {/* Capacity */}
        <div className="text-ink-subtle flex items-center gap-1.5 text-xs">
          <Users className="size-3.5" />
          <span className="font-mono tabular-nums">{table.capacity}</span>
          <span>
            {table.capacity === 1
              ? t("tables.guests_one", "guest")
              : t("tables.guests_other", "guests")}
          </span>
        </div>

        {/* Occupied State Details */}
        {status === "Occupied" && (
          <div className="border-border/60 bg-surface flex flex-col gap-1.5 rounded-md border p-2 text-xs">
            <span className="text-ink-subtle text-[11px]">Active Order</span>
            <span className="text-ink font-mono font-bold">
              {table.currentOrderId ? `#${table.currentOrderId}` : "In Progress"}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="border-border/50 mt-auto flex items-center justify-between border-t pt-2.5">
          {status === "Available" && (
            <Button
              asChild
              size="sm"
              variant="default"
              className="w-full gap-1.5 text-xs font-semibold"
            >
              <Link to={`/site/restaurant/orders/new?tableId=${encodeURIComponent(table.id)}`}>
                <ShoppingBag className="size-3.5" />
                Take Order
              </Link>
            </Button>
          )}

          {status === "Occupied" && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full gap-1.5 text-xs font-semibold"
            >
              <Link
                to={
                  table.currentOrderId
                    ? `/site/restaurant/orders/${encodeURIComponent(table.currentOrderId)}`
                    : `/site/restaurant/orders`
                }
              >
                <Eye className="size-3.5" />
                View Order
              </Link>
            </Button>
          )}

          {status === "Needs Cleaning" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkCleaned?.(table.id)}
              className="w-full gap-1.5 text-xs font-semibold"
            >
              <Sparkles className="size-3.5 text-amber-500" />
              Mark Cleaned
            </Button>
          )}

          {status === "Reserved" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectTable?.(table)}
              className="w-full gap-1.5 text-xs font-semibold"
            >
              Seat Reserved Party
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
