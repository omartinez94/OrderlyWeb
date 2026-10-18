/**
 * ReservationsPage — `/site/restaurant/reservations`.
 *
 * Operational dashboard for hosts and managers to coordinate upcoming table bookings,
 * check in arriving parties, and seat reservations.
 */

import { useTranslation } from "react-i18next";
import { Calendar, CalendarPlus, RefreshCw, CheckCircle, Clock } from "lucide-react";
import { useRestaurantContext } from "../../../../components/RestaurantContext/useRestaurantContext";
import {
  ReservationList,
  NewReservationDialog,
  useReservations,
} from "../../../../features/reservations";
import { Button, Badge } from "../../../../components/ui";

export function ReservationsPage() {
  const { t } = useTranslation("restaurant");
  const { restaurantId: contextRestaurantId } = useRestaurantContext();
  const effectiveRestaurantId = contextRestaurantId ?? "r-001";

  const {
    reservations,
    availableTables,
    totalCount,
    confirmedCount,
    pendingCount,
    selectedMealPeriod,
    setSelectedMealPeriod,
    searchQuery,
    setSearchQuery,
    isNewDialogOpen,
    setIsNewDialogOpen,
    isCreating,
    isUpdatingStatus,
    checkInReservation,
    seatReservation,
    cancelReservation,
    createReservation,
    refetchAll,
  } = useReservations({ restaurantId: effectiveRestaurantId });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
              <Calendar className="size-4" />
            </div>
            <h1 className="text-ink font-display text-xl font-bold tracking-tight">
              {t("reservations.title")}
            </h1>
          </div>
          <p className="text-ink-subtle mt-1 text-xs">{t("reservations.subtitle")}</p>
        </div>

        {/* Actions & Counters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Metrics */}
          <div className="border-border/60 bg-surface flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-xs">
            <span className="text-ink-subtle text-xs">
              Total: <strong className="text-ink font-mono">{totalCount}</strong>
            </span>
            <span className="text-border">|</span>
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle className="size-3" />
              <span className="font-mono tabular-nums">{confirmedCount}</span> Confirmed
            </Badge>

            {pendingCount > 0 && (
              <Badge
                variant="outline"
                className="gap-1 border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
              >
                <Clock className="size-3" />
                <span className="font-mono tabular-nums">{pendingCount}</span> Pending
              </Badge>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetchAll}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" />
            <span className="hidden sm:inline">{t("reservations.refresh")}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsNewDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <CalendarPlus className="size-3.5" />
            {t("reservations.new")}
          </Button>
        </div>
      </div>

      {/* Reservations List */}
      <ReservationList
        reservations={reservations}
        selectedMealPeriod={selectedMealPeriod}
        onSelectMealPeriod={setSelectedMealPeriod}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCheckIn={checkInReservation}
        onSeat={seatReservation}
        onCancel={cancelReservation}
        isUpdating={isUpdatingStatus}
      />

      {/* New Reservation Dialog */}
      <NewReservationDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        availableTables={availableTables}
        onCreateReservation={createReservation}
        isCreating={isCreating}
      />
    </div>
  );
}
