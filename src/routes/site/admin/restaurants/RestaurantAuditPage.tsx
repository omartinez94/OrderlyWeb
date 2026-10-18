/**
 * RestaurantAuditPage — audit timeline for a specific restaurant.
 * Phase 5 deliverable.
 * Mounts <EntityAuditLog entityType="restaurant" entityId={id} />.
 */

import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router";
import { useGetAdminRestaurantQuery } from "../../../../features/restaurant";
import { ResourceHeader, StatusBadge } from "../../../../components/Admin";
import { Card, Skeleton } from "../../../../components/ui";
import { EntityAuditLog } from "../../../../features/audit";
import { PATH } from "../../../../router/pathNames";

export function RestaurantAuditPage() {
  const { t } = useTranslation("admin");
  const { id = "" } = useParams<{ id: string }>();

  const { data: restaurant, isLoading } = useGetAdminRestaurantQuery(id, { skip: !id });

  const navTabs = [
    { label: t("restaurants.tabs.overview"), path: `/site/admin/restaurants/${id}` },
    { label: t("restaurants.tabs.staff"), path: `/site/admin/restaurants/${id}/staff` },
    { label: t("restaurants.tabs.settings"), path: `/site/admin/restaurants/${id}/settings` },
    {
      label: t("restaurants.tabs.audit"),
      path: `/site/admin/restaurants/${id}/audit`,
      exact: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <h2 className="font-display text-ink text-base font-semibold">Restaurant not found</h2>
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
          { label: restaurant.name, to: `/site/admin/restaurants/${restaurant.id}` },
          { label: t("restaurants.tabs.audit") },
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
          const isActive = tab.exact ?? false;
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

      {/* Restaurant Audit Log */}
      <EntityAuditLog entityType="restaurant" entityId={id} />
    </div>
  );
}
