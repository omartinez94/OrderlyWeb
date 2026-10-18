/**
 * MenuPage — `/site/restaurant/menu`.
 *
 * Operational menu availability dashboard for restaurant staff to monitor
 * category items, check ingredient limits, and toggle instant 86'd out-of-stock states.
 */

import { useTranslation } from "react-i18next";
import { Utensils, RefreshCw, CheckCircle2, Ban } from "lucide-react";
import { useRestaurantContext } from "../../../../components/RestaurantContext/useRestaurantContext";
import {
  CategoryTabList,
  MenuAvailabilityGrid,
  useMenuAvailability,
} from "../../../../features/menu";
import { Button, Badge } from "../../../../components/ui";

export function MenuPage() {
  const { t } = useTranslation("restaurant");
  const { restaurantId: contextRestaurantId } = useRestaurantContext();
  const effectiveRestaurantId = contextRestaurantId ?? "r-001";

  const {
    categories,
    allItems,
    filteredItems,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    totalCount,
    availableCount,
    soldOutCount,
    isLoading,
    isUpdating,
    refetch,
    toggleAvailability,
  } = useMenuAvailability({ restaurantId: effectiveRestaurantId });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header with Title and KPI Quick Counters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
              <Utensils className="size-4" />
            </div>
            <h1 className="text-ink font-display text-xl font-bold tracking-tight">
              {t("menu.title")}
            </h1>
          </div>
          <p className="text-ink-subtle mt-1 text-xs">{t("menu.subtitle")}</p>
        </div>

        {/* Action button and counters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Counters */}
          <div className="border-border/60 bg-surface flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-xs">
            <span className="text-ink-subtle text-xs">
              {t("menu.totalItems")}: <strong className="text-ink font-mono">{totalCount}</strong>
            </span>
            <span className="text-border">|</span>
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle2 className="size-3" />
              <span className="font-mono tabular-nums">{availableCount}</span>
            </Badge>
            {soldOutCount > 0 && (
              <Badge
                variant="outline"
                className="gap-1 border-orange-500/40 bg-orange-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-orange-700 dark:text-orange-400"
              >
                <Ban className="size-3" />
                <span className="font-mono tabular-nums">{soldOutCount}</span> 86'd
              </Badge>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            aria-label={t("menu.refresh")}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" />
            <span className="hidden sm:inline">{t("menu.refresh")}</span>
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryTabList
        categories={categories}
        items={allItems}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Item Availability Grid */}
      <MenuAvailabilityGrid
        items={filteredItems}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleAvailability={toggleAvailability}
        isLoading={isLoading}
        isUpdating={isUpdating}
      />
    </div>
  );
}
