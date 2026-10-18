import { useState, useMemo } from "react";
import { Armchair, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui";
import type { Table } from "../../../types/catalog";
import type { QueuePartyDto } from "../types/queue";

export interface CheckInDialogProps {
  party: QueuePartyDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTables: Table[];
  onConfirmSeat: (party: QueuePartyDto, table: Table) => Promise<void>;
  isSeating?: boolean;
}

export function CheckInDialog({
  party,
  open,
  onOpenChange,
  availableTables,
  onConfirmSeat,
  isSeating = false,
}: CheckInDialogProps) {
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  // Recommend tables with capacity >= partySize
  const suitableTables = useMemo(() => {
    if (!party) return availableTables;
    return availableTables.filter((t) => t.capacity >= party.partySize);
  }, [availableTables, party]);

  const allAvailable = suitableTables.length > 0 ? suitableTables : availableTables;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!party || !selectedTableId) return;

    const table = availableTables.find((t) => t.id === selectedTableId);
    if (!table) return;

    await onConfirmSeat(party, table);
    setSelectedTableId("");
  };

  if (!party) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Armchair className="text-primary size-5" />
              Seat Party: {party.guestName}
            </DialogTitle>
            <DialogDescription>
              Assign an available dining table for this party of {party.partySize}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="border-border/60 bg-surface flex items-center justify-between rounded-md border p-3 text-xs">
              <div className="flex items-center gap-2">
                <Users className="text-primary size-4" />
                <span className="text-ink font-semibold">Party Size</span>
              </div>
              <span className="text-ink font-mono font-bold">{party.partySize} Guests</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="select-table" className="text-ink text-xs font-semibold">
                Select Dining Table
              </label>
              {allAvailable.length === 0 ? (
                <p className="text-destructive text-xs">
                  No available tables currently meet capacity requirements.
                </p>
              ) : (
                <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                  <SelectTrigger id="select-table" aria-label="Select table to seat">
                    <SelectValue placeholder="Choose an available table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allAvailable.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        Table {t.tableNumber} ({t.capacity} seats • {t.section ?? "Main"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSeating || !selectedTableId}>
              {isSeating ? "Seating..." : "Confirm Seating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
