import { useMemo, useState } from "react";
import { toast } from "../../../components/ui";
import {
  useGetQueueQuery,
  useAddToQueueMutation,
  useUpdateQueueStatusMutation,
  useGetTablesQuery,
  useUpdateTableStatusMutation,
} from "../../../app/api/catalog";
import type { Table, QueuePartyDto } from "../../../types/catalog";
import type { AddWalkInFormData } from "../types/queue";

export interface UseWaitlistOptions {
  restaurantId: string;
}

export function useWaitlist({ restaurantId }: UseWaitlistOptions) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [partyToSeat, setPartyToSeat] = useState<QueuePartyDto | null>(null);

  const {
    data: queue = [],
    isLoading: isQueueLoading,
    isError: isQueueError,
    refetch: refetchQueue,
  } = useGetQueueQuery({ restaurantId }, { skip: !restaurantId });

  const { data: tables = [], refetch: refetchTables } = useGetTablesQuery(
    { restaurantId },
    { skip: !restaurantId },
  );

  const [addToQueueMutation, { isLoading: isAdding }] = useAddToQueueMutation();
  const [updateQueueStatusMutation, { isLoading: isUpdatingStatus }] =
    useUpdateQueueStatusMutation();
  const [updateTableStatusMutation] = useUpdateTableStatusMutation();

  // Sort: active parties first (waiting, notified) by createdAt ascending, then seated/cancelled
  const sortedQueue = useMemo(() => {
    return [...queue].sort((a, b) => {
      const activeA = a.status === "waiting" || a.status === "notified";
      const activeB = b.status === "waiting" || b.status === "notified";
      if (activeA && !activeB) return -1;
      if (!activeA && activeB) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [queue]);

  const waitingCount = useMemo(() => queue.filter((p) => p.status === "waiting").length, [queue]);
  const notifiedCount = useMemo(() => queue.filter((p) => p.status === "notified").length, [queue]);
  const seatedCount = useMemo(() => queue.filter((p) => p.status === "seated").length, [queue]);

  // Available tables suitable for seating
  const availableTables = useMemo(
    () => tables.filter((t) => (t.status ?? "Available") === "Available"),
    [tables],
  );

  const addParty = async (data: AddWalkInFormData) => {
    try {
      await addToQueueMutation({
        restaurantId,
        ...data,
      }).unwrap();
      toast.success(`Added ${data.guestName} (party of ${data.partySize}) to waitlist.`);
      setIsAddDialogOpen(false);
    } catch {
      toast.error("Failed to add party to waitlist.");
    }
  };

  const notifyParty = async (party: QueuePartyDto) => {
    try {
      await updateQueueStatusMutation({
        restaurantId,
        partyId: party.id,
        status: "notified",
      }).unwrap();
      toast.success(
        `SMS notification sent to ${party.guestName} (${party.phone}): "Your table is ready!"`,
      );
    } catch {
      toast.error("Failed to notify party.");
    }
  };

  const seatParty = async (party: QueuePartyDto, table: Table) => {
    try {
      await updateQueueStatusMutation({
        restaurantId,
        partyId: party.id,
        status: "seated",
        allocatedTableId: table.id,
        allocatedTableNumber: table.tableNumber,
      }).unwrap();

      await updateTableStatusMutation({
        restaurantId,
        tableId: table.id,
        status: "Occupied",
      }).unwrap();

      toast.success(`${party.guestName} seated at Table ${table.tableNumber}.`);
      setPartyToSeat(null);
    } catch {
      toast.error("Failed to seat party.");
    }
  };

  const cancelParty = async (party: QueuePartyDto) => {
    try {
      await updateQueueStatusMutation({
        restaurantId,
        partyId: party.id,
        status: "cancelled",
      }).unwrap();
      toast.info(`${party.guestName} marked as No Show / Removed.`);
    } catch {
      toast.error("Failed to update party status.");
    }
  };

  const refetchAll = () => {
    refetchQueue();
    refetchTables();
  };

  return {
    queue: sortedQueue,
    rawQueue: queue,
    waitingCount,
    notifiedCount,
    seatedCount,
    availableTables,
    isAddDialogOpen,
    setIsAddDialogOpen,
    partyToSeat,
    setPartyToSeat,
    isLoading: isQueueLoading,
    isError: isQueueError,
    isAdding,
    isUpdatingStatus,
    addParty,
    notifyParty,
    seatParty,
    cancelParty,
    refetchAll,
  };
}
