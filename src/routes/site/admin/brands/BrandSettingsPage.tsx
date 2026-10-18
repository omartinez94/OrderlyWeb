/**
 * BrandSettingsPage — allows editing brand identity and settings.
 * Gated by SuperAdmin or RestaurantAdmin with brand edit rights.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link, useNavigate } from "react-router";
import { useGetBrandQuery, useUpdateBrandMutation } from "../../../../app/api/catalog";
import { toast, Skeleton, Card } from "../../../../components/ui";
import { ResourceHeader, StatusBadge } from "../../../../components/Admin";
import { BrandForm, isBrandConflict, type BrandFormData } from "../../../../features/brand";
import { PATH } from "../../../../router/pathNames";

export function BrandSettingsPage() {
  const { t } = useTranslation("admin");
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: brand, isLoading, error } = useGetBrandQuery(id, { skip: !id });
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleSubmit = async (data: BrandFormData) => {
    try {
      setConflictError(null);
      await updateBrand({ id, ...data }).unwrap();
      toast.success("Brand updated successfully.");
      navigate(`/site/admin/brands/${id}`);
    } catch (err) {
      if (isBrandConflict(err) && err.code === "BRAND_DUPLICATE_SLUG") {
        setConflictError("A brand with this slug already exists. Please choose a different slug.");
      } else {
        toast.error("Failed to update brand.");
      }
    }
  };

  const navTabs = [
    { label: t("brands.tabs.overview"), path: `/site/admin/brands/${id}` },
    { label: t("brands.tabs.restaurants"), path: `/site/admin/brands/${id}/restaurants` },
    { label: t("brands.tabs.staff"), path: `/site/admin/brands/${id}/staff` },
    { label: t("brands.tabs.settings"), path: `/site/admin/brands/${id}/settings`, exact: true },
    { label: t("brands.tabs.audit"), path: `/site/admin/brands/${id}/audit` },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full max-w-3xl" />
      </div>
    );
  }

  if (error || !brand) {
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
          { label: t("brands.tabs.settings") },
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

      <div className="max-w-3xl">
        <BrandForm
          initialData={brand}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
          conflictError={conflictError}
        />
      </div>
    </div>
  );
}
