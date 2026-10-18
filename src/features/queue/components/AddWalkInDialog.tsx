import { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
} from "../../../components/ui";
import type { AddWalkInFormData } from "../types/queue";

export interface AddWalkInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddParty: (data: AddWalkInFormData) => Promise<void>;
  isAdding?: boolean;
}

export function AddWalkInDialog({
  open,
  onOpenChange,
  onAddParty,
  isAdding = false,
}: AddWalkInDialogProps) {
  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [phone, setPhone] = useState("");
  const [quotedWaitMinutes, setQuotedWaitMinutes] = useState(15);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim() || partySize < 1) return;

    await onAddParty({
      guestName: guestName.trim(),
      partySize,
      phone: phone.trim(),
      quotedWaitMinutes: Number(quotedWaitMinutes) || 15,
    });

    setGuestName("");
    setPartySize(2);
    setPhone("");
    setQuotedWaitMinutes(15);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="text-primary size-5" />
              Add Walk-In Guest
            </DialogTitle>
            <DialogDescription>
              Record party details and estimated wait time to add them to the active waitlist.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="guest-name" className="text-ink text-xs font-semibold">
                Guest Name
              </label>
              <Input
                id="guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Marco Rossi"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="party-size" className="text-ink text-xs font-semibold">
                  Party Size
                </label>
                <Input
                  id="party-size"
                  type="number"
                  min={1}
                  max={20}
                  value={partySize}
                  onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="quoted-wait" className="text-ink text-xs font-semibold">
                  Quoted Wait (min)
                </label>
                <Input
                  id="quoted-wait"
                  type="number"
                  min={5}
                  step={5}
                  value={quotedWaitMinutes}
                  onChange={(e) => setQuotedWaitMinutes(parseInt(e.target.value, 10) || 15)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-phone" className="text-ink text-xs font-semibold">
                Contact Phone (for SMS Notification)
              </label>
              <Input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || !guestName.trim() || !phone.trim()}>
              {isAdding ? "Adding..." : "Add to Waitlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
