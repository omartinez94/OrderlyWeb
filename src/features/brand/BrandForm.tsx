/**
 * BrandForm — form component for creating and editing brands.
 * Gated by SuperAdmin or RestaurantAdmin with brand edit rights.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui";
import { SettingsSection } from "../../components/Admin";
import { brandSchema, CUISINE_TYPES, type BrandFormData } from "./brandSchema";
import type { CatalogBrand, CuisineType } from "../../types/catalog";
import { PATH } from "../../router/pathNames";

export interface BrandFormProps {
  initialData?: CatalogBrand;
  onSubmit: (data: BrandFormData) => Promise<void>;
  isSubmitting?: boolean;
  conflictError?: string | null;
}

export function BrandForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  conflictError,
}: BrandFormProps) {
  const { t } = useTranslation("admin");

  const [formData, setFormData] = useState<BrandFormData>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    contactEmail: initialData?.contactEmail ?? "",
    contactPhone: initialData?.contactPhone ?? "",
    cuisineType: initialData?.cuisineType ?? "Italian",
    websiteUrl: initialData?.websiteUrl ?? "",
    logoUrl: initialData?.logoUrl ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof BrandFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = brandSchema.safeParse(formData);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const fieldName = String(issue.path[0]);
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(parseResult.data);
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

      {/* Basic Section */}
      <SettingsSection
        title={t("brandForm.sections.basic")}
        description="Core identity details that distinguish this brand."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand-name" className="text-ink text-xs font-semibold">
              {t("brands.name")} *
            </label>
            <Input
              id="brand-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Acme Hospitality"
              aria-invalid={!!errors.name}
              className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand-slug" className="text-ink text-xs font-semibold">
              {t("brands.slug")} *
            </label>
            <Input
              id="brand-slug"
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="e.g. acme-hospitality"
              aria-invalid={!!errors.slug}
              className={errors.slug ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.slug && <p className="text-destructive text-xs">{errors.slug}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand-cuisine" className="text-ink text-xs font-semibold">
              {t("brands.cuisine")}
            </label>
            <Select
              value={formData.cuisineType}
              onValueChange={(val) => handleChange("cuisineType", val as CuisineType)}
            >
              <SelectTrigger id="brand-cuisine" aria-label="Cuisine type">
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                {CUISINE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="brand-description" className="text-ink text-xs font-semibold">
              {t("brands.description")}
            </label>
            <Textarea
              id="brand-description"
              value={formData.description ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tell guests and staff about this brand..."
              rows={3}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Contact Section */}
      <SettingsSection
        title={t("brandForm.sections.contact")}
        description="Public and operations contact information."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand-email" className="text-ink text-xs font-semibold">
              {t("brands.contactEmail")} *
            </label>
            <Input
              id="brand-email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              placeholder="contact@brand.com"
              aria-invalid={!!errors.contactEmail}
              className={
                errors.contactEmail ? "border-destructive focus-visible:ring-destructive" : ""
              }
            />
            {errors.contactEmail && (
              <p className="text-destructive text-xs">{errors.contactEmail}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand-phone" className="text-ink text-xs font-semibold">
              {t("brands.contactPhone")}
            </label>
            <Input
              id="brand-phone"
              type="tel"
              value={formData.contactPhone ?? ""}
              onChange={(e) => handleChange("contactPhone", e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Branding Section */}
      <SettingsSection
        title={t("brandForm.sections.branding")}
        description="Logo assets and public websites."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand-website" className="text-ink text-xs font-semibold">
              {t("brands.website")}
            </label>
            <Input
              id="brand-website"
              type="url"
              value={formData.websiteUrl ?? ""}
              onChange={(e) => handleChange("websiteUrl", e.target.value)}
              placeholder="https://brand.example.com"
              aria-invalid={!!errors.websiteUrl}
              className={
                errors.websiteUrl ? "border-destructive focus-visible:ring-destructive" : ""
              }
            />
            {errors.websiteUrl && <p className="text-destructive text-xs">{errors.websiteUrl}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand-logo" className="text-ink text-xs font-semibold">
              {t("brands.logo")}
            </label>
            <Input
              id="brand-logo"
              type="url"
              value={formData.logoUrl ?? ""}
              onChange={(e) => handleChange("logoUrl", e.target.value)}
              placeholder="https://brand.example.com/logo.png"
              aria-invalid={!!errors.logoUrl}
              className={errors.logoUrl ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.logoUrl && <p className="text-destructive text-xs">{errors.logoUrl}</p>}
          </div>
        </div>
      </SettingsSection>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link to={PATH.ADMIN_BRANDS}>
          <Button type="button" variant="outline">
            {t("actions.cancel")}
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "..." : initialData ? t("brandForm.edit") : t("brandForm.create")}
        </Button>
      </div>
    </form>
  );
}
