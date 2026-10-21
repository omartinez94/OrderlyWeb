/**
 * useOrderDraft — manages local POS draft mutations backed by Basket.API.
 *
 * Provides reactive basket state, addItem, updateQuantity, removeItem,
 * applyCoupon, and checkout actions with automatic subtotal, tax, and discount totals.
 */

import { useCallback, useMemo } from "react";
import {
  useGetCartQuery,
  useUpdateCartMutation,
  useClearCartMutation,
  useCheckoutCartMutation,
} from "../../../app/api/basket";
import type {
  Basket,
  BasketItem,
  BasketItemVariation,
  BasketItemCustomization,
  BasketCheckoutDto,
} from "../../../types/basket";
import { PaymentMethod, type OrderType } from "../../../types/order";

export interface AddItemOptions {
  menuItemId: number;
  unitPrice: number;
  quantity?: number;
  variations?: BasketItemVariation[];
  customizations?: BasketItemCustomization[];
}

export interface CheckoutDetails {
  tableId?: string;
  orderType?: OrderType;
  customerName?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
}

export function useOrderDraft(restaurantId: string) {
  const { data: cart, isLoading: isCartLoading } = useGetCartQuery(
    { restaurantId },
    { skip: !restaurantId },
  );

  const [updateCartMutation, { isLoading: isUpdating }] = useUpdateCartMutation();
  const [clearCartMutation, { isLoading: isClearing }] = useClearCartMutation();
  const [checkoutCartMutation, { isLoading: isCheckingOut }] = useCheckoutCartMutation();

  const items = useMemo(() => cart?.items ?? [], [cart?.items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const variationsCost = item.variations?.reduce((vSum, v) => vSum + v.price, 0) ?? 0;
      return sum + (item.unitPrice + variationsCost) * item.quantity;
    }, 0);
  }, [items]);

  const discountAmount = useMemo(() => cart?.discountAmount ?? 0, [cart?.discountAmount]);

  const taxRate = 0.08;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableAmount * taxRate).toFixed(2));
  const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));
  const itemCount = useMemo(() => items.reduce((count, item) => count + item.quantity, 0), [items]);

  const addItem = useCallback(
    async ({
      menuItemId,
      unitPrice,
      quantity = 1,
      variations = [],
      customizations = [],
    }: AddItemOptions) => {
      const existingIndex = items.findIndex((it) => {
        if (it.menuItemId !== menuItemId) return false;
        // Match variations and customizations
        const varsEqual = JSON.stringify(it.variations) === JSON.stringify(variations);
        const custsEqual = JSON.stringify(it.customizations) === JSON.stringify(customizations);
        return varsEqual && custsEqual;
      });

      let updatedItems: BasketItem[];
      if (existingIndex >= 0) {
        updatedItems = items.map((it, idx) =>
          idx === existingIndex ? { ...it, quantity: it.quantity + quantity } : it,
        );
      } else {
        const newItem: BasketItem = {
          menuItemId,
          quantity,
          unitPrice,
          variations,
          customizations,
        };
        updatedItems = [...items, newItem];
      }

      const updatedBasket: Basket = {
        userId: cart?.userId || "00000000-0000-0000-0000-000000000000",
        restaurantId,
        items: updatedItems,
        appliedDiscounts: cart?.appliedDiscounts ?? [],
        appliedCoupons: cart?.appliedCoupons ?? [],
        appliedDiscountBreakdown: cart?.appliedDiscountBreakdown ?? [],
        discountAmount: cart?.discountAmount ?? 0,
        effectiveSubtotal: subtotal,
      };

      return updateCartMutation(updatedBasket).unwrap();
    },
    [cart, items, restaurantId, subtotal, updateCartMutation],
  );

  const updateQuantity = useCallback(
    async (menuItemId: number, newQuantity: number) => {
      let updatedItems: BasketItem[];
      if (newQuantity <= 0) {
        updatedItems = items.filter((it) => it.menuItemId !== menuItemId);
      } else {
        updatedItems = items.map((it) =>
          it.menuItemId === menuItemId ? { ...it, quantity: newQuantity } : it,
        );
      }

      const updatedBasket: Basket = {
        userId: cart?.userId || "00000000-0000-0000-0000-000000000000",
        restaurantId,
        items: updatedItems,
        appliedDiscounts: cart?.appliedDiscounts ?? [],
        appliedCoupons: cart?.appliedCoupons ?? [],
        appliedDiscountBreakdown: cart?.appliedDiscountBreakdown ?? [],
        discountAmount: cart?.discountAmount ?? 0,
        effectiveSubtotal: subtotal,
      };

      return updateCartMutation(updatedBasket).unwrap();
    },
    [cart, items, restaurantId, subtotal, updateCartMutation],
  );

  const removeItem = useCallback(
    async (menuItemId: number) => {
      return updateQuantity(menuItemId, 0);
    },
    [updateQuantity],
  );

  const applyCoupon = useCallback(
    async (code: string) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return;

      const updatedBasket: Basket = {
        userId: cart?.userId || "00000000-0000-0000-0000-000000000000",
        restaurantId,
        items,
        appliedDiscounts: [trimmed],
        appliedCoupons: cart?.appliedCoupons ?? [],
        appliedDiscountBreakdown: cart?.appliedDiscountBreakdown ?? [],
        discountAmount: cart?.discountAmount ?? 0,
        effectiveSubtotal: subtotal,
      };

      return updateCartMutation(updatedBasket).unwrap();
    },
    [cart, items, restaurantId, subtotal, updateCartMutation],
  );

  const clearDraft = useCallback(async () => {
    return clearCartMutation({ restaurantId }).unwrap();
  }, [clearCartMutation, restaurantId]);

  const checkout = useCallback(
    async (details: CheckoutDetails, idempotencyKey?: string) => {
      const checkoutDto: BasketCheckoutDto = {
        userId: cart?.userId || "00000000-0000-0000-0000-000000000000",
        restaurantId,
        firstName: details.customerName || "Floor",
        lastName: details.tableId ? `Table ${details.tableId}` : "Walk-in",
        emailAddress: "pos@orderly.internal",
        addressLine: details.tableId ? `Table ${details.tableId}` : "POS Counter",
        country: "US",
        state: "NY",
        zipCode: "11201",
        cardName: "Staff POS",
        cardNumber: "4242424242424242",
        expiration: "12/29",
        cvv: "123",
        paymentMethod: details.paymentMethod || PaymentMethod.CreditCard,
      };

      return checkoutCartMutation({
        checkout: checkoutDto,
        idempotencyKey,
      }).unwrap();
    },
    [cart?.userId, checkoutCartMutation, restaurantId],
  );

  return {
    cart,
    items,
    itemCount,
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
    isLoading: isCartLoading,
    isUpdating,
    isClearing,
    isCheckingOut,
    addItem,
    updateQuantity,
    removeItem,
    applyCoupon,
    clearDraft,
    checkout,
  };
}
