/**
 * BrandListPage — displays all brands with search and active status filters.
 * SuperAdmin and RestaurantAdmin can access this view.
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useListBrandsQuery } from "../../../../app/api/catalog";
import { Button } from "../../../../components/ui";
import { ResourceHeader } from "../../../../components/Admin";
import { BrandList, useBrandFilters } from "../../../../features/brand";
import { usePermission } from "../../../../components/RouteGuards/usePermission";
import { PATH } from "../../../../router/pathNames";

export function BrandListPage() {
  const { t } = useTranslation("admin");
  const { query, active, setQuery, setActive } = useBrandFilters();
  const canCreate = usePermission("brands:create");

  const { data: brands = [], isLoading } = useListBrandsQuery({
    q: query || undefined,
    active,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <ResourceHeader
        title={t("brands.title")}
        subtitle={
          brands.length === 1
            ? t("brands.subtitle_one", { count: 1 })
            : t("brands.subtitle_other", { count: brands.length })
        }
        actions={
          canCreate ? (
            <Link to={PATH.ADMIN_BRAND_NEW}>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                {t("brands.new")}
              </Button>
            </Link>
          ) : undefined
        }
      />

      <BrandList
        brands={brands}
        isLoading={isLoading}
        query={query}
        onQueryChange={setQuery}
        activeFilter={active}
        onActiveFilterChange={setActive}
      />
    </div>
  );
}
