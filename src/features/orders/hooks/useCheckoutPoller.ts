/**
 * useCheckoutPoller — polls for asynchronous order creation after outbox checkout.
 *
 * Implements the UX mandated by restaurant-orders-and-basket-lifecycle.md §6.2:
 *   - After checkoutCart returns 200, the cart is cleared but order creation
 *     occurs asynchronously via the transactional outbox.
 *   - Polls `GET /ordering-api/v1/orders` up to 10 seconds with animated pending state.
 *   - On success: navigates to `/site/restaurant/orders/:id`.
 *   - On 10s timeout: shows Sonner warning toast and navigates to `/site/restaurant/orders`.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../app/hooks";
import { ordersApi } from "../../../app/api/orders";
import { PATH } from "../../../router/pathNames";
import { useNavigateWithTransition } from "../../../hooks/useNavigateWithTransition";
import { toast } from "../../../components/ui/sonner";

export interface UseCheckoutPollerOptions {
  maxSeconds?: number;
  pollIntervalMs?: number;
}

export function useCheckoutPoller(options: UseCheckoutPollerOptions = {}) {
  const { maxSeconds = 10, pollIntervalMs = 1000 } = options;
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithTransition();
  const { t } = useTranslation("orders");

  const [isPolling, setIsPolling] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const isPollingRef = useRef<boolean>(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
    setElapsedSeconds(0);
  }, []);

  const startPolling = useCallback(
    (restaurantId: string, correlationHint?: string) => {
      cleanup();
      isPollingRef.current = true;
      setIsPolling(true);
      setElapsedSeconds(0);
      startTimeRef.current = Date.now();

      const pollTick = async () => {
        if (!isPollingRef.current) return;

        const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(currentElapsed);

        try {
          // Fetch latest orders for this restaurant
          const action = ordersApi.endpoints.getOrders.initiate(
            { restaurantId, pageIndex: 0, pageSize: 5 },
            { subscribe: false, forceRefetch: true },
          );
          const result = await dispatch(action).unwrap();
          const latestOrders = result?.orders?.data ?? [];

          // Look for order created after polling started or matching correlation
          const found = latestOrders.find((ord) => {
            if (
              correlationHint &&
              (ord.id === correlationHint || ord.orderNumber.includes(correlationHint))
            ) {
              return true;
            }
            if (ord.activities && ord.activities.length > 0) {
              const occurred = new Date(ord.activities[0].occurredAt).getTime();
              return occurred >= startTimeRef.current - 5000;
            }
            return false;
          });

          if (found) {
            cleanup();
            toast.success(t("create.orderCreatedSuccess", { orderNumber: found.orderNumber }));
            navigate(PATH.RESTAURANT_ORDER_DETAIL.replace(":id", found.id));
            return;
          }
        } catch {
          // Ignore transient fetch error during polling
        }

        if (currentElapsed >= maxSeconds) {
          cleanup();
          toast.warning(t("checkout.delayedWarning"));
          navigate(PATH.RESTAURANT_ORDERS);
        }
      };

      // Run immediate tick then interval
      void pollTick();
      timerRef.current = setInterval(() => {
        void pollTick();
      }, pollIntervalMs);
    },
    [cleanup, dispatch, maxSeconds, navigate, pollIntervalMs, t],
  );

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isPolling,
    elapsedSeconds,
    startPolling,
    cancelPolling: cleanup,
  };
}
