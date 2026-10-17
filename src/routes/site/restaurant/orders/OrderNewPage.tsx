/**
 * OrderNewPage — `/site/restaurant/orders/new`.
 *
 * Touch-optimized POS Order Creation workstation:
 *   - Auto-detects table assignment and order type from URL query params.
 *   - Two-column layout: left Menu Catalog picker, right persistent Cart Sidebar.
 *   - Responsive tablet collapse for <=768px viewports.
 *   - Item modifier modal for variations and instructions.
 *   - Transactional checkout with UUID v4 Idempotency-Key and outbox confirmation polling.
 */

import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { useRestaurantContext } from "../../../../components/RestaurantContext/useRestaurantContext";
import {
  CatalogItemPicker,
  CartSidebar,
  ItemModifierModal,
  useOrderDraft,
  useCheckoutPoller,
} from "../../../../features/orders";
import { Button } from "../../../../components/ui";
import { PATH, QUERY_PARAM } from "../../../../router/pathNames";
import type { OrderType } from "../../../../types/order";
import type { MenuItem } from "../../../../types/catalog";
import type { BasketItemVariation, BasketItemCustomization } from "../../../../types/basket";

export function OrderNewPage() {
  const { t } = useTranslation("orders");
  const [searchParams] = useSearchParams();
  const { restaurantId: contextRestaurantId } = useRestaurantContext();
  const effectiveRestaurantId = contextRestaurantId ?? "r-001";

  // URL Query Pre-population
  const initialTableId =
    searchParams.get(QUERY_PARAM.TABLE_ID) ?? searchParams.get("tableId") ?? undefined;
  const initialTypeRaw = searchParams.get(QUERY_PARAM.ORDER_TYPE) ?? searchParams.get("orderType");
  const initialOrderType: OrderType =
    initialTypeRaw === "Takeout" || initialTypeRaw === "Delivery" ? initialTypeRaw : "DineIn";
  const initialGuestsRaw =
    searchParams.get(QUERY_PARAM.GUEST_COUNT) ?? searchParams.get("guestCount");
  const initialGuestCount = initialGuestsRaw ? Math.max(1, parseInt(initialGuestsRaw, 10) || 1) : 2;

  // Local POS State
  const [orderType, setOrderType] = useState<OrderType>(initialOrderType);
  const [tableId, setTableId] = useState<string | undefined>(initialTableId);
  const [guestCount, setGuestCount] = useState<number>(initialGuestCount);
  const [mobileTab, setMobileTab] = useState<"catalog" | "cart">("catalog");

  // Modifier Modal State
  const [modifierItem, setModifierItem] = useState<MenuItem | null>(null);

  // Draft & Outbox Poller Hooks
  const draft = useOrderDraft(effectiveRestaurantId);
  const poller = useCheckoutPoller({ maxSeconds: 10, pollIntervalMs: 1000 });

  const handleSelectItem = (item: MenuItem) => {
    // Parse numeric ID for MenuItemId
    const numericId = parseInt(item.id.replace(/\D/g, ""), 10) || 1;
    void draft.addItem({
      menuItemId: numericId,
      unitPrice: item.priceCents / 100,
      quantity: 1,
    });
  };

  const handleOpenModifiers = (item: MenuItem) => {
    setModifierItem(item);
  };

  const handleConfirmModifiers = (
    item: MenuItem,
    quantity: number,
    variations: BasketItemVariation[],
    customizations: BasketItemCustomization[],
  ) => {
    const numericId = parseInt(item.id.replace(/\D/g, ""), 10) || 1;
    void draft.addItem({
      menuItemId: numericId,
      unitPrice: item.priceCents / 100,
      quantity,
      variations,
      customizations,
    });
  };

  const handleSendToKitchen = async () => {
    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `pos-${Date.now()}`;

      await draft.checkout(
        {
          tableId: orderType === "DineIn" ? tableId : undefined,
          orderType,
        },
        idempotencyKey,
      );

      // Start outbox polling with correlation hint
      poller.startPolling(effectiveRestaurantId, idempotencyKey);
    } catch {
      // RTK Query errors handled or toasted
    }
  };

  return (
    <div className="bg-surface text-ink min-h-[calc(100vh-64px)] font-sans antialiased">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Actions */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="size-8 p-0">
              <Link to={PATH.RESTAURANT_ORDERS} aria-label="Back to orders">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">
                  POS Intake
                </p>
                <span className="text-ink-subtle">•</span>
                <span className="text-primary font-mono text-xs font-medium">
                  {orderType === "DineIn" && tableId ? `Table ${tableId}` : orderType}
                </span>
              </div>
              <h1 className="font-display text-primary text-2xl font-bold tracking-tight">
                {t("create.title")}
              </h1>
            </div>
          </div>

          {/* Mobile Tab Switcher (<=768px viewport) */}
          <div className="border-border-subtle bg-surface-elevated flex rounded-lg border p-1 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab("catalog")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                mobileTab === "catalog"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("cart")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                mobileTab === "cart"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <ShoppingBag className="size-3.5" />
              <span>Cart ({draft.itemCount})</span>
            </button>
          </div>
        </header>

        {/* Two-Column Touch POS Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Menu Catalog Picker */}
          <div
            className={`lg:col-span-7 xl:col-span-8 ${
              mobileTab === "cart" ? "hidden lg:block" : "block"
            }`}
          >
            <CatalogItemPicker
              restaurantId={effectiveRestaurantId}
              onSelectItem={handleSelectItem}
              onOpenModifiers={handleOpenModifiers}
            />
          </div>

          {/* Right Column: Cart Sidebar */}
          <div
            className={`lg:col-span-5 xl:col-span-4 ${
              mobileTab === "catalog" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="sticky top-6">
              <CartSidebar
                restaurantId={effectiveRestaurantId}
                orderType={orderType}
                onOrderTypeChange={setOrderType}
                tableId={tableId}
                onTableChange={setTableId}
                guestCount={guestCount}
                onGuestCountChange={setGuestCount}
                draft={draft}
                onSendToKitchen={handleSendToKitchen}
                isSubmitting={draft.isCheckingOut || poller.isPolling}
              />
            </div>
          </div>
        </div>

        {/* Item Modifier Dialog */}
        <ItemModifierModal
          item={modifierItem}
          isOpen={modifierItem !== null}
          onClose={() => setModifierItem(null)}
          onConfirm={handleConfirmModifiers}
        />

        {/* Outbox Confirmation Polling Modal */}
        {poller.isPolling && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("checkout.sending")}
            className="bg-ink/50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <div className="border-border-subtle bg-surface-elevated flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border p-8 text-center shadow-xl">
              <div className="bg-accent/15 text-accent relative flex size-16 animate-pulse items-center justify-center rounded-full">
                <UtensilsCrossed className="size-8" />
                <Loader2 className="text-accent absolute size-16 animate-spin opacity-75" />
              </div>
              <h3 className="font-display text-ink mt-5 text-lg font-bold">
                {t("checkout.sending")}
              </h3>
              <p className="text-ink-muted mt-1 text-xs">
                Publishing ticket to the kitchen queue and confirming order placement...
              </p>
              <div className="text-accent mt-4 font-mono text-xs font-bold">
                {poller.elapsedSeconds}s / 10s
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
