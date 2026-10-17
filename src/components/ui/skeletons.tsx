import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

export interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function DataTableSkeleton({ rows = 5, columns = 4, className }: DataTableSkeletonProps) {
  return (
    <div className={cn("w-full space-y-3", className)} data-testid="data-table-skeleton">
      <div className="flex items-center justify-between pb-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="border-border/60 bg-surface-overlay rounded-md border p-4">
        {/* Table header */}
        <div className="border-border/40 flex gap-4 border-b pb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
        {/* Table rows */}
        <div className="space-y-3 pt-3">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={`row-${r}`} className="flex items-center gap-4 py-2">
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton
                  key={`cell-${r}-${c}`}
                  className={cn("h-4 flex-1", c === 0 && "max-w-[120px]")}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface KpiCardSkeletonProps {
  className?: string;
}

export function KpiCardSkeleton({ className }: KpiCardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-surface-overlay p-5 space-y-3 shadow-sm",
        className,
      )}
      data-testid="kpi-card-skeleton"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export interface TicketCardSkeletonProps {
  className?: string;
}

export function TicketCardSkeleton({ className }: TicketCardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-surface-overlay p-4 space-y-4 shadow-sm w-full max-w-sm",
        className,
      )}
      data-testid="ticket-card-skeleton"
    >
      <div className="border-border/40 flex items-center justify-between border-b pb-3">
        <div className="space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2 py-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="border-border/40 flex items-center justify-between border-t pt-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}
