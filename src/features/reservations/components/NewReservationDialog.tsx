import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui";
import type { Table } from "../../../types/catalog";
import type { CreateReservationFormData } from "../types/reservation";

export interface NewReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTables: Table[];
  onCreateReservation: (data: CreateReservationFormData) => Promise<void>;
  isCreating?: boolean;
}

export function NewReservationDialog({
  open,
  onOpenChange,
  availableTables,
  onCreateReservation,
  isCreating = false,
}: NewReservationDialogProps) {
  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [reservationTime, setReservationTime] = useState(
    new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
  );
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<string>("unassigned");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const table = availableTables.find((t) => t.id === selectedTableId);

    await onCreateReservation({
      guestName: guestName.trim(),
      partySize,
      reservationTime: new Date(reservationTime).toISOString(),
      contactPhone: contactPhone.trim() || undefined,
      specialRequests: specialRequests.trim() || undefined,
      tableId: table?.id,
      tableNumber: table?.tableNumber,
    });

    setGuestName("");
    setPartySize(2);
    setContactPhone("");
    setSpecialRequests("");
    setSelectedTableId("unassigned");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="text-primary size-5" />
              New Table Reservation
            </DialogTitle>
            <DialogDescription>
              Record booking details, table pre-allocations, and guest preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3.5 py-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="res-guest-name" className="text-ink text-xs font-semibold">
                Guest Name
              </label>
              <Input
                id="res-guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Sophia Loren"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="res-party-size" className="text-ink text-xs font-semibold">
                  Party Size
                </label>
                <Input
                  id="res-party-size"
                  type="number"
                  min={1}
                  max={30}
                  value={partySize}
                  onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="res-time" className="text-ink text-xs font-semibold">
                  Date & Time
                </label>
                <Input
                  id="res-time"
                  type="datetime-local"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="res-phone" className="text-ink text-xs font-semibold">
                Contact Phone
              </label>
              <Input
                id="res-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="res-table" className="text-ink text-xs font-semibold">
                Table Pre-Allocation (Optional)
              </label>
              <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                <SelectTrigger id="res-table" aria-label="Assign table">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                  {availableTables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      Table {t.tableNumber} ({t.capacity} seats • {t.section ?? "Main"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="res-notes" className="text-ink text-xs font-semibold">
                Special Requests & Dietary Notes
              </label>
              <Textarea
                id="res-notes"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Window booth preferred, high chair needed, anniversary celebration"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !guestName.trim()}>
              {isCreating ? "Saving..." : "Create Reservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
