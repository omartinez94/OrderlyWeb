/**
 * OrderActionToolbar — contextual operational actions based on status and permissions.
 *
 * Implements role-gated modification and cancellation workflows:
 *   - Status Pending: Staff can Confirm or Cancel directly.
 *   - Status Confirmed / Preparing: Cancellation requires Manager authorization.
 *   - Status Ready / Delivered / Completed: Cancellation locked.
 *   - Split Bill action link.
 */

import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Ban, CheckCircle2, Receipt, ShieldAlert, Loader2 } from "lucide-react";
import { useAppSelector } from "../../../app/hooks";
import { selectRoles, selectPermissions } from "../../../app/session/sessionSelectors";
import { useConfirmOrderMutation } from "../../../app/api/orders";
import { Button } from "../../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { CancelOrderDialog } from "./CancelOrderDialog";
import { PATH } from "../../../router/pathNames";
import { BackendOrderStatus, type OrderDto } from "../../../types/order";

export interface OrderActionToolbarProps {
  order: OrderDto;
}

export function OrderActionToolbar({ order }: OrderActionToolbarProps) {
  const { t } = useTranslation("orders");
  const roles = useAppSelector(selectRoles);
  const permissions = useAppSelector(selectPermissions);

  const [confirmOrder, { isLoading: isConfirming }] = useConfirmOrderMutation();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const isManager =
    roles.some((r) => ["SuperAdmin", "RestaurantAdmin", "Manager"].includes(r)) ||
    (permissions as readonly string[]).includes("orders:modify_confirmed");

  const isCancelled = order.status === BackendOrderStatus.Cancelled;
  const isCompleted = order.status === BackendOrderStatus.Completed;
  const isDelivered = order.status === BackendOrderStatus.Delivered;
  const isReady = order.status === BackendOrderStatus.Ready;
  const isPending = order.status === BackendOrderStatus.Pending;
  const isConfirmedOrPrep =
    order.status === BackendOrderStatus.Confirmed || order.status === BackendOrderStatus.Preparing;

  // Lock cancellation if finished
  const isCancelLocked = isCompleted || isDelivered || isReady;

  // Manager gate applies only to Confirmed or Preparing orders
  const requiresManagerOverride = isConfirmedOrPrep && !isManager;

  const handleConfirm = async () => {
    try {
      await confirmOrder(order.id).unwrap();
      toast.success(t("detail.confirmSuccess"));
    } catch {
      toast.error(t("detail.cancelError"));
    }
  };

  const splitBillUrl = PATH.RESTAURANT_ORDER_SPLIT.replace(":id", order.id);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Split Bill CTA */}
        {!isCancelled && (
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <Link to={splitBillUrl}>
              <Receipt className="text-ink-subtle size-3.5" />
              <span>{t("detail.splitBill")}</span>
            </Link>
          </Button>
        )}

        {/* Confirm Order CTA (for Pending orders) */}
        {isPending && (
          <Button
            variant="default"
            size="sm"
            disabled={isConfirming}
            onClick={handleConfirm}
            className="h-9 gap-1.5 bg-teal-600 text-xs text-white hover:bg-teal-700"
          >
            {isConfirming ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            <span>{t("detail.confirmOrder")}</span>
          </Button>
        )}

        {/* Cancel Order CTA */}
        {!isCancelled && (
          <>
            {isCancelLocked ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-block">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-danger border-danger/30 h-9 cursor-not-allowed gap-1.5 text-xs opacity-50"
                    >
                      <Ban className="text-danger size-3.5" />
                      <span>{t("detail.cancelOrder")}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  {t("detail.cancelLocked")}
                </TooltipContent>
              </Tooltip>
            ) : requiresManagerOverride ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-block">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-danger border-danger/30 h-9 cursor-not-allowed gap-1.5 text-xs opacity-50"
                    >
                      <ShieldAlert className="text-danger size-3.5" />
                      <span>{t("detail.cancelOrder")}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  {t("detail.managerOverrideRequired")}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
                className="text-danger hover:text-danger hover:bg-danger/10 border-danger/30 h-9 gap-1.5 text-xs"
              >
                <Ban className="size-3.5" />
                <span>{t("detail.cancelOrder")}</span>
              </Button>
            )}
          </>
        )}

        {/* Cancellation Dialog */}
        <CancelOrderDialog
          orderId={order.id}
          orderNumber={order.orderNumber}
          open={cancelModalOpen}
          onOpenChange={setCancelModalOpen}
        />
      </div>
    </TooltipProvider>
  );
}
