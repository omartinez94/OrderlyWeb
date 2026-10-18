/**
 * QueuePage — `/site/restaurant/queue`.
 *
 * Operational dashboard for hosts to manage walk-in guests, monitor wait times,
 * trigger simulated SMS notifications, and allocate available dining tables.
 */

import { useTranslation } from "react-i18next";
import { Users, UserPlus, RefreshCw, Bell, Armchair, Clock } from "lucide-react";
import { useRestaurantContext } from "../../../../components/RestaurantContext/useRestaurantContext";
import {
  WaitlistTable,
  AddWalkInDialog,
  CheckInDialog,
  useWaitlist,
} from "../../../../features/queue";
import { Button, Badge } from "../../../../components/ui";

export function QueuePage() {
  const { t } = useTranslation("restaurant");
  const { restaurantId: contextRestaurantId } = useRestaurantContext();
  const effectiveRestaurantId = contextRestaurantId ?? "r-001";

  const {
    queue,
    waitingCount,
    notifiedCount,
    seatedCount,
    availableTables,
    isAddDialogOpen,
    setIsAddDialogOpen,
    partyToSeat,
    setPartyToSeat,
    isAdding,
    isUpdatingStatus,
    addParty,
    notifyParty,
    seatParty,
    cancelParty,
    refetchAll,
  } = useWaitlist({ restaurantId: effectiveRestaurantId });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
              <Users className="size-4" />
            </div>
            <h1 className="text-ink font-display text-xl font-bold tracking-tight">
              {t("queue.title")}
            </h1>
          </div>
          <p className="text-ink-subtle mt-1 text-xs">{t("queue.subtitle")}</p>
        </div>

        {/* Action Controls and KPI Counters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Counters */}
          <div className="border-border/60 bg-surface flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-xs">
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
            >
              <Clock className="size-3" />
              <span className="font-mono tabular-nums">{waitingCount}</span> Waiting
            </Badge>

            {notifiedCount > 0 && (
              <Badge
                variant="outline"
                className="gap-1 border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-400"
              >
                <Bell className="size-3" />
                <span className="font-mono tabular-nums">{notifiedCount}</span> Notified
              </Badge>
            )}

            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
            >
              <Armchair className="size-3" />
              <span className="font-mono tabular-nums">{seatedCount}</span> Seated
            </Badge>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetchAll}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" />
            <span className="hidden sm:inline">{t("queue.refresh")}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <UserPlus className="size-3.5" />
            {t("queue.addWalkIn")}
          </Button>
        </div>
      </div>

      {/* Waitlist Table */}
      <WaitlistTable
        queue={queue}
        onNotify={notifyParty}
        onSeat={setPartyToSeat}
        onCancel={cancelParty}
        isUpdating={isUpdatingStatus}
      />

      {/* Add Party Dialog */}
      <AddWalkInDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddParty={addParty}
        isAdding={isAdding}
      />

      {/* Seat Party Dialog */}
      <CheckInDialog
        party={partyToSeat}
        open={Boolean(partyToSeat)}
        onOpenChange={(open) => !open && setPartyToSeat(null)}
        availableTables={availableTables}
        onConfirmSeat={seatParty}
        isSeating={isUpdatingStatus}
      />
    </div>
  );
}
