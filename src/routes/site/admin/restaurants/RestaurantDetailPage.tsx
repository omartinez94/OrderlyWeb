/**
 * RestaurantDetailPage — `/site/admin/restaurants/:id`.
 * Overview tab container for managing an individual restaurant.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link, useLocation } from "react-router";
import {
  useGetAdminRestaurantQuery,
  useArchiveRestaurantMutation,
  isRestaurantConflict,
  AdminRestaurantDetailComponent,
} from "../../../../features/restaurant";
import { ResourceHeader, StatusBadge } from "../../../../components/Admin";
import { Card, Skeleton, toast } from "../../../../components/ui";
import { PATH } from "../../../../router/pathNames";

export function RestaurantDetailPage() {
  const { t } = useTranslation("admin");
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();

  const { data: restaurant, isLoading, error } = useGetAdminRestaurantQuery(id, { skip: !id });
  const [archiveRestaurant, { isLoading: isArchiving }] = useArchiveRestaurantMutation();
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const handleArchive = async () => {
    try {
      setArchiveError(null);
      await archiveRestaurant({ id, brandId: restaurant?.brandId }).unwrap();
      toast.success("Restaurant archived successfully.");
    } catch (err) {
      if (isRestaurantConflict(err) && err.data.code === "RESTAURANT_HAS_ACTIVE_STAFF") {
        setArchiveError(
          "Cannot archive this restaurant while active staff members are still assigned. Please reassign staff first.",
        );
      } else {
        toast.error("Failed to archive restaurant.");
      }
    }
  };

  const navTabs = [
    { label: t("restaurants.tabs.overview"), path: `/site/admin/restaurants/${id}`, exact: true },
    { label: t("restaurants.tabs.staff"), path: `/site/admin/restaurants/${id}/staff` },
    { label: t("restaurants.tabs.settings"), path: `/site/admin/restaurants/${id}/settings` },
    { label: t("restaurants.tabs.audit"), path: `/site/admin/restaurants/${id}/audit` },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <h2 className="font-display text-ink text-base font-semibold">Restaurant not found</h2>
          <p className="text-ink-subtle mt-1 text-xs">
            The restaurant you are looking for may have been deleted or does not exist.
          </p>
          <Link to={PATH.ADMIN_RESTAURANTS} className="mt-4">
            <button className="text-primary text-xs font-semibold underline">
              Return to restaurants
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
          { label: t("restaurants.title"), to: PATH.ADMIN_RESTAURANTS },
          { label: restaurant.name },
        ]}
        title={restaurant.name}
        subtitle={`${restaurant.city}, ${restaurant.country}`}
        badge={<StatusBadge status={restaurant.active} />}
      />

      {/* Tabs Bar */}
      <div
        role="tablist"
        aria-label="Restaurant details navigation"
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

      {/* Overview tab content */}
      <AdminRestaurantDetailComponent
        restaurant={restaurant}
        onArchive={handleArchive}
        isArchiving={isArchiving}
        archiveError={archiveError}
      />
    </div>
  );
}
