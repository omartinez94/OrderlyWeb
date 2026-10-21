/**
 * ReceiptModal — thermal receipt preview modal with print formatting.
 *
 * Implements "The Stainless Line" industrial aesthetic:
 *   - Monospace typography and dashed boundary rules
 *   - Order metadata, timestamps, item breakdowns, and tax rates
 *   - Cash tender calculations and payment method badges
 *   - Native window.print() dispatch
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { formatCurrency } from "../../../utils/currency";
import { formatDate, getDateFnsLocale } from "../../../utils/date";
import { PaymentMethod, type OrderDto } from "../../../types/order";
import type { ComputedBill } from "../hooks/useSplitBill";

export interface ReceiptModalProps {
  order: OrderDto;
  bill: ComputedBill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptModal({ order, bill, open, onOpenChange }: ReceiptModalProps) {
  const { t, i18n } = useTranslation("orders");

  // Ctrl+P / Cmd+P print shortcut when open
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!bill) return null;

  const itemsMap = new Map((order.orderItems || []).map((item) => [item.id, item]));
  const assignedItems = (bill.assignedItemIds || []).map((id) => itemsMap.get(id)).filter(Boolean);

  const formattedDate = formatDate(
    new Date().toISOString(),
    "MMM d, yyyy h:mm a",
    getDateFnsLocale(i18n.language),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-elevated text-ink max-w-sm p-6 font-mono text-xs">
        <DialogHeader className="border-border-subtle border-b border-dashed pb-2 text-center">
          <DialogTitle className="font-display text-ink text-center text-base font-bold tracking-wider">
            ORDERLY RESTAURANT
          </DialogTitle>
          <p className="text-ink-muted text-[11px]">Thermal Receipt Voucher</p>
        </DialogHeader>

        {/* Receipt Body */}
        <div className="space-y-3 py-3 text-xs leading-relaxed">
          {/* Metadata */}
          <div className="text-ink-muted flex justify-between text-[11px]">
            <span>{formattedDate}</span>
            <span className="text-ink font-bold">{order.orderNumber}</span>
          </div>

          <div className="text-ink-muted flex justify-between text-[11px]">
            <span>{bill.name}</span>
            <span>
              {order.tableId ? `Table ${order.tableId.replace(/^[a-zA-Z]-/, "")}` : order.orderType}
            </span>
          </div>

          <div className="border-border-subtle my-2 border-t border-dashed" />

          {/* Assigned Items (if custom) */}
          {assignedItems.length > 0 ? (
            <div className="space-y-1.5 py-1">
              {assignedItems.map((item) => (
                <div key={item!.id} className="flex items-start justify-between gap-2">
                  <span className="max-w-[180px] truncate">
                    {item!.quantity}x {item!.menuItemName}
                  </span>
                  <span className="font-bold">
                    {formatCurrency(item!.totalPrice, order.currency || "USD", i18n.language)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-ink-muted py-1 text-center text-[11px]">
              Equal Split Share ({bill.name})
            </div>
          )}

          <div className="border-border-subtle my-2 border-t border-dashed" />

          {/* Financial Breakdown */}
          <div className="space-y-1 text-xs">
            <div className="text-ink-muted flex justify-between">
              <span>{t("detail.subtotal")}</span>
              <span>{formatCurrency(bill.subtotal, order.currency || "USD", i18n.language)}</span>
            </div>
            <div className="text-ink-muted flex justify-between">
              <span>
                {t("detail.tax")} ({(order.taxRate * 100).toFixed(0)}%)
              </span>
              <span>{formatCurrency(bill.tax, order.currency || "USD", i18n.language)}</span>
            </div>
            <div className="text-ink border-border-subtle flex justify-between border-t pt-1 text-sm font-bold">
              <span>{t("detail.total")}</span>
              <span className="text-primary">
                {formatCurrency(bill.total, order.currency || "USD", i18n.language)}
              </span>
            </div>
          </div>

          {/* Payment Method & Change */}
          {bill.isPaid && (
            <div className="mt-3 space-y-1 rounded border border-emerald-500/30 bg-emerald-500/5 p-2 text-[11px]">
              <div className="flex justify-between font-bold text-emerald-800 dark:text-emerald-300">
                <span>PAID</span>
                <span>{bill.paymentMethod || PaymentMethod.CreditCard}</span>
              </div>
              {bill.tenderAmount !== undefined && (
                <>
                  <div className="text-ink-muted flex justify-between">
                    <span>{t("split.tenderAmount")}</span>
                    <span>
                      {formatCurrency(bill.tenderAmount, order.currency || "USD", i18n.language)}
                    </span>
                  </div>
                  <div className="text-ink-muted flex justify-between">
                    <span>{t("split.changeDue")}</span>
                    <span>
                      {formatCurrency(bill.changeDue ?? 0, order.currency || "USD", i18n.language)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-border-subtle flex-row justify-between gap-2 border-t border-dashed pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            {t("split.close")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            className="bg-primary gap-1.5 text-xs text-white"
          >
            <Printer className="size-3.5" />
            <span>{t("split.printReceipt")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
