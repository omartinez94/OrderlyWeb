/**
 * RestaurantStaffPage — lists staff members assigned to this restaurant.
 * Phase 5 deliverable.
 */

import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router";
import { useGetAdminRestaurantQuery } from "../../../../features/restaurant";
import { useListStaffQuery } from "../../../../app/api/identity";
import { ResourceHeader, StatusBadge } from "../../../../components/Admin";
import {
  Card,
  Skeleton,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
} from "../../../../components/ui";
import { PATH } from "../../../../router/pathNames";

export function RestaurantStaffPage() {
  const { t } = useTranslation("admin");
  const { id = "" } = useParams<{ id: string }>();

  const { data: restaurant, isLoading: isRestaurantLoading } = useGetAdminRestaurantQuery(id, {
    skip: !id,
  });
  const { data: staff = [], isLoading: isStaffLoading } = useListStaffQuery(
    { restaurantId: id },
    { skip: !id },
  );

  const navTabs = [
    { label: t("restaurants.tabs.overview"), path: `/site/admin/restaurants/${id}` },
    {
      label: t("restaurants.tabs.staff"),
      path: `/site/admin/restaurants/${id}/staff`,
      exact: true,
    },
    { label: t("restaurants.tabs.settings"), path: `/site/admin/restaurants/${id}/settings` },
    { label: t("restaurants.tabs.audit"), path: `/site/admin/restaurants/${id}/audit` },
  ];

  if (isRestaurantLoading || isStaffLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
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
          { label: t("restaurants.tabs.staff") },
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

      {/* Staff Table */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-ink text-base font-semibold">{t("staff.title")}</h2>
            <p className="text-ink-subtle text-xs">
              {staff.length === 1
                ? t("staff.subtitle_one", { count: 1 })
                : t("staff.subtitle_other", { count: staff.length })}
            </p>
          </div>
        </div>

        {staff.length === 0 ? (
          <p className="text-ink-muted py-8 text-center text-xs">
            No staff assigned to this restaurant yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="text-ink font-medium">
                    <Link
                      to={`/site/admin/staff/${member.id}`}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {member.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-ink-subtle font-mono text-xs">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.roles.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.active ? "default" : "secondary"}>
                      {member.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
