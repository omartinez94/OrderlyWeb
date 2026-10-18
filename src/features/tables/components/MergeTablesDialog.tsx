import { useState } from "react";
import { Link2 } from "lucide-react";
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
  toast,
} from "../../../components/ui";
import type { Table } from "../../../types/catalog";

export interface MergeTablesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTables: Table[];
  onMerge: (parentTableId: string, childTableId: string) => Promise<void>;
  isMerging?: boolean;
}

export function MergeTablesDialog({
  open,
  onOpenChange,
  availableTables,
  onMerge,
  isMerging = false,
}: MergeTablesDialogProps) {
  const [parentTableId, setParentTableId] = useState<string>("");
  const [childTableId, setChildTableId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentTableId || !childTableId) {
      toast.error("Please select two tables to merge.");
      return;
    }
    if (parentTableId === childTableId) {
      toast.error("Parent and child tables must be different.");
      return;
    }

    try {
      await onMerge(parentTableId, childTableId);
      toast.success("Tables merged successfully.");
      onOpenChange(false);
      setParentTableId("");
      setChildTableId("");
    } catch {
      toast.error("Failed to merge tables.");
    }
  };

  const candidateChildren = availableTables.filter((t) => t.id !== parentTableId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="text-primary size-5" />
              Merge Dining Tables
            </DialogTitle>
            <DialogDescription>
              Select two available tables to combine their seating capacity for larger parties.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="primary-table" className="text-ink text-xs font-semibold">
                Primary Table
              </label>
              <Select value={parentTableId} onValueChange={setParentTableId}>
                <SelectTrigger id="primary-table" aria-label="Select primary table">
                  <SelectValue placeholder="Select primary table..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      Table {t.tableNumber} ({t.capacity} seats • {t.section ?? "Main"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="secondary-table" className="text-ink text-xs font-semibold">
                Secondary Table to Merge
              </label>
              <Select
                value={childTableId}
                onValueChange={setChildTableId}
                disabled={!parentTableId}
              >
                <SelectTrigger id="secondary-table" aria-label="Select secondary table">
                  <SelectValue placeholder="Select table to merge with..." />
                </SelectTrigger>
                <SelectContent>
                  {candidateChildren.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      Table {t.tableNumber} ({t.capacity} seats • {t.section ?? "Main"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isMerging || !parentTableId || !childTableId}>
              {isMerging ? "Merging..." : "Merge Tables"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
