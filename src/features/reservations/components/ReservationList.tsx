import { format, parseISO } from "date-fns";
import {
  Users,
  Clock,
  Phone,
  Sparkles,
  CheckCircle,
  Armchair,
  XCircle,
  CalendarCheck,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent, Badge, Button, Input } from "../../../components/ui";
import { cn } from "../../../lib/utils";
import type { ReservationDto, MealPeriod } from "../types/reservation";

export interface ReservationListProps {
  reservations: ReservationDto[];
  selectedMealPeriod: MealPeriod;
  onSelectMealPeriod: (period: MealPeriod) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCheckIn: (reservation: ReservationDto) => void;
  onSeat: (reservation: ReservationDto) => void;
  onCancel: (reservation: ReservationDto) => void;
  isUpdating?: boolean;
}

export function ReservationList({
  reservations,
  selectedMealPeriod,
  onSelectMealPeriod,
  searchQuery,
  onSearchChange,
  onCheckIn,
  onSeat,
  onCancel,
  isUpdating = false,
}: ReservationListProps) {
  const formatTime = (timeStr: string) => {
    try {
      return format(parseISO(timeStr), "h:mm a");
    } catch {
      return timeStr;
    }
  };

  const getStatusBadge = (status: ReservationDto["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/40 bg-amber-500/10 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
          >
            <Clock className="size-3" />
            Pending Check-In
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle className="size-3" />
            Confirmed
          </Badge>
        );
      case "seated":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-blue-500/40 bg-blue-500/10 text-[11px] font-semibold text-blue-700 dark:text-blue-400"
          >
            <Armchair className="size-3" />
            Seated
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-slate-500/40 bg-slate-500/10 text-[11px] font-semibold text-slate-600 dark:text-slate-400"
          >
            <XCircle className="size-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Filters: Meal Period and Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Meal periods" className="flex items-center gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={selectedMealPeriod === "all"}
            onClick={() => onSelectMealPeriod("all")}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2",
              selectedMealPeriod === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-surface hover:bg-surface-elevated text-ink border border-border/60",
            )}
          >
            All Shifts
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedMealPeriod === "lunch"}
            onClick={() => onSelectMealPeriod("lunch")}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2",
              selectedMealPeriod === "lunch"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-surface hover:bg-surface-elevated text-ink border border-border/60",
            )}
          >
            Lunch (11:30 – 15:30)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedMealPeriod === "dinner"}
            onClick={() => onSelectMealPeriod("dinner")}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2",
              selectedMealPeriod === "dinner"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-surface hover:bg-surface-elevated text-ink border border-border/60",
            )}
          >
            Dinner (17:00 – 22:30)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="text-ink-subtle absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by guest, phone, note..."
            aria-label="Search reservations"
            className="pr-9 pl-9 text-xs"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="text-ink-subtle hover:text-ink absolute top-1/2 right-1 size-7 -translate-y-1/2 p-0"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Reservations Cards Grid */}
      {reservations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CalendarCheck className="text-ink-subtle mb-3 size-10 stroke-1" />
          <h2 className="text-ink font-display text-base font-semibold">No reservations found</h2>
          <p className="text-ink-subtle mt-1 text-xs">
            There are no reservations matching the selected shift or search query.
          </p>
        </Card>
      ) : (
        <div
          data-testid="reservations-grid"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {reservations.map((res) => {
            const isPending = res.status === "pending";
            const isConfirmed = res.status === "confirmed";

            return (
              <Card
                key={res.id}
                data-testid={`reservation-card-${res.id}`}
                className={cn(
                  "relative flex flex-col justify-between overflow-hidden transition-all duration-200 shadow-xs",
                  isConfirmed && "border-emerald-500/40 bg-emerald-500/5",
                  isPending && "border-amber-500/40 bg-amber-500/5",
                  res.status === "seated" && "opacity-75 bg-surface-elevated/40",
                  res.status === "cancelled" && "opacity-50 line-through bg-surface-elevated/20",
                )}
              >
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  {/* Top row: Guest name & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-ink font-display text-base font-bold tracking-tight">
                      {res.guestName}
                    </h2>
                    {getStatusBadge(res.status)}
                  </div>

                  {/* Details row: Time, Party size, Table */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="text-ink-subtle flex items-center gap-1 font-semibold">
                      <Clock className="text-primary size-3.5" />
                      <span className="text-ink font-mono">{formatTime(res.reservationTime)}</span>
                    </div>

                    <div className="text-ink-subtle flex items-center gap-1">
                      <Users className="size-3.5" />
                      <span>
                        <strong className="text-ink font-mono">{res.partySize}</strong> Guests
                      </span>
                    </div>

                    {res.tableNumber ? (
                      <Badge variant="secondary" className="font-mono text-[11px] font-semibold">
                        Table {res.tableNumber}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-ink-subtle text-[11px]">
                        Table Unassigned
                      </Badge>
                    )}
                  </div>

                  {/* Phone */}
                  {res.contactPhone && (
                    <div className="text-ink-subtle flex items-center gap-1.5 font-mono text-xs">
                      <Phone className="size-3" />
                      <span>{res.contactPhone}</span>
                    </div>
                  )}

                  {/* Special Requests */}
                  {res.specialRequests && (
                    <div className="border-border/60 bg-surface flex items-start gap-1.5 rounded-md border p-2 text-xs">
                      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                      <span className="text-ink-subtle">{res.specialRequests}</span>
                    </div>
                  )}

                  {/* Action controls */}
                  <div className="border-border/50 mt-auto flex items-center justify-end gap-2 border-t pt-2.5">
                    {isPending && (
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        disabled={isUpdating}
                        onClick={() => onCheckIn(res)}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <CheckCircle className="size-3.5" />
                        Check In
                      </Button>
                    )}

                    {isConfirmed && (
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        disabled={isUpdating}
                        onClick={() => onSeat(res)}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <Armchair className="size-3.5" />
                        Seat Party
                      </Button>
                    )}

                    {res.status !== "cancelled" && res.status !== "seated" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={isUpdating}
                        onClick={() => onCancel(res)}
                        aria-label={`Cancel reservation for ${res.guestName}`}
                        className="text-ink-subtle hover:text-destructive text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
