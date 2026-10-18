import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "../../../components/ui";
import { useGetMenuQuery, useUpdateMenuItemAvailabilityMutation } from "../../../app/api/catalog";
import type { MenuItem } from "../../../types/catalog";

export interface UseMenuAvailabilityOptions {
  restaurantId: string;
}

export function useMenuAvailability({ restaurantId }: UseMenuAvailabilityOptions) {
  const { t } = useTranslation("restaurant");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: menu,
    isLoading,
    isError,
    refetch,
  } = useGetMenuQuery({ restaurantId }, { skip: !restaurantId });

  const [updateAvailability, { isLoading: isUpdating }] = useUpdateMenuItemAvailabilityMutation();

  const categories = useMemo(() => menu?.categories ?? [], [menu?.categories]);
  const allItems = useMemo(() => menu?.items ?? [], [menu?.items]);

  // Overall metrics
  const totalCount = allItems.length;
  const availableCount = useMemo(
    () => allItems.filter((i) => i.status === "available").length,
    [allItems],
  );
  const soldOutCount = totalCount - availableCount;

  // Filtered items based on category and search query
  const filteredItems = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      if (selectedCategoryId !== "all" && item.categoryId !== selectedCategoryId) {
        return false;
      }
      if (trimmed) {
        const matchesName = item.name.toLowerCase().includes(trimmed);
        const matchesWarning = item.ingredientWarning?.toLowerCase().includes(trimmed);
        const matchesDesc = item.description?.toLowerCase().includes(trimmed);
        return matchesName || matchesWarning || matchesDesc;
      }
      return true;
    });
  }, [allItems, selectedCategoryId, searchQuery]);

  const toggleAvailability = async (item: MenuItem) => {
    const nextAvailable = item.status !== "available";
    const statusLabel = nextAvailable ? t("menu.available") : t("menu.soldOut");

    try {
      await updateAvailability({
        id: item.id,
        isAvailable: nextAvailable,
        restaurantId,
      }).unwrap();

      toast.success(
        t("menu.statusUpdated", {
          name: item.name,
          status: statusLabel,
        }),
      );
    } catch {
      toast.error(
        t("menu.statusUpdateFailed", {
          name: item.name,
        }),
      );
    }
  };

  return {
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
    isError,
    isUpdating,
    refetch,
    toggleAvailability,
  };
}
