/**
 * AdminRestaurantDetail — Overview presentation component for a single restaurant.
 * Displays address, operational rules, operating hours, and archive action.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { UtensilsCrossed, Clock, Coins, Percent, Archive, Edit } from "lucide-react";
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
import { AddressCard } from "./AddressCard";
import { OperatingHoursGrid } from "./OperatingHoursGrid";
import type { AdminRestaurantDetail as RestaurantDetailType } from "./api";

export interface AdminRestaurantDetailProps {
  restaurant: RestaurantDetailType;
  onArchive: () => Promise<void>;
  isArchiving?: boolean;
  archiveError?: string | null;
}

export function AdminRestaurantDetailComponent({
  restaurant,
  onArchive,
  isArchiving = false,
  archiveError,
}: AdminRestaurantDetailProps) {
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
              <p className="text-ink-subtle text-xs font-medium">{t("restaurants.cuisine")}</p>
              <h2 className="text-ink text-sm font-bold">{restaurant.cuisine}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-ink-subtle text-xs font-medium">
                {t("restaurants.estimatedTurnoverMinutes")}
              </p>
              <h2 className="text-ink font-mono text-xl font-bold">
                {restaurant.estimatedTurnoverMinutes}m
              </h2>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
              <Coins className="size-5" />
            </div>
            <div>
              <p className="text-ink-subtle text-xs font-medium">{t("restaurants.currency")}</p>
              <h2 className="text-ink font-mono text-xl font-bold">{restaurant.currency}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
              <Percent className="size-5" />
            </div>
            <div>
              <p className="text-ink-subtle text-xs font-medium">{t("restaurants.taxRate")}</p>
              <h2 className="text-ink font-mono text-xl font-bold">
                {(restaurant.taxRate * 100).toFixed(2)}%
              </h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Address Card */}
          <AddressCard address={restaurant.address} />

          {/* Schedule */}
          <Card className="p-4">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="font-display text-ink text-sm font-semibold">
                {t("restaurants.hours")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <OperatingHoursGrid hours={restaurant.operatingHours} readOnly />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Card */}
        <div className="flex flex-col gap-6">
          <Card className="p-4">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="font-display text-ink text-sm font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-0">
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link to={`/site/admin/restaurants/${restaurant.id}/settings`}>
                  <Edit className="size-4" />
                  {t("actions.edit")}
                </Link>
              </Button>

              {restaurant.active && (
                <Button
                  variant="destructive"
                  className="justify-start gap-2"
                  onClick={() => setIsArchiveDialogOpen(true)}
                  disabled={isArchiving}
                >
                  <Archive className="size-4" />
                  {t("restaurants.archive")}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {restaurant.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Archiving this restaurant will deactivate online reservations, ordering, and unassign
              active operational shifts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await onArchive();
                setIsArchiveDialogOpen(false);
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("actions.archive")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
