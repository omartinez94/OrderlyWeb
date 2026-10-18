/**
 * RestaurantNewPage — create a new restaurant under a brand.
 * Phase 5 deliverable. Gated by restaurants:create permission.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  useCreateRestaurantMutation,
  RestaurantForm,
  type RestaurantFormData,
} from "../../../../features/restaurant";
import { ResourceHeader } from "../../../../components/Admin";
import { toast } from "../../../../components/ui";
import { PATH } from "../../../../router/pathNames";

export function RestaurantNewPage() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();

  const [createRestaurant, { isLoading }] = useCreateRestaurantMutation();
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleSubmit = async (data: RestaurantFormData) => {
    try {
      setConflictError(null);
      const created = await createRestaurant(data).unwrap();
      toast.success("Restaurant created successfully.");
      navigate(`/site/admin/restaurants/${created.id}`);
    } catch {
      toast.error("Failed to create restaurant.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <ResourceHeader
        breadcrumbs={[
          { label: "Admin", to: PATH.ADMIN },
          { label: t("restaurants.title"), to: PATH.ADMIN_RESTAURANTS },
          { label: t("restaurants.new") },
        ]}
        title={t("restaurants.new")}
        subtitle="Configure location, operating schedule, and service parameters."
      />

      <div className="max-w-3xl">
        <RestaurantForm
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
          conflictError={conflictError}
        />
      </div>
    </div>
  );
}
