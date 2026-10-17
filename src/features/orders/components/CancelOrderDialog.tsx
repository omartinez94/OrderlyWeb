/**
 * CancelOrderDialog — modal dialog for order cancellation with mandatory reason code.
 *
 * Implements "The Stainless Line" industrial aesthetic:
 *   - Explicit cancellation reason dropdown
 *   - Optional / required context notes
 *   - Error toast catching for 409 conflict states
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { useCancelOrderMutation } from "../../../app/api/orders";

export interface CancelOrderDialogProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled?: () => void;
}

export const CANCELLATION_REASONS = [
  { value: "CustomerRequest", labelKey: "detail.cancelReasonCustomer" as const },
  { value: "KitchenOutOfStock", labelKey: "detail.cancelReasonOutOfStock" as const },
  { value: "AccidentalDuplicate", labelKey: "detail.cancelReasonDuplicate" as const },
  { value: "Other", labelKey: "detail.cancelReasonOther" as const },
] as const;

export function CancelOrderDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
  onCancelled,
}: CancelOrderDialogProps) {
  const { t } = useTranslation("orders");
  const [cancelOrder, { isLoading }] = useCancelOrderMutation();

  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      setValidationError(t("detail.cancelReasonSelect"));
      return;
    }

    if (reason === "Other" && !notes.trim()) {
      setValidationError(t("detail.cancelNotesPlaceholder"));
      return;
    }

    setValidationError(null);

    try {
      const fullReason = notes.trim() ? `${reason}: ${notes.trim()}` : reason;
      await cancelOrder({ id: orderId, reason: fullReason }).unwrap();
      toast.success(t("detail.cancelSuccess", { orderNumber }));
      onOpenChange(false);
      onCancelled?.();
    } catch {
      toast.error(t("detail.cancelError"));
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason("");
      setNotes("");
      setValidationError(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-surface-elevated text-ink max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-2">
            <div className="text-danger flex items-center gap-2">
              <AlertTriangle className="size-5 shrink-0" />
              <DialogTitle className="font-display text-lg font-bold">
                {t("detail.cancelModalTitle", { orderNumber })}
              </DialogTitle>
            </div>
            <DialogDescription className="text-ink-muted text-xs">
              {t("detail.cancelModalDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Reason Select */}
            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason" className="text-ink text-xs font-semibold">
                {t("detail.cancelReason")} *
              </Label>
              <Select
                value={reason}
                onValueChange={(val) => {
                  setReason(val);
                  setValidationError(null);
                }}
              >
                <SelectTrigger id="cancel-reason" className="w-full text-xs" aria-required="true">
                  <SelectValue placeholder={t("detail.cancelReasonSelect")} />
                </SelectTrigger>
                <SelectContent className="bg-surface-elevated text-ink">
                  {CANCELLATION_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="text-xs">
                      {t(r.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Notes Textarea */}
            <div className="space-y-1.5">
              <Label htmlFor="cancel-notes" className="text-ink text-xs font-semibold">
                {t("detail.cancelNotes")} {reason === "Other" && "*"}
              </Label>
              <Textarea
                id="cancel-notes"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setValidationError(null);
                }}
                placeholder={t("detail.cancelNotesPlaceholder")}
                className="min-h-[80px] text-xs"
                rows={3}
              />
            </div>

            {/* Validation Feedback */}
            {validationError && (
              <p className="text-danger animate-in fade-in-0 text-xs font-medium">
                {validationError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => handleOpenChange(false)}
            >
              {t("detail.cancelDismiss")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isLoading || !reason}
              className="gap-1.5"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{t("detail.cancelConfirm")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
