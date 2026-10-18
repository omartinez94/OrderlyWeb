/**
 * BrandStaffPage — staff members associated with this brand.
 * Phase 4 deliverable.
 *
 * Per the plan's stub strategy (§7.1 / Phase 4):
 * Displays an informational banner noting cross-service availability
 * (since Identity joins Brand -> Restaurant -> User) while letting users
 * navigate to restaurants or view restaurant staff.
 */

import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router";
import { Info } from "lucide-react";
import { useGetBrandQuery } from "../../../../app/api/catalog";
import { ResourceHeader, StatusBadge } from "../../../../components/Admin";
import { Card, Skeleton, Button } from "../../../../components/ui";
import { PATH } from "../../../../router/pathNames";

export function BrandStaffPage() {
  const { t } = useTranslation("admin");
  const { id = "" } = useParams<{ id: string }>();

  const { data: brand, isLoading } = useGetBrandQuery(id, { skip: !id });

  const navTabs = [
    { label: t("brands.tabs.overview"), path: `/site/admin/brands/${id}` },
    { label: t("brands.tabs.restaurants"), path: `/site/admin/brands/${id}/restaurants` },
    { label: t("brands.tabs.staff"), path: `/site/admin/brands/${id}/staff`, exact: true },
    { label: t("brands.tabs.settings"), path: `/site/admin/brands/${id}/settings` },
    { label: t("brands.tabs.audit"), path: `/site/admin/brands/${id}/audit` },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
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
          { label: t("brands.tabs.staff") },
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

      {/* Informational Banner */}
      <Card className="border-primary/20 bg-primary/5 flex items-start gap-3 p-5">
        <Info className="text-primary mt-0.5 size-5 shrink-0" />
        <div className="flex flex-col gap-2">
          <h2 className="text-primary font-display text-sm font-semibold">{t("staff.title")}</h2>
          <p className="text-ink-subtle text-xs leading-relaxed">
            {t("brands.staffUnavailableBanner")}
          </p>
          <div className="mt-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/site/admin/brands/${id}/restaurants`}>
                {t("brands.tabs.restaurants")}
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
