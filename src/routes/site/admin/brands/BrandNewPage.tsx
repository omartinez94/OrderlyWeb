/**
 * BrandNewPage — creation form for a new brand entity.
 * Gated to users with `brands:create` permission (SuperAdmin).
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useCreateBrandMutation } from "../../../../app/api/catalog";
import { toast } from "../../../../components/ui";
import { ResourceHeader } from "../../../../components/Admin";
import { RequirePermission } from "../../../../components/RouteGuards/RequirePermission";
import { BrandForm, isBrandConflict, type BrandFormData } from "../../../../features/brand";
import { PATH } from "../../../../router/pathNames";

function BrandNewContent() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const [createBrand, { isLoading }] = useCreateBrandMutation();
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleSubmit = async (data: BrandFormData) => {
    try {
      setConflictError(null);
      const newBrand = await createBrand(data).unwrap();
      toast.success("Brand created successfully.");
      navigate(`/site/admin/brands/${newBrand.id}`);
    } catch (err) {
      if (isBrandConflict(err) && err.code === "BRAND_DUPLICATE_SLUG") {
        setConflictError("A brand with this slug already exists. Please choose a different slug.");
      } else {
        toast.error("Failed to create brand.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <ResourceHeader
        breadcrumbs={[
          { label: "Admin", to: PATH.ADMIN },
          { label: t("brands.title"), to: PATH.ADMIN_BRANDS },
          { label: t("brands.new") },
        ]}
        title={t("brandForm.create")}
        subtitle="Establish a new restaurant brand and configure its identity."
      />

      <div className="max-w-3xl">
        <BrandForm onSubmit={handleSubmit} isSubmitting={isLoading} conflictError={conflictError} />
      </div>
    </div>
  );
}

export function BrandNewPage() {
  return (
    <RequirePermission perm="brands:create">
      <BrandNewContent />
    </RequirePermission>
  );
}
