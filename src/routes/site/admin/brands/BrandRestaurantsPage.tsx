/**
 * BrandRestaurantsPage — lists restaurants belonging to the active brand.
 * Phase 4 deliverable.
 */

import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router";
import { useGetBrandQuery, useGetRestaurantsQuery } from "../../../../app/api/catalog";
import { ResourceHeader, StatusBadge } from "../../../../components/Admin";
import {
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "../../../../components/ui";
import { PATH } from "../../../../router/pathNames";

export function BrandRestaurantsPage() {
  const { t } = useTranslation("admin");
  const { id = "" } = useParams<{ id: string }>();

  const { data: brand, isLoading: isBrandLoading } = useGetBrandQuery(id, { skip: !id });
  const { data: restaurants = [], isLoading: isRestaurantsLoading } = useGetRestaurantsQuery();

  const brandRestaurants = restaurants.filter(
    (r) => (r as any).brandId === id || (!("brandId" in r) && id === "b-001"),
  );

  const navTabs = [
    { label: t("brands.tabs.overview"), path: `/site/admin/brands/${id}` },
    {
      label: t("brands.tabs.restaurants"),
      path: `/site/admin/brands/${id}/restaurants`,
      exact: true,
    },
    { label: t("brands.tabs.staff"), path: `/site/admin/brands/${id}/staff` },
    { label: t("brands.tabs.settings"), path: `/site/admin/brands/${id}/settings` },
    { label: t("brands.tabs.audit"), path: `/site/admin/brands/${id}/audit` },
  ];

  if (isBrandLoading || isRestaurantsLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <h2 className="font-display text-ink text-base font-semibold">Brand not found</h2>
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
          { label: brand.name, to: `/site/admin/brands/${brand.id}` },
          { label: t("brands.tabs.restaurants") },
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

      {/* Restaurants Table */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-ink text-base font-semibold">
              {t("restaurants.title")}
            </h2>
            <p className="text-ink-subtle text-xs">
              {brandRestaurants.length === 1
                ? t("restaurants.subtitle_one", { count: 1 })
                : t("restaurants.subtitle_other", { count: brandRestaurants.length })}
            </p>
          </div>
        </div>

        {brandRestaurants.length === 0 ? (
          <p className="text-ink-muted py-8 text-center text-xs">{t("restaurants.empty")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("restaurants.name")}</TableHead>
                <TableHead>{t("restaurants.city")}</TableHead>
                <TableHead>{t("restaurants.country")}</TableHead>
                <TableHead>{t("restaurants.cuisine")}</TableHead>
                <TableHead>{t("restaurants.status.active")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandRestaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell className="text-ink font-medium">
                    <Link
                      to={`/site/admin/restaurants/${restaurant.id}`}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {restaurant.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-ink-subtle">{restaurant.city}</TableCell>
                  <TableCell className="text-ink-subtle font-mono text-xs">
                    {restaurant.country}
                  </TableCell>
                  <TableCell className="text-ink-subtle">{restaurant.cuisine}</TableCell>
                  <TableCell>
                    <Badge variant={restaurant.active ? "default" : "secondary"}>
                      {restaurant.active
                        ? t("restaurants.status.active")
                        : t("restaurants.status.inactive")}
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
