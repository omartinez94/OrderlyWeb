/**
 * TablesPage — `/site/restaurant/tables`.
 *
 * Operational floor management dashboard for hosts and floor managers to view table
 * occupancy, merge clusters for large parties, seat walk-ins, and inspect orders.
 */

import { useTranslation } from "react-i18next";
import { Grid, RefreshCw } from "lucide-react";
import { useRestaurantContext } from "../../../../components/RestaurantContext/useRestaurantContext";
import { FloorPlanGrid, useFloorPlan } from "../../../../features/tables";
import { Button } from "../../../../components/ui";

export function TablesPage() {
  const { t } = useTranslation("restaurant");
  const { restaurantId: contextRestaurantId } = useRestaurantContext();
  const effectiveRestaurantId = contextRestaurantId ?? "r-001";

  const {
    tables,
    filteredTables,
    sections,
    counts,
    activeMergedClusters,
    availableTables,
    mergedTableIds,
    selectedStatus,
    setSelectedStatus,
    selectedSection,
    setSelectedSection,
    searchQuery,
    setSearchQuery,
    isMergeDialogOpen,
    setIsMergeDialogOpen,
    isLoading,
    isMerging,
    isSplitting,
    markCleaned,
    mergeTables,
    splitCluster,
    refetchAll,
  } = useFloorPlan({ restaurantId: effectiveRestaurantId });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
              <Grid className="size-4" />
            </div>
            <h1 className="text-ink font-display text-xl font-bold tracking-tight">
              {t("tables.title", "Tables & Floor Plan")}
            </h1>
          </div>
          <p className="text-ink-subtle mt-1 text-xs">
            {t("tables.subtitle_other", { count: tables.length })} • Live dining room map and
            cluster management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetchAll}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" />
            Refresh Floor
          </Button>
        </div>
      </div>

      {/* Main Floor Plan Grid */}
      <FloorPlanGrid
        tables={tables}
        filteredTables={filteredTables}
        sections={sections}
        counts={counts}
        activeMergedClusters={activeMergedClusters}
        availableTables={availableTables}
        mergedTableIds={mergedTableIds}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        selectedSection={selectedSection}
        onSelectSection={setSelectedSection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMergeDialogOpen={isMergeDialogOpen}
        onOpenMergeDialog={setIsMergeDialogOpen}
        onMergeTables={mergeTables}
        onSplitCluster={splitCluster}
        onMarkCleaned={markCleaned}
        isLoading={isLoading}
        isMerging={isMerging}
        isSplitting={isSplitting}
      />
    </div>
  );
}
