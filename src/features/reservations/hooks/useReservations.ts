import { useMemo, useState } from "react";
import { parseISO, getHours } from "date-fns";
import { toast } from "../../../components/ui";
import {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationStatusMutation,
  useGetTablesQuery,
  useUpdateTableStatusMutation,
} from "../../../app/api/catalog";
import type { ReservationDto } from "../../../types/catalog";
import type { MealPeriod, CreateReservationFormData } from "../types/reservation";

export interface UseReservationsOptions {
  restaurantId: string;
}

export function useReservations({ restaurantId }: UseReservationsOptions) {
  const [selectedMealPeriod, setSelectedMealPeriod] = useState<MealPeriod>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [reservationToCheckIn, setReservationToCheckIn] = useState<ReservationDto | null>(null);

  const {
    data: reservations = [],
    isLoading: isReservationsLoading,
    isError: isReservationsError,
    refetch: refetchReservations,
  } = useGetReservationsQuery({ restaurantId }, { skip: !restaurantId });

  const { data: tables = [], refetch: refetchTables } = useGetTablesQuery(
    { restaurantId },
    { skip: !restaurantId },
  );

  const [createReservationMutation, { isLoading: isCreating }] = useCreateReservationMutation();
  const [updateReservationStatusMutation, { isLoading: isUpdatingStatus }] =
    useUpdateReservationStatusMutation();
  const [updateTableStatusMutation] = useUpdateTableStatusMutation();

  const availableTables = useMemo(
    () => tables.filter((t) => (t.status ?? "Available") === "Available"),
    [tables],
  );

  // Filtered reservations based on meal period and search
  const filteredReservations = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    return reservations.filter((res) => {
      // Meal period filter
      if (selectedMealPeriod !== "all") {
        try {
          const hour = getHours(parseISO(res.reservationTime));
          const isLunch = hour >= 11 && hour < 16;
          const isDinner = hour >= 16 && hour < 23;
          if (selectedMealPeriod === "lunch" && !isLunch) return false;
          if (selectedMealPeriod === "dinner" && !isDinner) return false;
        } catch {
          // keep if unparseable
        }
      }

      // Search filter
      if (trimmed) {
        const matchesName = res.guestName.toLowerCase().includes(trimmed);
        const matchesPhone = res.contactPhone?.toLowerCase().includes(trimmed);
        const matchesRequests = res.specialRequests?.toLowerCase().includes(trimmed);
        const matchesTable = res.tableNumber?.toLowerCase().includes(trimmed);
        return matchesName || matchesPhone || matchesRequests || matchesTable;
      }

      return true;
    });
  }, [reservations, selectedMealPeriod, searchQuery]);

  // Status counts
  const totalCount = reservations.length;
  const confirmedCount = useMemo(
    () => reservations.filter((r) => r.status === "confirmed").length,
    [reservations],
  );
  const pendingCount = useMemo(
    () => reservations.filter((r) => r.status === "pending").length,
    [reservations],
  );
  const seatedCount = useMemo(
    () => reservations.filter((r) => r.status === "seated").length,
    [reservations],
  );

  const checkInReservation = async (
    reservation: ReservationDto,
    tableId?: string,
    tableNumber?: string,
  ) => {
    try {
      await updateReservationStatusMutation({
        restaurantId,
        reservationId: reservation.id,
        status: "confirmed",
        tableId: tableId ?? reservation.tableId,
        tableNumber: tableNumber ?? reservation.tableNumber,
      }).unwrap();

      toast.success(`Reservation for ${reservation.guestName} checked in and confirmed.`);
      setReservationToCheckIn(null);
    } catch {
      toast.error("Failed to check in reservation.");
    }
  };

  const seatReservation = async (reservation: ReservationDto) => {
    try {
      await updateReservationStatusMutation({
        restaurantId,
        reservationId: reservation.id,
        status: "seated",
      }).unwrap();

      if (reservation.tableId) {
        await updateTableStatusMutation({
          restaurantId,
          tableId: reservation.tableId,
          status: "Occupied",
        }).unwrap();
      }

      toast.success(
        `${reservation.guestName} seated${
          reservation.tableNumber ? ` at Table ${reservation.tableNumber}` : ""
        }.`,
      );
    } catch {
      toast.error("Failed to seat reservation.");
    }
  };

  const cancelReservation = async (reservation: ReservationDto) => {
    try {
      await updateReservationStatusMutation({
        restaurantId,
        reservationId: reservation.id,
        status: "cancelled",
      }).unwrap();

      toast.info(`Reservation for ${reservation.guestName} cancelled.`);
    } catch {
      toast.error("Failed to cancel reservation.");
    }
  };

  const createReservation = async (formData: CreateReservationFormData) => {
    try {
      await createReservationMutation({
        restaurantId,
        ...formData,
      }).unwrap();

      toast.success(`Reservation created for ${formData.guestName}.`);
      setIsNewDialogOpen(false);
    } catch {
      toast.error("Failed to create reservation.");
    }
  };

  const refetchAll = () => {
    refetchReservations();
    refetchTables();
  };

  return {
    reservations: filteredReservations,
    allReservations: reservations,
    availableTables,
    totalCount,
    confirmedCount,
    pendingCount,
    seatedCount,
    selectedMealPeriod,
    setSelectedMealPeriod,
    searchQuery,
    setSearchQuery,
    isNewDialogOpen,
    setIsNewDialogOpen,
    reservationToCheckIn,
    setReservationToCheckIn,
    isLoading: isReservationsLoading,
    isError: isReservationsError,
    isCreating,
    isUpdatingStatus,
    checkInReservation,
    seatReservation,
    cancelReservation,
    createReservation,
    refetchAll,
  };
}
