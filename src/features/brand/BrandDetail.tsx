/**
 * BrandDetail — Overview presentation component for a single brand.
 * Shows stats tiles (restaurants, staff counts), contact metadata,
 * and archive action with an alert dialog.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Building2, UtensilsCrossed, Users, Mail, Phone, Globe, Archive, Edit } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../components/ui";
import { StatusBadge } from "../../components/Admin";
import type { CatalogBrand } from "../../types/catalog";

export interface BrandDetailProps {
  brand: CatalogBrand;
  restaurantsCount?: number;
  staffCount?: number;
  onArchive: () => Promise<void>;
  isArchiving?: boolean;
  archiveError?: string | null;
}

export function BrandDetail({
  brand,
  restaurantsCount = 0,
  staffCount = 0,
  onArchive,
  isArchiving = false,
  archiveError,
}: BrandDetailProps) {
  const { t } = useTranslation("admin");
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {archiveError && (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/10 text-destructive rounded-md border p-4 text-xs font-medium"
        >
          {archiveError}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
              <UtensilsCrossed className="size-5" />
            </div>
            <div>
              <p className="text-ink-subtle text-xs font-medium">
                {t("dashboard.stats.restaurants")}
              </p>
              <h2 className="text-ink font-mono text-xl font-bold">{restaurantsCount}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-ink-subtle text-xs font-medium">{t("dashboard.stats.staff")}</p>
              <h2 className="text-ink font-mono text-xl font-bold">{staffCount}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-ink-subtle text-xs font-medium">{t("brands.cuisine")}</p>
              <h2 className="text-ink text-sm font-bold">{brand.cuisineType}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-ink-subtle text-xs font-medium">Status</p>
              <div className="mt-0.5">
                <StatusBadge status={brand.active} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Brand Overview Info Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-ink text-base font-semibold">
              Brand Information
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            {brand.description && (
              <div>
                <span className="text-ink font-semibold">{t("brands.description")}:</span>
                <p className="text-ink-subtle mt-1 leading-relaxed">{brand.description}</p>
              </div>
            )}

            <div className="border-border grid grid-cols-1 gap-4 border-t pt-2 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="text-ink-subtle size-4" />
                <span className="text-ink font-semibold">{t("brands.contactEmail")}:</span>
                <a href={`mailto:${brand.contactEmail}`} className="text-primary hover:underline">
                  {brand.contactEmail}
                </a>
              </div>

              {brand.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="text-ink-subtle size-4" />
                  <span className="text-ink font-semibold">{t("brands.contactPhone")}:</span>
                  <span className="text-ink-subtle">{brand.contactPhone}</span>
                </div>
              )}

              {brand.websiteUrl && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Globe className="text-ink-subtle size-4" />
                  <span className="text-ink font-semibold">{t("brands.website")}:</span>
                  <a
                    href={brand.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {brand.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brand Actions / Lifecycle Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-ink text-base font-semibold">
              Lifecycle & Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link to={`/site/admin/brands/${brand.id}/settings`}>
              <Button variant="outline" className="w-full justify-start gap-2 text-xs">
                <Edit className="size-4" />
                Edit Brand Settings
              </Button>
            </Link>

            {brand.active && (
              <Button
                variant="destructive"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => setIsArchiveDialogOpen(true)}
              >
                <Archive className="size-4" />
                {t("brands.archive")}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("brands.archiveConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("brands.archiveConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await onArchive();
                setIsArchiveDialogOpen(false);
              }}
              disabled={isArchiving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isArchiving ? "..." : t("actions.archive")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
