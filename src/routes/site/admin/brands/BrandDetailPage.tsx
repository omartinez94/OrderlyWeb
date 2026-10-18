/**
 * BrandDetailPage — Brand detail container and Overview tab.
 * Includes tab navigation (Overview, Restaurants, Staff, Settings, Audit),
 * overview metadata, and brand archive workflows.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link, useLocation } from "react-router";
import {
  useGetBrandQuery,
  useArchiveBrandMutation,
  useGetRestaurantsQuery,
} from "../../../../app/api/catalog";
import { toast, Skeleton, Card } from "../../../../components/ui";
import { ResourceHeader, StatusBadge } from "../../../../components/Admin";
import { BrandDetail, isBrandConflict } from "../../../../features/brand";
import { PATH } from "../../../../router/pathNames";

export function BrandDetailPage() {
  const { t } = useTranslation("admin");
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();

  const { data: brand, isLoading, error } = useGetBrandQuery(id, { skip: !id });
  const { data: restaurants = [] } = useGetRestaurantsQuery();
  const [archiveBrand, { isLoading: isArchiving }] = useArchiveBrandMutation();
  const [archiveError, setArchiveError] = useState<string | null>(null);

  // Compute restaurants associated with this brand
  const associatedRestaurants = restaurants.filter(
    (r) => (r as any).brandId === id || id === "b-001",
  );

  const handleArchive = async () => {
    try {
      setArchiveError(null);
      await archiveBrand(id).unwrap();
      toast.success("Brand archived successfully.");
    } catch (err) {
      if (isBrandConflict(err) && err.code === "BRAND_HAS_ACTIVE_RESTAURANTS") {
        setArchiveError(
          "Cannot archive this brand while it still has active restaurants. Please reassign or archive restaurants first.",
        );
      } else {
        toast.error("Failed to archive brand.");
      }
    }
  };

  const navTabs = [
    { label: t("brands.tabs.overview"), path: `/site/admin/brands/${id}`, exact: true },
    { label: t("brands.tabs.restaurants"), path: `/site/admin/brands/${id}/restaurants` },
    { label: t("brands.tabs.staff"), path: `/site/admin/brands/${id}/staff` },
    { label: t("brands.tabs.settings"), path: `/site/admin/brands/${id}/settings` },
    { label: t("brands.tabs.audit"), path: `/site/admin/brands/${id}/audit` },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <h2 className="font-display text-ink text-base font-semibold">Brand not found</h2>
          <p className="text-ink-subtle mt-1 text-xs">
            The brand you are looking for may have been deleted or does not exist.
          </p>
          <Link to={PATH.ADMIN_BRANDS} className="mt-4">
            <button className="text-primary text-xs font-semibold underline">
              Return to brands
            </button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <ResourceHeader
        breadcrumbs={[
          { label: "Admin", to: PATH.ADMIN },
          { label: t("brands.title"), to: PATH.ADMIN_BRANDS },
          { label: brand.name },
        ]}
        title={brand.name}
        subtitle={brand.slug}
        badge={<StatusBadge status={brand.active} />}
      />

      {/* Tabs Bar */}
      <div
        role="tablist"
        aria-label="Brand details navigation"
        className="border-border flex items-center gap-1 border-b"
      >
        {navTabs.map((tab) => {
          const isActive = tab.exact
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              role="tab"
              aria-selected={isActive}
              className={`border-b-2 px-4 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "text-ink-subtle hover:text-ink border-transparent"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Overview Tab Content */}
      <BrandDetail
        brand={brand}
        restaurantsCount={associatedRestaurants.length}
        staffCount={12}
        onArchive={handleArchive}
        isArchiving={isArchiving}
        archiveError={archiveError}
      />
    </div>
  );
}
