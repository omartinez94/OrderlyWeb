import { useTranslation } from "react-i18next";
import { Search, X, UtensilsCrossed, CheckCircle2, Ban } from "lucide-react";
import { Card, CardContent, Badge, Input, Button, Switch, Skeleton } from "../../../components/ui";
import { IngredientWarningBadge } from "./IngredientWarningBadge";
import { formatCurrency } from "../../../utils/currency";
import { cn } from "../../../lib/utils";
import { MenuItemStatus, type MenuCategory, type MenuItem } from "../../../types/catalog";

export interface MenuAvailabilityGridProps {
  items: MenuItem[];
  categories: MenuCategory[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleAvailability: (item: MenuItem) => void;
  isLoading?: boolean;
  isUpdating?: boolean;
  currency?: string;
}

export function MenuAvailabilityGrid({
  items,
  categories,
  searchQuery,
  onSearchChange,
  onToggleAvailability,
  isLoading = false,
  isUpdating = false,
  currency = "USD",
}: MenuAvailabilityGridProps) {
  const { t, i18n } = useTranslation("restaurant");

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-4">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="text-ink-subtle absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("menu.searchPlaceholder")}
            aria-label={t("menu.searchPlaceholder")}
            className="pr-9 pl-9"
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
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Grid or Skeleton or Empty State */}
      {isLoading ? (
        <div
          data-testid="menu-grid-skeleton"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <div className="border-border/50 flex items-center justify-between border-t pt-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <UtensilsCrossed className="text-ink-subtle mb-3 size-10 stroke-1" />
          <h2 className="text-ink font-display text-base font-semibold">
            {t("menu.noItemsFound")}
          </h2>
          <p className="text-ink-subtle mt-1 text-xs">{t("menu.noItemsMatchFilter")}</p>
        </Card>
      ) : (
        <div
          data-testid="menu-items-grid"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {items.map((item) => {
            const isAvailable = item.status === MenuItemStatus.Available;
            const categoryName = categoryMap.get(item.categoryId) ?? "";

            return (
              <Card
                key={item.id}
                data-testid={`menu-card-${item.id}`}
                className={cn(
                  "relative flex flex-col justify-between overflow-hidden transition-all duration-200",
                  !isAvailable
                    ? "bg-surface-elevated/40 border-border/70 opacity-80"
                    : "bg-surface hover:border-primary/40",
                )}
              >
                <CardContent className="flex flex-1 flex-col gap-2.5 p-4">
                  {/* Top row: Category and Status badge */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="secondary"
                      className="text-ink-subtle max-w-[130px] truncate text-[11px] font-medium"
                    >
                      {categoryName}
                    </Badge>

                    {isAvailable ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="size-3" />
                        {t("menu.available")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 border-orange-500/40 bg-orange-500/10 text-[11px] font-semibold text-orange-700 dark:text-orange-400"
                      >
                        <Ban className="size-3" />
                        {t("menu.soldOut")}
                      </Badge>
                    )}
                  </div>

                  {/* Item Name & Description */}
                  <div className="flex flex-col">
                    <h2
                      className={cn(
                        "font-display text-sm font-semibold tracking-tight",
                        isAvailable ? "text-ink" : "text-ink-subtle line-through",
                      )}
                    >
                      {item.name}
                    </h2>
                    {item.description && (
                      <p className="text-ink-subtle mt-0.5 line-clamp-2 text-xs">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Ingredient Warnings / Substitution Badges */}
                  <IngredientWarningBadge
                    warning={item.ingredientWarning}
                    autoSubstituted={item.autoSubstituted}
                  />

                  {/* Price */}
                  <div className="mt-auto pt-2">
                    <span className="text-ink font-mono text-xs font-semibold tabular-nums">
                      {formatCurrency(item.priceCents / 100, currency, i18n.language)}
                    </span>
                  </div>

                  {/* Instant 86'd Toggle Switch Row */}
                  <div className="border-border/60 flex items-center justify-between border-t pt-2.5">
                    <span className="text-ink-subtle text-xs font-medium">
                      {isAvailable ? t("menu.available") : t("menu.soldOut")}
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={() => onToggleAvailability(item)}
                        disabled={isUpdating}
                        aria-label={t("menu.toggleAria", { name: item.name })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
