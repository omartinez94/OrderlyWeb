/**
 * SplitBillAssignment — interactive bill splitting and settlement simulation workstation.
 *
 * Implements:
 *   - Equal Split (2 to 10 ways) with cent-balanced rounding
 *   - Custom / By Seat item allocation with unassigned item alerts
 *   - Cash tender calculator and change due readouts
 *   - Per-bill settlement and receipt preview integration
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  Utensils,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Receipt,
  DollarSign,
  CreditCard,
  Building,
  Minus,
} from "lucide-react";
import { useSplitBill, type ComputedBill } from "../hooks/useSplitBill";
import { ReceiptModal } from "./ReceiptModal";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { formatCurrency } from "../../../utils/currency";
import type { OrderDto } from "../../../types/order";
import { cn } from "../../../lib/utils";

export interface SplitBillAssignmentProps {
  order: OrderDto;
}

export function SplitBillAssignment({ order }: SplitBillAssignmentProps) {
  const { t, i18n } = useTranslation("orders");

  const {
    splitMode,
    setSplitMode,
    ways,
    setWays,
    payers,
    addPayer,
    removePayer,
    assignItemToPayer,
    recordPayment,
    unassignedItemCount,
    bills,
    totalSplitAmount,
    isBalanced,
    isFullyPaid,
  } = useSplitBill({ order });

  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<ComputedBill | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Settlement draft state for individual bills: billId -> { method, tender }
  const [tenderDrafts, setTenderDrafts] = useState<
    Record<string, { method: string; tender: string }>
  >({});

  const handleOpenReceipt = (bill: ComputedBill) => {
    setSelectedBillForReceipt(bill);
    setReceiptOpen(true);
  };

  const handlePayBill = (bill: ComputedBill) => {
    const draft = tenderDrafts[bill.id] || { method: "CreditCard", tender: "" };
    const tenderNum = parseFloat(draft.tender);
    const changeDue =
      !isNaN(tenderNum) && tenderNum >= bill.total
        ? Math.round((tenderNum - bill.total) * 100) / 100
        : undefined;

    recordPayment(bill.id, draft.method, isNaN(tenderNum) ? undefined : tenderNum, changeDue);
  };

  const updateDraft = (billId: string, updates: Partial<{ method: string; tender: string }>) => {
    setTenderDrafts((prev) => ({
      ...prev,
      [billId]: {
        method: updates.method ?? prev[billId]?.method ?? "CreditCard",
        tender: updates.tender ?? prev[billId]?.tender ?? "",
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector and Status Banner */}
      <div className="border-border-subtle bg-surface-elevated flex flex-col gap-4 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Toggle Mode */}
        <div className="border-border-subtle bg-surface inline-flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setSplitMode("equal")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              splitMode === "equal"
                ? "bg-surface-elevated text-primary shadow-xs"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <Users className="size-3.5" />
            <span>{t("split.evenly")}</span>
          </button>
          <button
            type="button"
            onClick={() => setSplitMode("custom")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              splitMode === "custom"
                ? "bg-surface-elevated text-primary shadow-xs"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <Utensils className="size-3.5" />
            <span>{t("split.byItem")}</span>
          </button>
        </div>

        {/* Balance Status Readout */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-ink-muted">{t("detail.total")}:</span>
            <span className="text-ink font-mono font-bold">
              {formatCurrency(totalSplitAmount, order.currency || "USD", i18n.language)}
            </span>
            <span className="text-ink-subtle">/</span>
            <span className="text-ink-muted font-mono">
              {formatCurrency(order.totalAmount, order.currency || "USD", i18n.language)}
            </span>
          </div>

          {isBalanced ? (
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle className="size-3" />
              <span>Balanced (&plusmn;0.00)</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-400"
            >
              <AlertTriangle className="size-3" />
              <span>{t("split.balanceWarning")}</span>
            </Badge>
          )}

          {isFullyPaid && (
            <Badge className="bg-emerald-600 text-[11px] font-bold text-white">Fully Settled</Badge>
          )}
        </div>
      </div>

      {/* Mode Controls */}
      {splitMode === "equal" ? (
        <div className="border-border-subtle bg-surface-elevated flex items-center gap-3 rounded-xl border p-4 shadow-xs">
          <span className="text-ink text-xs font-semibold">
            {t("split.waysCount", { count: ways })}:
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={ways <= 2}
              onClick={() => setWays((w) => Math.max(2, w - 1))}
              className="size-8 p-0"
              aria-label="Decrease split ways"
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="text-primary flex size-8 items-center justify-center font-mono text-sm font-bold">
              {ways}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={ways >= 10}
              onClick={() => setWays((w) => Math.min(10, w + 1))}
              className="size-8 p-0"
              aria-label="Increase split ways"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
          <span className="text-ink-muted text-[11px]">
            (Final bill automatically balances rounding cents)
          </span>
        </div>
      ) : (
        /* Custom Item Assignment Section */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-ink text-sm font-bold">Payer Item Assignments</h3>
              {unassignedItemCount > 0 && (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-700"
                >
                  {t("split.unassignedWarning", { count: unassignedItemCount })}
                </Badge>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPayer}
              disabled={payers.length >= 10}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              <span>{t("split.addPayer")}</span>
            </Button>
          </div>

          {/* Items Assignment Matrix */}
          <div className="border-border-subtle bg-surface-elevated space-y-3 rounded-xl border p-4 shadow-xs">
            <h4 className="text-ink-muted text-xs font-bold tracking-wider uppercase">
              Select Payer for each item
            </h4>
            <div className="divide-border-subtle divide-y">
              {order.orderItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-mono text-xs font-bold">
                      {item.quantity}x
                    </span>
                    <span className="text-ink text-sm font-medium">{item.menuItemName}</span>
                    <span className="text-ink-muted text-xs">
                      ({formatCurrency(item.totalPrice, order.currency || "USD", i18n.language)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {payers.map((p) => {
                      const isAssigned = p.assignedItemIds.includes(item.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => assignItemToPayer(item.id, p.id)}
                          className={cn(
                            "rounded px-2.5 py-1 text-xs font-medium transition-all",
                            isAssigned
                              ? "bg-primary text-white shadow-xs"
                              : "bg-surface hover:bg-surface-elevated text-ink-muted border border-border-subtle",
                          )}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Computed Bills Grid */}
      <div className="space-y-3">
        <h2 className="text-ink-muted text-xs font-bold tracking-wider uppercase">
          Bills Breakdown
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => {
            const draft = tenderDrafts[bill.id] || { method: "CreditCard", tender: "" };
            const tenderNum = parseFloat(draft.tender);
            const changeDue =
              !isNaN(tenderNum) && tenderNum >= bill.total
                ? Math.round((tenderNum - bill.total) * 100) / 100
                : 0;

            return (
              <div
                key={bill.id}
                className={cn(
                  "rounded-xl border p-4 shadow-xs space-y-3 flex flex-col justify-between transition-colors",
                  bill.isPaid
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border-subtle bg-surface-elevated",
                )}
              >
                <div>
                  <div className="border-border-subtle flex items-center justify-between border-b pb-2">
                    <h3 className="font-display text-ink text-sm font-bold">{bill.name}</h3>
                    {bill.isPaid ? (
                      <Badge className="gap-1 bg-emerald-600 text-[11px] text-white">
                        <CheckCircle className="size-3" />
                        <span>{t("split.paid")}</span>
                      </Badge>
                    ) : (
                      splitMode === "custom" &&
                      payers.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePayer(bill.id)}
                          className="text-ink-muted hover:text-danger size-6 p-0"
                          aria-label={`Remove ${bill.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )
                    )}
                  </div>

                  {/* Amounts Breakdown */}
                  <div className="space-y-1 py-2 text-xs">
                    <div className="text-ink-muted flex justify-between">
                      <span>{t("detail.subtotal")}</span>
                      <span className="font-mono">
                        {formatCurrency(bill.subtotal, order.currency || "USD", i18n.language)}
                      </span>
                    </div>
                    <div className="text-ink-muted flex justify-between">
                      <span>{t("detail.tax")}</span>
                      <span className="font-mono">
                        {formatCurrency(bill.tax, order.currency || "USD", i18n.language)}
                      </span>
                    </div>
                    <div className="text-ink border-border-subtle flex justify-between border-t pt-1 text-sm font-bold">
                      <span>{t("detail.total")}</span>
                      <span className="text-primary font-mono font-bold">
                        {formatCurrency(bill.total, order.currency || "USD", i18n.language)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settlement Actions */}
                <div className="border-border-subtle space-y-3 border-t pt-2">
                  {!bill.isPaid ? (
                    <>
                      {/* Method Selector */}
                      <div className="space-y-1">
                        <Label className="text-ink-muted text-[11px]">
                          {t("split.paymentMethod")}
                        </Label>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { id: "CreditCard", icon: CreditCard, label: "Card" },
                            { id: "Cash", icon: DollarSign, label: "Cash" },
                            { id: "Debit", icon: CreditCard, label: "Debit" },
                            { id: "RoomCharge", icon: Building, label: "Room" },
                          ].map((m) => {
                            const Icon = m.icon;
                            const isSelected = draft.method === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => updateDraft(bill.id, { method: m.id })}
                                className={cn(
                                  "flex flex-col items-center gap-1 rounded border p-1 text-[10px] font-medium transition-colors",
                                  isSelected
                                    ? "border-primary bg-primary/10 text-primary font-bold"
                                    : "border-border-subtle text-ink-muted hover:border-ink-muted",
                                )}
                              >
                                <Icon className="size-3" />
                                <span>{m.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cash Tender Calculator */}
                      {draft.method === "Cash" && (
                        <div className="bg-surface/50 space-y-2 rounded-lg p-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <Label
                              htmlFor={`tender-${bill.id}`}
                              className="text-ink-muted text-[11px]"
                            >
                              {t("split.tenderAmount")}:
                            </Label>
                            <Input
                              id={`tender-${bill.id}`}
                              type="number"
                              step="0.01"
                              value={draft.tender}
                              onChange={(e) => updateDraft(bill.id, { tender: e.target.value })}
                              placeholder="0.00"
                              className="h-7 w-24 text-right font-mono text-xs"
                            />
                          </div>

                          {/* Quick Bills ($20, $50, $100) */}
                          <div className="flex justify-end gap-1">
                            {[20, 50, 100].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => updateDraft(bill.id, { tender: String(val) })}
                                className="border-border-subtle bg-surface text-ink-muted hover:text-ink rounded border px-1.5 py-0.5 font-mono text-[10px]"
                              >
                                ${val}
                              </button>
                            ))}
                          </div>

                          {changeDue > 0 && (
                            <div className="flex justify-between font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              <span>{t("split.changeDue")}:</span>
                              <span>
                                {formatCurrency(changeDue, order.currency || "USD", i18n.language)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handlePayBill(bill)}
                        className="bg-primary w-full text-xs font-bold text-white"
                      >
                        {t("split.markPaid")}
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-ink-muted font-mono text-xs">
                        {bill.paymentMethod} • Settled
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReceipt(bill)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Receipt className="text-ink-subtle size-3" />
                        <span>{t("split.printReceipt")}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        order={order}
        bill={selectedBillForReceipt}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </div>
  );
}
