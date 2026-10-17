/**
 * CatalogItemPicker — visual menu catalog grid for the POS Order Creator.
 *
 * Implements category carousel filtering, real-time item search,
 * "86'd" availability indicators, and interactive item addition.
 */

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import { useGetMenuQuery } from "../../../app/api/catalog";
import { Input, Skeleton, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../utils/currency";
import type { MenuItem } from "../../../types/catalog";
import { cn } from "../../../lib/utils";

export interface CatalogItemPickerProps {
  restaurantId: string;
  onSelectItem: (item: MenuItem) => void;
  onOpenModifiers: (item: MenuItem) => void;
  currency?: string;
}

export function CatalogItemPicker({
  restaurantId,
  onSelectItem,
  onOpenModifiers,
  currency = "USD",
}: CatalogItemPickerProps) {
  const { t, i18n } = useTranslation("orders");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: menu,
    isLoading,
    isError,
  } = useGetMenuQuery({ restaurantId }, { skip: !restaurantId });

  const categories = useMemo(() => menu?.categories ?? [], [menu?.categories]);
  const allItems = useMemo(() => menu?.items ?? [], [menu?.items]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (selectedCategoryId !== "all" && item.categoryId !== selectedCategoryId) {
        return false;
      }
      if (searchQuery.trim()) {
        return item.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });
  }, [allItems, selectedCategoryId, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Category carousel */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="text-ink-subtle absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("create.searchMenu")}
            aria-label={t("create.searchMenu")}
            className="pl-9"
          />
        </div>

        {/* Horizontal Category Carousel */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Menu categories"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategoryId === "all"}
            onClick={() => setSelectedCategoryId("all")}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-medium transition-all whitespace-nowrap",
              selectedCategoryId === "all"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "border border-border-subtle bg-surface-elevated text-ink-muted hover:border-border-strong hover:text-ink",
            )}
          >
            {t("create.allCategories")}
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-medium transition-all whitespace-nowrap",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border border-border-subtle bg-surface-elevated text-ink-muted hover:border-border-strong hover:text-ink",
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Menu Items */}
      {isLoading ? (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          data-testid="catalog-loading-skeleton"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skel-${i}`}
              className="border-border-subtle bg-surface-elevated flex flex-col gap-2 rounded-xl border p-3"
            >
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="size-7 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="border-danger/30 bg-danger/5 text-ink flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <p className="text-danger text-sm font-medium">Failed to load menu catalog</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border-border-subtle bg-surface-elevated/40 text-ink-muted flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <UtensilsCrossed className="text-ink-subtle size-8" />
          <p className="mt-2 text-sm">No items found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const isSoldOut = item.status === "sold_out" || item.status === "hidden";
            const formattedPrice = formatCurrency(item.priceCents / 100, currency, i18n.language);

            return (
              <div
                key={item.id}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all shadow-xs",
                  isSoldOut
                    ? "border-border-subtle bg-surface/60 opacity-60 cursor-not-allowed"
                    : "border-border-subtle bg-surface-elevated hover:border-primary/40 hover:shadow-sm cursor-pointer",
                )}
                onClick={() => {
                  if (!isSoldOut) {
                    onSelectItem(item);
                  }
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-ink group-hover:text-primary line-clamp-2 font-sans text-sm font-semibold transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  {isSoldOut && (
                    <Badge variant="destructive" className="mt-2 px-1.5 py-0 text-[10px]">
                      {t("create.outOfStock")}
                    </Badge>
                  )}
                </div>

                <div className="border-border-subtle/50 mt-4 flex items-center justify-between border-t pt-2">
                  <span className="text-ink font-mono text-sm font-bold">{formattedPrice}</span>

                  {!isSoldOut && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Customize ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenModifiers(item);
                        }}
                        className="border-border-subtle bg-surface text-ink-muted hover:text-ink hover:border-border-strong inline-flex size-7 items-center justify-center rounded-md border transition-colors"
                      >
                        <SlidersHorizontal className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Add ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex size-7 items-center justify-center rounded-md shadow-xs transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
