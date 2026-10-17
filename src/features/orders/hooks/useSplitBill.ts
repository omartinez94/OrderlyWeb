/**
 * useSplitBill — mathematical split balancing and payment settlement state hook.
 *
 * Implements:
 *   - Equal split (2 to 10 ways) with cent-balanced rounding on the final bill
 *   - Custom / by seat item assignment with unassigned item tracking
 *   - Validation balance engine: sum of bills strictly matches order.totalAmount
 *   - Settlement simulation tracking per-bill payment method and status
 */

import { useState, useMemo, useCallback } from "react";
import type { OrderDto } from "../../../types/order";

export type SplitMode = "equal" | "custom";

export interface SplitPayerState {
  id: string;
  name: string;
  assignedItemIds: string[];
}

export interface ComputedBill {
  id: string;
  name: string;
  subtotal: number;
  tax: number;
  total: number;
  isPaid: boolean;
  paymentMethod?: string;
  tenderAmount?: number;
  changeDue?: number;
  assignedItemIds?: string[];
}

export interface UseSplitBillOptions {
  order: OrderDto;
}

export function useSplitBill({ order }: UseSplitBillOptions) {
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [ways, setWays] = useState<number>(2);

  // Custom payers state: default to 2 payers
  const [payers, setPayers] = useState<SplitPayerState[]>([
    { id: "payer-1", name: "Payer 1", assignedItemIds: [] },
    { id: "payer-2", name: "Payer 2", assignedItemIds: [] },
  ]);

  // Payment status map: billId -> payment info
  const [payments, setPayments] = useState<
    Record<string, { method: string; tenderAmount?: number; changeDue?: number }>
  >({});

  // Add a new payer in custom mode
  const addPayer = useCallback(() => {
    setPayers((prev) => {
      const nextNum = prev.length + 1;
      return [
        ...prev,
        { id: `payer-${Date.now()}-${nextNum}`, name: `Payer ${nextNum}`, assignedItemIds: [] },
      ];
    });
  }, []);

  // Remove a payer and free their items
  const removePayer = useCallback((payerId: string) => {
    setPayers((prev) => prev.filter((p) => p.id !== payerId));
  }, []);

  // Assign or reassign an order item to a payer
  const assignItemToPayer = useCallback((itemId: string, payerId: string) => {
    setPayers((prev) =>
      prev.map((p) => {
        if (p.id === payerId) {
          if (p.assignedItemIds.includes(itemId)) return p;
          return { ...p, assignedItemIds: [...p.assignedItemIds, itemId] };
        }
        // Remove from other payers if assigned
        return {
          ...p,
          assignedItemIds: p.assignedItemIds.filter((id) => id !== itemId),
        };
      }),
    );
  }, []);

  // Unassign an item from any payer
  const unassignItem = useCallback((itemId: string) => {
    setPayers((prev) =>
      prev.map((p) => ({
        ...p,
        assignedItemIds: p.assignedItemIds.filter((id) => id !== itemId),
      })),
    );
  }, []);

  // Record payment for a bill
  const recordPayment = useCallback(
    (billId: string, method: string, tenderAmount?: number, changeDue?: number) => {
      setPayments((prev) => ({
        ...prev,
        [billId]: { method, tenderAmount, changeDue },
      }));
    },
    [],
  );

  // Unassigned items in custom mode
  const unassignedItemIds = useMemo(() => {
    const allAssigned = new Set(payers.flatMap((p) => p.assignedItemIds));
    return (order.orderItems || []).map((item) => item.id).filter((id) => !allAssigned.has(id));
  }, [order.orderItems, payers]);

  // Computed bills based on mode
  const bills = useMemo((): ComputedBill[] => {
    if (splitMode === "equal") {
      const count = Math.max(2, Math.min(10, ways));
      const totalCents = Math.round(order.totalAmount * 100);
      const subtotalCents = Math.round(order.subtotal * 100);

      const baseTotalCents = Math.floor(totalCents / count);
      const remainderTotalCents = totalCents % count;

      const baseSubtotalCents = Math.floor(subtotalCents / count);
      const remainderSubtotalCents = subtotalCents % count;

      return Array.from({ length: count }, (_, i) => {
        const id = `equal-bill-${i + 1}`;
        const isLast = i === count - 1;

        const thisTotalCents = baseTotalCents + (isLast ? remainderTotalCents : 0);
        const thisSubtotalCents = baseSubtotalCents + (isLast ? remainderSubtotalCents : 0);
        const thisTaxCents = thisTotalCents - thisSubtotalCents;

        const pmt = payments[id];

        return {
          id,
          name: `Bill ${i + 1}`,
          subtotal: thisSubtotalCents / 100,
          tax: thisTaxCents / 100,
          total: thisTotalCents / 100,
          isPaid: Boolean(pmt),
          paymentMethod: pmt?.method,
          tenderAmount: pmt?.tenderAmount,
          changeDue: pmt?.changeDue,
        };
      });
    }

    // Custom Mode
    const itemsMap = new Map((order.orderItems || []).map((item) => [item.id, item]));

    return payers.map((payer) => {
      const pmt = payments[payer.id];
      const assignedItems = payer.assignedItemIds.map((id) => itemsMap.get(id)).filter(Boolean);

      const subtotal = assignedItems.reduce((acc, item) => acc + (item?.totalPrice ?? 0), 0);
      const tax = Math.round(subtotal * (order.taxRate || 0.08) * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      return {
        id: payer.id,
        name: payer.name,
        subtotal,
        tax,
        total,
        isPaid: Boolean(pmt),
        paymentMethod: pmt?.method,
        tenderAmount: pmt?.tenderAmount,
        changeDue: pmt?.changeDue,
        assignedItemIds: payer.assignedItemIds,
      };
    });
  }, [splitMode, ways, order, payers, payments]);

  // Validation Balance Engine
  const { totalSplitAmount, isBalanced, isFullyPaid } = useMemo(() => {
    const total = bills.reduce((acc, b) => acc + b.total, 0);
    const roundedTotal = Math.round(total * 100) / 100;
    const roundedOrderTotal = Math.round(order.totalAmount * 100) / 100;

    const balanced =
      splitMode === "equal"
        ? true
        : unassignedItemIds.length === 0 && Math.abs(roundedTotal - roundedOrderTotal) <= 0.01;

    const allPaid = bills.length > 0 && bills.every((b) => b.isPaid);

    return {
      totalSplitAmount: roundedTotal,
      isBalanced: balanced,
      isFullyPaid: allPaid,
    };
  }, [bills, order.totalAmount, splitMode, unassignedItemIds.length]);

  return {
    splitMode,
    setSplitMode,
    ways,
    setWays,
    payers,
    addPayer,
    removePayer,
    assignItemToPayer,
    unassignItem,
    recordPayment,
    unassignedItemIds,
    unassignedItemCount: unassignedItemIds.length,
    bills,
    totalSplitAmount,
    isBalanced,
    isFullyPaid,
  };
}
