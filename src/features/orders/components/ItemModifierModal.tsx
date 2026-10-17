/**
 * ItemModifierModal — dialog for customizing item variations, special instructions,
 * and quantities before staging to the POS cart draft.
 */

import { useState, useId } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from "../../../components/ui";
import { formatCurrency } from "../../../utils/currency";
import type { MenuItem } from "../../../types/catalog";
import type { BasketItemVariation, BasketItemCustomization } from "../../../types/basket";

export interface ItemModifierModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    item: MenuItem,
    quantity: number,
    variations: BasketItemVariation[],
    customizations: BasketItemCustomization[],
  ) => void;
  currency?: string;
}

interface VariationOption {
  name: string;
  value: string;
  price: number;
  labelKey: string;
}

const PORTION_OPTIONS: VariationOption[] = [
  { name: "Size", value: "Regular", price: 0, labelKey: "create.regular" },
  { name: "Size", value: "Large", price: 3.5, labelKey: "create.large" },
  { name: "Size", value: "Jumbo", price: 6.0, labelKey: "create.jumbo" },
];

export function ItemModifierModal({
  item,
  isOpen,
  onClose,
  onConfirm,
  currency = "USD",
}: ItemModifierModalProps) {
  const { t, i18n } = useTranslation("orders");
  const instructionsId = useId();

  const [quantity, setQuantity] = useState(1);
  const [selectedPortion, setSelectedPortion] = useState<VariationOption>(PORTION_OPTIONS[0]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  if (!item) return null;

  const basePrice = item.priceCents / 100;
  const unitPrice = basePrice + selectedPortion.price;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const variations: BasketItemVariation[] =
      selectedPortion.price > 0
        ? [
            {
              name: selectedPortion.name,
              value: selectedPortion.value,
              price: selectedPortion.price,
            },
          ]
        : [];

    const customizations: BasketItemCustomization[] = specialInstructions.trim()
      ? [
          {
            ingredient: "Note",
            action: specialInstructions.trim(),
          },
        ]
      : [];

    onConfirm(item, quantity, variations, customizations);
    // Reset state for next open
    setQuantity(1);
    setSelectedPortion(PORTION_OPTIONS[0]);
    setSpecialInstructions("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-xl">{item.name}</DialogTitle>
          <p className="text-ink-muted font-mono text-sm font-medium">
            {formatCurrency(basePrice, currency, i18n.language)}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-3">
          {/* Portion Size selection */}
          <div className="flex flex-col gap-2">
            <span className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
              {t("create.portionSize")}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PORTION_OPTIONS.map((opt) => {
                const isSelected = selectedPortion.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedPortion(opt)}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center text-xs transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border-subtle bg-surface-elevated text-ink-muted hover:border-border-strong hover:text-ink"
                    }`}
                  >
                    <span>
                      {t(opt.labelKey as "create.regular" | "create.large" | "create.jumbo")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special instructions */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={instructionsId}
              className="text-ink-muted text-xs font-semibold tracking-wider uppercase"
            >
              {t("create.specialInstructions")}
            </label>
            <textarea
              id={instructionsId}
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={t("create.specialInstructionsPlaceholder")}
              className="border-border-subtle bg-surface-elevated text-ink placeholder:text-ink-subtle focus:border-primary w-full resize-none rounded-md border p-2 text-xs focus:outline-none"
            />
          </div>

          {/* Quantity stepper */}
          <div className="border-border-subtle bg-surface-elevated/40 flex items-center justify-between rounded-lg border p-3">
            <span className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
              {t("create.quantity")}
            </span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="size-8 p-0"
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="text-ink min-w-6 text-center font-mono text-sm font-bold">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="size-8 p-0"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between pt-2 sm:justify-between">
          <div className="text-ink font-mono text-base font-bold">
            {formatCurrency(totalPrice, currency, i18n.language)}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-medium"
            >
              {t("create.addToOrder")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
