/**
 * CartSidebar — live POS cart inspector and checkout trigger.
 *
 * Persisted in Basket.API via useOrderDraft. Enforces "The Stainless Line"
 * layout rules: Induction Flame Orange for "Send to Kitchen" CTA,
 * coupon resolution feedback, and table/order type context.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Tag,
  ArrowRight,
  Users,
} from "lucide-react";
import { Button, Input, Separator } from "../../../components/ui";
import { useGetTablesQuery } from "../../../app/api/catalog";
import { formatCurrency } from "../../../utils/currency";
import type { useOrderDraft } from "../hooks/useOrderDraft";
import type { OrderType } from "../../../types/order";
import { cn } from "../../../lib/utils";

export interface CartSidebarProps {
  restaurantId: string;
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  tableId: string | undefined;
  onTableChange: (tableId: string | undefined) => void;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  draft: ReturnType<typeof useOrderDraft>;
  onSendToKitchen: () => void;
  isSubmitting?: boolean;
  currency?: string;
  className?: string;
}

export function CartSidebar({
  restaurantId,
  orderType,
  onOrderTypeChange,
  tableId,
  onTableChange,
  guestCount,
  onGuestCountChange,
  draft,
  onSendToKitchen,
  isSubmitting = false,
  currency = "USD",
  className,
}: CartSidebarProps) {
  const { t, i18n } = useTranslation("orders");
  const [couponCode, setCouponCode] = useState("");

  const { data: tables = [] } = useGetTablesQuery({ restaurantId }, { skip: !restaurantId });

  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
    updateQuantity,
    removeItem,
    applyCoupon,
    clearDraft,
    isUpdating,
    isClearing,
  } = draft;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    await applyCoupon(couponCode);
    setCouponCode("");
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border-subtle bg-surface-elevated shadow-sm",
        className,
      )}
    >
      {/* Header Context Controls */}
      <div className="border-border-subtle bg-surface/40 flex flex-col gap-3 border-b p-4">
        {/* Order Type Toggle */}
        <div className="border-border-subtle bg-surface-elevated grid grid-cols-3 gap-1 rounded-lg border p-1">
          <button
            type="button"
            onClick={() => onOrderTypeChange("DineIn")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              orderType === "DineIn"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-surface",
            )}
          >
            <UtensilsCrossed className="size-3.5" />
            <span>{t("types.DineIn")}</span>
          </button>
          <button
            type="button"
            onClick={() => onOrderTypeChange("Takeout")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              orderType === "Takeout"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-surface",
            )}
          >
            <ShoppingBag className="size-3.5" />
            <span>{t("types.Takeout")}</span>
          </button>
          <button
            type="button"
            onClick={() => onOrderTypeChange("Delivery")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              orderType === "Delivery"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-surface",
            )}
          >
            <Bike className="size-3.5" />
            <span>{t("types.Delivery")}</span>
          </button>
        </div>

        {/* Table & Guest Count Row (for Dine In) */}
        {orderType === "DineIn" && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <label
                htmlFor="cart-table-select"
                className="text-ink-muted text-xs font-semibold tracking-wider whitespace-nowrap uppercase"
              >
                {t("create.table")}:
              </label>
              <select
                id="cart-table-select"
                value={tableId ?? ""}
                onChange={(e) => onTableChange(e.target.value || undefined)}
                className="border-border-subtle bg-surface-elevated text-ink focus:border-primary h-8 w-full rounded-md border px-2 py-1 text-xs focus:outline-none"
              >
                <option value="">{t("create.selectTable")}</option>
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.id}>
                    {tbl.tableNumber ? `Table ${tbl.tableNumber}` : tbl.id} ({tbl.capacity}p)
                  </option>
                ))}
              </select>
            </div>

            {/* Guest Count Stepper */}
            <div className="flex items-center gap-1.5">
              <Users className="text-ink-subtle size-3.5" />
              <button
                type="button"
                onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                aria-label="Decrease guest count"
                className="border-border-subtle text-ink-muted hover:text-ink inline-flex size-6 items-center justify-center rounded border"
              >
                -
              </button>
              <span className="text-ink min-w-4 text-center font-mono text-xs font-bold">
                {guestCount}
              </span>
              <button
                type="button"
                onClick={() => onGuestCountChange(guestCount + 1)}
                aria-label="Increase guest count"
                className="border-border-subtle text-ink-muted hover:text-ink inline-flex size-6 items-center justify-center rounded border"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="min-h-[220px] flex-1 space-y-3 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-ink-muted flex h-full flex-col items-center justify-center py-10 text-center">
            <ShoppingBag className="text-ink-subtle/70 size-8" />
            <h4 className="text-ink mt-2 text-sm font-semibold">{t("create.emptyCart")}</h4>
            <p className="text-ink-subtle mt-1 max-w-[200px] text-xs">
              {t("create.emptyCartDesc")}
            </p>
          </div>
        ) : (
          items.map((item) => {
            const variationsCost = item.variations?.reduce((sum, v) => sum + v.price, 0) ?? 0;
            const itemUnitPrice = item.unitPrice + variationsCost;
            const itemTotal = itemUnitPrice * item.quantity;

            return (
              <div
                key={`${item.menuItemId}-${JSON.stringify(item.variations)}-${JSON.stringify(item.customizations)}`}
                className="border-border-subtle/80 bg-surface/30 flex flex-col gap-1.5 rounded-lg border p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-ink font-sans text-xs font-semibold">
                      Item #{item.menuItemId}
                    </span>
                    {/* Variations list */}
                    {item.variations && item.variations.length > 0 && (
                      <div className="text-ink-muted text-[11px]">
                        {item.variations.map((v) => `${v.name}: ${v.value}`).join(", ")}
                      </div>
                    )}
                    {/* Customizations / notes */}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400">
                        {item.customizations.map((c) => c.action).join(", ")}
                      </div>
                    )}
                  </div>

                  <span className="text-ink font-mono text-xs font-bold whitespace-nowrap">
                    {formatCurrency(itemTotal, currency, i18n.language)}
                  </span>
                </div>

                {/* Quantity steppers & trash */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-ink-subtle font-mono text-[11px]">
                    {formatCurrency(itemUnitPrice, currency, i18n.language)} ea
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      disabled={isUpdating}
                      className="border-border-subtle bg-surface-elevated text-ink-muted hover:text-ink inline-flex size-6 items-center justify-center rounded border"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-ink min-w-5 text-center font-mono text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      disabled={isUpdating}
                      className="border-border-subtle bg-surface-elevated text-ink-muted hover:text-ink inline-flex size-6 items-center justify-center rounded border"
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.menuItemId)}
                      disabled={isUpdating}
                      className="text-ink-subtle hover:text-danger ml-1 inline-flex size-6 items-center justify-center"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Coupon Code Input */}
      {items.length > 0 && (
        <div className="border-border-subtle border-t px-4 py-2">
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="text-ink-subtle absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={t("create.couponCode")}
                className="h-8 pl-8 text-xs uppercase"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="h-8 text-xs">
              {t("create.applyCoupon")}
            </Button>
          </form>
        </div>
      )}

      {/* Financial Breakdown & Send to Kitchen Button */}
      <div className="border-border-subtle bg-surface/30 space-y-3 border-t p-4">
        <div className="space-y-1.5 text-xs">
          <div className="text-ink-muted flex justify-between">
            <span>{t("detail.subtotal")}</span>
            <span className="text-ink font-mono font-medium">
              {formatCurrency(subtotal, currency, i18n.language)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
              <span>Discounts</span>
              <span className="font-mono font-medium">
                -{formatCurrency(discountAmount, currency, i18n.language)}
              </span>
            </div>
          )}

          <div className="text-ink-muted flex justify-between">
            <span>{t("detail.tax")} (8%)</span>
            <span className="text-ink font-mono font-medium">
              {formatCurrency(taxAmount, currency, i18n.language)}
            </span>
          </div>

          <Separator className="my-1.5" />

          <div className="flex items-center justify-between text-sm">
            <span className="font-display text-ink font-bold">{t("detail.total")}</span>
            <span className="text-primary font-mono text-lg font-bold">
              {formatCurrency(grandTotal, currency, i18n.language)}
            </span>
          </div>
        </div>

        {/* Primary CTA Button: Send to Kitchen */}
        <Button
          type="button"
          onClick={onSendToKitchen}
          disabled={items.length === 0 || isSubmitting || isUpdating}
          className="bg-accent text-accent-foreground hover:bg-accent-hover h-11 w-full gap-2 text-sm font-semibold tracking-wide shadow-sm"
        >
          {isSubmitting ? (
            <span>{t("create.submitting")}</span>
          ) : (
            <>
              <UtensilsCrossed className="size-4" />
              <span>
                {t("create.sendToKitchen")} ({itemCount})
              </span>
              <ArrowRight className="ml-auto size-4" />
            </>
          )}
        </Button>

        {items.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => clearDraft()}
            disabled={isClearing}
            className="text-ink-subtle hover:text-danger h-7 w-full text-xs"
          >
            {t("create.clearCart")}
          </Button>
        )}
      </div>
    </div>
  );
}
