import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../../components/ui";
import { cn } from "../../../lib/utils";
import { MenuItemStatus, type MenuCategory, type MenuItem } from "../../../types/catalog";

export interface CategoryTabListProps {
  categories: MenuCategory[];
  items: MenuItem[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryTabList({
  categories,
  items,
  selectedCategoryId,
  onSelectCategory,
}: CategoryTabListProps) {
  const { t } = useTranslation("restaurant");

  // Calculate per-category 86'd counts
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; soldOut: number }>();

    for (const item of items) {
      const current = map.get(item.categoryId) ?? { total: 0, soldOut: 0 };
      current.total += 1;
      if (item.status === MenuItemStatus.SoldOut) {
        current.soldOut += 1;
      }
      map.set(item.categoryId, current);
    }

    return map;
  }, [items]);

  const totalSoldOut = useMemo(
    () => items.filter((i) => i.status === MenuItemStatus.SoldOut).length,
    [items],
  );

  return (
    <div
      role="tablist"
      aria-label={t("menu.allCategories")}
      className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={selectedCategoryId === "all"}
        onClick={() => onSelectCategory("all")}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
          "focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2",
          selectedCategoryId === "all"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "bg-surface hover:bg-surface-elevated text-ink hover:text-ink-strong border border-border/50",
        )}
      >
        <span>{t("menu.allCategories")}</span>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
            selectedCategoryId === "all"
              ? "bg-white/20 text-white"
              : "bg-surface-elevated text-ink-subtle",
          )}
        >
          {items.length}
        </span>
        {totalSoldOut > 0 && (
          <Badge
            variant="outline"
            className="border-orange-500/40 bg-orange-500/10 px-1 py-0 text-[10px] text-orange-700 tabular-nums dark:text-orange-400"
          >
            {totalSoldOut} 86'd
          </Badge>
        )}
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        const stats = categoryStats.get(cat.id) ?? { total: 0, soldOut: 0 };

        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2",
              isSelected
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-surface hover:bg-surface-elevated text-ink hover:text-ink-strong border border-border/50",
            )}
          >
            <span>{cat.name}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                isSelected ? "bg-white/20 text-white" : "bg-surface-elevated text-ink-subtle",
              )}
            >
              {stats.total}
            </span>
            {stats.soldOut > 0 && (
              <Badge
                variant="outline"
                className="border-orange-500/40 bg-orange-500/10 px-1 py-0 text-[10px] text-orange-700 tabular-nums dark:text-orange-400"
              >
                {stats.soldOut} 86'd
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
