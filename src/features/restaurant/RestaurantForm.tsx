/**
 * RestaurantForm — multi-section form for creating and editing restaurants.
 * Sections: Identity, Address, Contact, Schedule (OperatingHoursGrid), Operations, Ownership.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
} from "../../components/ui";
import { SettingsSection } from "../../components/Admin";
import { OperatingHoursGrid } from "./OperatingHoursGrid";
import { restaurantSchema, type RestaurantFormData } from "./restaurantSchema";
import type { AdminRestaurantDetail, OperatingHoursDay } from "./api";
import { useListBrandsQuery } from "../../app/api/catalog";
import { PATH } from "../../router/pathNames";

export interface RestaurantFormProps {
  initialData?: AdminRestaurantDetail;
  onSubmit: (data: RestaurantFormData) => Promise<void>;
  isSubmitting?: boolean;
  conflictError?: string | null;
}

export function RestaurantForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  conflictError,
}: RestaurantFormProps) {
  const { t } = useTranslation("admin");
  const { data: brands = [] } = useListBrandsQuery();

  const [formData, setFormData] = useState<RestaurantFormData>({
    name: initialData?.name ?? "",
    brandId: initialData?.brandId ?? (brands[0]?.id || "b-001"),
    cuisine: initialData?.cuisine ?? "Italian",
    ownerId: initialData?.ownerId ?? null,
    address: {
      line1: initialData?.address?.line1 ?? "",
      line2: initialData?.address?.line2 ?? "",
      city: initialData?.address?.city ?? "",
      region: initialData?.address?.region ?? "",
      postalCode: initialData?.address?.postalCode ?? "",
      country: initialData?.address?.country ?? "US",
    },
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    timezone: initialData?.timezone ?? "America/New_York",
    currency: initialData?.currency ?? "USD",
    taxRate: initialData?.taxRate ?? 0.08875,
    operatingHours: initialData?.operatingHours ?? [
      { dayOfWeek: 0, open: "10:00", close: "22:00" },
      { dayOfWeek: 1, open: "11:00", close: "22:00" },
      { dayOfWeek: 2, open: "11:00", close: "22:00" },
      { dayOfWeek: 3, open: "11:00", close: "22:00" },
      { dayOfWeek: 4, open: "11:00", close: "23:00" },
      { dayOfWeek: 5, open: "11:00", close: "23:00" },
      { dayOfWeek: 6, open: "10:00", close: "23:00" },
    ],
    estimatedTurnoverMinutes: initialData?.estimatedTurnoverMinutes ?? 90,
    autoConfirmReservations: initialData?.autoConfirmReservations ?? true,
    autoConfirmOrders: initialData?.autoConfirmOrders ?? true,
    allowAutoSubstitute: initialData?.allowAutoSubstitute ?? false,
    status: initialData?.status ?? "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddressChange = (field: keyof RestaurantFormData["address"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = restaurantSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {conflictError && (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/10 text-destructive rounded-md border p-4 text-xs font-medium"
        >
          {conflictError}
        </div>
      )}

      {/* Identity Section */}
      <SettingsSection
        title={t("restaurantForm.sections.identity")}
        description="General restaurant identification and brand ownership."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="restaurant-name" className="text-ink text-xs font-medium">
              {t("restaurants.name")} *
            </label>
            <Input
              id="restaurant-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="text-xs"
            />
            {errors["name"] && <span className="text-danger text-xs">{errors["name"]}</span>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="restaurant-brand" className="text-ink text-xs font-medium">
                {t("restaurants.brand")} *
              </label>
              <Select
                value={formData.brandId}
                onValueChange={(val) => setFormData((p) => ({ ...p, brandId: val }))}
              >
                <SelectTrigger id="restaurant-brand" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="restaurant-cuisine" className="text-ink text-xs font-medium">
                {t("restaurants.cuisine")} *
              </label>
              <Input
                id="restaurant-cuisine"
                type="text"
                value={formData.cuisine}
                onChange={(e) => setFormData((p) => ({ ...p, cuisine: e.target.value }))}
                className="text-xs"
              />
              {errors["cuisine"] && (
                <span className="text-danger text-xs">{errors["cuisine"]}</span>
              )}
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Address Section */}
      <SettingsSection
        title={t("restaurantForm.sections.address")}
        description="Physical street address and geographic region."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="addr-line1" className="text-ink text-xs font-medium">
              Street Address *
            </label>
            <Input
              id="addr-line1"
              type="text"
              value={formData.address.line1}
              onChange={(e) => handleAddressChange("line1", e.target.value)}
              className="text-xs"
            />
            {errors["address.line1"] && (
              <span className="text-danger text-xs">{errors["address.line1"]}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="addr-line2" className="text-ink text-xs font-medium">
              Apt / Suite / Floor
            </label>
            <Input
              id="addr-line2"
              type="text"
              value={formData.address.line2 ?? ""}
              onChange={(e) => handleAddressChange("line2", e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="addr-city" className="text-ink text-xs font-medium">
                {t("restaurants.city")} *
              </label>
              <Input
                id="addr-city"
                type="text"
                value={formData.address.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                className="text-xs"
              />
              {errors["address.city"] && (
                <span className="text-danger text-xs">{errors["address.city"]}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="addr-region" className="text-ink text-xs font-medium">
                State / Region *
              </label>
              <Input
                id="addr-region"
                type="text"
                value={formData.address.region}
                onChange={(e) => handleAddressChange("region", e.target.value)}
                className="text-xs"
              />
              {errors["address.region"] && (
                <span className="text-danger text-xs">{errors["address.region"]}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="addr-country" className="text-ink text-xs font-medium">
                {t("restaurants.country")} (2-letter) *
              </label>
              <Input
                id="addr-country"
                type="text"
                maxLength={2}
                value={formData.address.country}
                onChange={(e) => handleAddressChange("country", e.target.value.toUpperCase())}
                className="font-mono text-xs uppercase"
              />
              {errors["address.country"] && (
                <span className="text-danger text-xs">{errors["address.country"]}</span>
              )}
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Contact Section */}
      <SettingsSection
        title={t("restaurantForm.sections.contact")}
        description="Public phone and contact email."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="res-phone" className="text-ink text-xs font-medium">
              {t("restaurants.phone")}
            </label>
            <Input
              id="res-phone"
              type="tel"
              value={formData.phone ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="res-email" className="text-ink text-xs font-medium">
              {t("restaurants.email")}
            </label>
            <Input
              id="res-email"
              type="email"
              value={formData.email ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="text-xs"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Schedule Section */}
      <SettingsSection
        title={t("restaurantForm.sections.schedule")}
        description="Weekly operating schedule and meal service hours."
      >
        <OperatingHoursGrid
          hours={formData.operatingHours}
          onChange={(hours: OperatingHoursDay[]) =>
            setFormData((p) => ({ ...p, operatingHours: hours }))
          }
        />
      </SettingsSection>

      {/* Operations & Settings Section */}
      <SettingsSection
        title={t("restaurantForm.sections.operations")}
        description="Turnover, timezone, currency, and automation rules."
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="res-tz" className="text-ink text-xs font-medium">
                {t("restaurants.timezone")} *
              </label>
              <Input
                id="res-tz"
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData((p) => ({ ...p, timezone: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="res-currency" className="text-ink text-xs font-medium">
                {t("restaurants.currency")} *
              </label>
              <Input
                id="res-currency"
                type="text"
                maxLength={3}
                value={formData.currency}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, currency: e.target.value.toUpperCase() }))
                }
                className="font-mono text-xs uppercase"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="res-tax" className="text-ink text-xs font-medium">
                {t("restaurants.taxRate")} (0.00 - 1.00) *
              </label>
              <Input
                id="res-tax"
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))
                }
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="border-border-subtle flex flex-col gap-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink text-xs font-medium">
                  {t("restaurants.autoConfirmReservations")}
                </p>
                <p className="text-ink-subtle text-xs">
                  Automatically confirm online table reservations upon booking.
                </p>
              </div>
              <Switch
                checked={formData.autoConfirmReservations}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, autoConfirmReservations: checked }))
                }
                aria-label={t("restaurants.autoConfirmReservations")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink text-xs font-medium">{t("restaurants.autoConfirmOrders")}</p>
                <p className="text-ink-subtle text-xs">
                  Send incoming guest orders straight to the kitchen display.
                </p>
              </div>
              <Switch
                checked={formData.autoConfirmOrders}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, autoConfirmOrders: checked }))
                }
                aria-label={t("restaurants.autoConfirmOrders")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink text-xs font-medium">
                  {t("restaurants.allowAutoSubstitute")}
                </p>
                <p className="text-ink-subtle text-xs">
                  Allow kitchen staff to suggest 86 substitutions automatically.
                </p>
              </div>
              <Switch
                checked={formData.allowAutoSubstitute}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, allowAutoSubstitute: checked }))
                }
                aria-label={t("restaurants.allowAutoSubstitute")}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button asChild variant="outline" type="button">
          <Link to={PATH.ADMIN_RESTAURANTS}>{t("actions.cancel")}</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : initialData
              ? t("restaurantForm.edit")
              : t("restaurantForm.create")}
        </Button>
      </div>
    </form>
  );
}
