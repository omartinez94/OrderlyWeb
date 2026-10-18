/**
 * BrandAuditPage — audit timeline for a specific brand.
 * Phase 4 deliverable.
 * Mounts <EntityAuditLog entityType="brand" entityId={id} />.
 */

import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router";
import { useGetBrandQuery } from "../../../../app/api/catalog";
import { ResourceHeader, StatusBadge } from "../../../../components/Admin";
import { Card, Skeleton } from "../../../../components/ui";
import { EntityAuditLog } from "../../../../features/audit";
import { PATH } from "../../../../router/pathNames";

export function BrandAuditPage() {
  const { t } = useTranslation("admin");
  const { id = "" } = useParams<{ id: string }>();

  const { data: brand, isLoading } = useGetBrandQuery(id, { skip: !id });

  const navTabs = [
    { label: t("brands.tabs.overview"), path: `/site/admin/brands/${id}` },
    { label: t("brands.tabs.restaurants"), path: `/site/admin/brands/${id}/restaurants` },
    { label: t("brands.tabs.staff"), path: `/site/admin/brands/${id}/staff` },
    { label: t("brands.tabs.settings"), path: `/site/admin/brands/${id}/settings` },
    { label: t("brands.tabs.audit"), path: `/site/admin/brands/${id}/audit`, exact: true },
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
          { label: t("brands.tabs.audit") },
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

      {/* Brand Audit Log Component */}
      <EntityAuditLog entityType="brand" entityId={id} />
    </div>
  );
}
