import { Search, X, Layers, UtensilsCrossed } from "lucide-react";
import { Card, Input, Button, Skeleton } from "../../../components/ui";
import { TableCard } from "./TableCard";
import { TableStatusLegend } from "./TableStatusLegend";
import { MergedTableGroup } from "./MergedTableGroup";
import { MergeTablesDialog } from "./MergeTablesDialog";
import { cn } from "../../../lib/utils";
import type { Table, TableStatus } from "../../../types/catalog";
import type { MergedCluster } from "../types/floor";

export interface FloorPlanGridProps {
  tables: Table[];
  filteredTables: Table[];
  sections: string[];
  counts: Record<TableStatus | "all", number>;
  activeMergedClusters: MergedCluster[];
  availableTables: Table[];
  mergedTableIds: Set<string>;
  selectedStatus: "all" | TableStatus;
  onSelectStatus: (status: "all" | TableStatus) => void;
  selectedSection: string;
  onSelectSection: (section: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isMergeDialogOpen: boolean;
  onOpenMergeDialog: (open: boolean) => void;
  onMergeTables: (parentTableId: string, childTableId: string) => Promise<void>;
  onSplitCluster: (mergedTableId: string) => void;
  onMarkCleaned: (tableId: string) => void;
  isLoading?: boolean;
  isMerging?: boolean;
  isSplitting?: boolean;
}

export function FloorPlanGrid({
  filteredTables,
  sections,
  counts,
  activeMergedClusters,
  availableTables,
  mergedTableIds,
  selectedStatus,
  onSelectStatus,
  selectedSection,
  onSelectSection,
  searchQuery,
  onSearchChange,
  isMergeDialogOpen,
  onOpenMergeDialog,
  onMergeTables,
  onSplitCluster,
  onMarkCleaned,
  isLoading = false,
  isMerging = false,
  isSplitting = false,
}: FloorPlanGridProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col gap-4">
        {/* Section Tabs and Merge Action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="tablist"
            aria-label="Floor sections"
            className="flex items-center gap-2 overflow-x-auto pb-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedSection === "all"}
              onClick={() => onSelectSection("all")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2",
                selectedSection === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface hover:bg-surface-elevated text-ink border border-border/60",
              )}
            >
              All Sections
            </button>
            {sections.map((sec) => (
              <button
                key={sec}
                type="button"
                role="tab"
                aria-selected={selectedSection === sec}
                onClick={() => onSelectSection(sec)}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
                  "focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2",
                  selectedSection === sec
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-surface hover:bg-surface-elevated text-ink border border-border/60",
                )}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenMergeDialog(true)}
              disabled={availableTables.length < 2}
              className="gap-1.5 text-xs font-semibold"
            >
              <Layers className="text-primary size-3.5" />
              Merge Tables
            </Button>
          </div>
        </div>

        {/* Status Filter Legend and Text Search */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TableStatusLegend
            counts={counts}
            selectedStatus={selectedStatus}
            onSelectStatus={onSelectStatus}
          />

          <div className="relative w-full sm:w-64">
            <Search className="text-ink-subtle absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by table # or section..."
              aria-label="Search tables"
              className="pr-9 pl-9 text-xs"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="text-ink-subtle hover:text-ink absolute top-1/2 right-1 size-7 -translate-y-1/2 p-0"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Merged Clusters Active View */}
      {activeMergedClusters.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-ink font-display text-sm font-bold tracking-tight">
            Active Merged Clusters ({activeMergedClusters.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeMergedClusters.map((cluster) => (
              <MergedTableGroup
                key={cluster.mergedTable.id}
                cluster={cluster}
                onSplit={onSplitCluster}
                isSplitting={isSplitting}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tables Grid or Skeleton or Empty State */}
      {isLoading ? (
        <div
          data-testid="tables-grid-skeleton"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-4 h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredTables.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <UtensilsCrossed className="text-ink-subtle mb-3 size-10 stroke-1" />
          <h2 className="text-ink font-display text-base font-semibold">
            No tables match the current filter
          </h2>
          <p className="text-ink-subtle mt-1 text-xs">
            Try resetting your status or section filters.
          </p>
        </Card>
      ) : (
        <div
          data-testid="tables-grid"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              isMerged={mergedTableIds.has(table.id)}
              onMarkCleaned={onMarkCleaned}
            />
          ))}
        </div>
      )}

      {/* Merge Tables Modal */}
      <MergeTablesDialog
        open={isMergeDialogOpen}
        onOpenChange={onOpenMergeDialog}
        availableTables={availableTables}
        onMerge={onMergeTables}
        isMerging={isMerging}
      />
    </div>
  );
}
