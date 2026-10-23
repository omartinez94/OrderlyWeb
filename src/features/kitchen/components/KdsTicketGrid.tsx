import { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../components/ui";
import { TicketCard, type TicketData } from "./TicketCard";
import { useBumpBar } from "../hardware/useBumpBar";
import { openVirtualBumpBar } from "../hardware/openVirtualBumpBar";
import {
  playBumpChime,
  playRecallTone,
  playErrorBuzzer,
  isAudioMuted,
  setAudioMuted,
} from "../hardware/audioFeedback";
import {
  useAcceptOrderMutation,
  useStartItemPrepMutation,
  useMarkItemReadyMutation,
  useMarkTicketReadyMutation,
  useBumpOrderMutation,
  useRecallOrderMutation,
} from "../../../app/api/kitchen";
import {
  KitchenTicketStatus,
  KitchenItemStatus,
  type KitchenTicketDto,
} from "../../../types/kitchen";
import { OrderStatus } from "../../../types/order";
import { BumpBarAction } from "../hardware/types";

export interface KdsTicketGridProps {
  /** Optional array of tickets (if not provided, empty state is rendered) */
  tickets?: (KitchenTicketDto | TicketData)[];
  /** Optional override for bump action */
  onBumpOrder?: (id: string) => void;
  /** Optional override for recall action */
  onRecallOrder?: (id: string) => void;
  /** Page size (defaults to 8 matching the 8 physical bump bar slots) */
  pageSize?: number;
}

/**
 * Adapter converting raw KitchenTicketDto to visual TicketData format.
 */
function normalizeTicket(t: KitchenTicketDto | TicketData): TicketData {
  if ("table" in t && "station" in t && typeof t.elapsed === "number") {
    return t as TicketData;
  }
  const dto = t as KitchenTicketDto;
  return {
    id: dto.id || dto.orderNumber,
    orderNumber: dto.orderNumber,
    table: dto.notes ? dto.notes : `Ticket #${dto.orderNumber || dto.id.slice(0, 6)}`,
    items: (dto.items ?? []).map((i) => `${i.quantity}x ${i.menuItemName || "Item"}`),
    status:
      dto.status === KitchenTicketStatus.New || (dto.status as unknown) === 0
        ? OrderStatus.New
        : dto.status === KitchenTicketStatus.InProgress || (dto.status as unknown) === 1
          ? OrderStatus.Preparing
          : dto.status === KitchenTicketStatus.Ready || (dto.status as unknown) === 2
            ? OrderStatus.Ready
            : OrderStatus.Served,
    elapsed: 0,
    receivedAt: dto.receivedAt,
    station: dto.items?.[0]?.stationId ? `Station ${dto.items[0].stationId}` : "Line 1",
  };
}

export function KdsTicketGrid({
  tickets = [],
  onBumpOrder,
  onRecallOrder,
  pageSize = 8,
}: KdsTicketGridProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [lastBumpedId, setLastBumpedIdState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("kds_last_bumped_id");
    } catch {
      return null;
    }
  });

  const setLastBumpedId = useCallback((id: string | null) => {
    setLastBumpedIdState(id);
    try {
      if (id) {
        sessionStorage.setItem("kds_last_bumped_id", id);
      } else {
        sessionStorage.removeItem("kds_last_bumped_id");
      }
    } catch {
      // Ignore storage quota / private mode exceptions
    }
  }, []);
  const [muted, setMuted] = useState<boolean>(() => isAudioMuted());

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      setAudioMuted(next);
      return next;
    });
  }, []);

  const [acceptOrderMutation] = useAcceptOrderMutation();
  const [startItemPrepMutation] = useStartItemPrepMutation();
  const [markItemReadyMutation] = useMarkItemReadyMutation();
  const [markTicketReadyMutation] = useMarkTicketReadyMutation();
  const [bumpOrderMutation] = useBumpOrderMutation();
  const [recallOrderMutation] = useRecallOrderMutation();

  const normalizedTickets = useMemo(() => tickets.map(normalizeTicket), [tickets]);

  const totalPages = Math.max(1, Math.ceil(normalizedTickets.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const currentTickets = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return normalizedTickets.slice(start, start + pageSize);
  }, [normalizedTickets, activePage, pageSize]);

  // Ensure selected slot stays bounded when tickets are bumped or removed
  useEffect(() => {
    if (currentTickets.length > 0 && selectedSlotIndex >= currentTickets.length) {
      setSelectedSlotIndex(Math.max(0, currentTickets.length - 1));
    }
  }, [currentTickets.length, selectedSlotIndex]);

  const handleAdvance = useCallback(
    async (ticket: TicketData) => {
      if (ticket.status === OrderStatus.New) {
        try {
          await acceptOrderMutation(ticket.id).unwrap();
          toast.success(t("kds:actions.startPrep", `Ticket ${ticket.id} prep started`));
        } catch {
          toast.error(
            t("kds:errors.advanceFailed", `Failed to start prep for ticket ${ticket.id}`),
          );
        }
      } else if (ticket.status === OrderStatus.Preparing) {
        try {
          const rawTicket = tickets.find(
            (t) =>
              "id" in t &&
              (t.id === ticket.id || ("orderNumber" in t && t.orderNumber === ticket.id)),
          ) as KitchenTicketDto | undefined;

          if (rawTicket?.items && rawTicket.items.length > 0) {
            for (const item of rawTicket.items) {
              const isReady =
                item.status === KitchenItemStatus.Ready ||
                (item.status as unknown) === 2 ||
                (item.status as unknown) === "Ready";

              if (!isReady) {
                const isPending =
                  item.status === KitchenItemStatus.Pending ||
                  (item.status as unknown) === 0 ||
                  (item.status as unknown) === "Pending";

                // Kitchen domain aggregate requires Pending -> Preparing before Preparing -> Ready
                if (isPending) {
                  await startItemPrepMutation({ id: ticket.id, itemId: item.id }).unwrap();
                }
                await markItemReadyMutation({ id: ticket.id, itemId: item.id }).unwrap();
              }
            }
          }
          await markTicketReadyMutation(ticket.id).unwrap();
          toast.success(t("kds:actions.markReady", `Ticket ${ticket.id} marked ready`));
        } catch {
          toast.error(t("kds:errors.markReadyFailed", `Failed to mark ticket ${ticket.id} ready`));
        }
      }
    },
    [
      acceptOrderMutation,
      startItemPrepMutation,
      markItemReadyMutation,
      markTicketReadyMutation,
      tickets,
      t,
    ],
  );

  const handleBump = useCallback(
    async (ticketId: string) => {
      if (onBumpOrder) {
        playBumpChime();
        setLastBumpedId(ticketId);
        onBumpOrder(ticketId);
        toast.success(t("kds:actions.bumped", `Ticket ${ticketId} bumped`, { id: ticketId }));
        return;
      }

      const target = normalizedTickets.find((t) => t.id === ticketId);
      if (target && target.status !== OrderStatus.Ready) {
        await handleAdvance(target);
        return;
      }

      try {
        await bumpOrderMutation(ticketId).unwrap();
        playBumpChime();
        setLastBumpedId(ticketId);
        toast.success(t("kds:actions.bumped", `Ticket ${ticketId} bumped`, { id: ticketId }));
      } catch {
        toast.error(t("kds:errors.bumpFailed", `Failed to bump ticket ${ticketId}`));
      }
    },
    [onBumpOrder, normalizedTickets, handleAdvance, bumpOrderMutation, t, setLastBumpedId],
  );

  const handleRecall = useCallback(
    async (ticketId?: string) => {
      const targetId = ticketId || lastBumpedId;
      if (!targetId) {
        playErrorBuzzer();
        toast.info(t("kds:bumpBar.noTicketToRecall", "No recently bumped ticket to recall"));
        return;
      }

      // Guard: active tickets on the board are not in Bumped status
      const isStillActive = normalizedTickets.some((t) => t.id === targetId);
      if (isStillActive) {
        playErrorBuzzer();
        toast.info(
          t(
            "kds:bumpBar.notBumped",
            "Ticket is already active on the display and cannot be recalled",
          ),
        );
        if (targetId === lastBumpedId) {
          setLastBumpedId(null);
        }
        return;
      }

      playRecallTone();
      if (onRecallOrder) {
        onRecallOrder(targetId);
      } else {
        try {
          await recallOrderMutation(targetId).unwrap();
        } catch {
          toast.error(t("kds:errors.recallFailed", `Failed to recall ticket ${targetId}`));
          return;
        }
      }
      setLastBumpedId(null);
      toast.info(t("kds:bumpBar.recalled", `Ticket ${targetId} recalled`, { id: targetId }));
    },
    [lastBumpedId, normalizedTickets, onRecallOrder, recallOrderMutation, t, setLastBumpedId],
  );

  // Hardware Bump Bar Integration
  useBumpBar(
    useCallback(
      (action) => {
        switch (action) {
          case BumpBarAction.Slot1:
            if (currentTickets.length > 0) setSelectedSlotIndex(0);
            break;
          case BumpBarAction.Slot2:
            if (currentTickets.length > 1) setSelectedSlotIndex(1);
            break;
          case BumpBarAction.Slot3:
            if (currentTickets.length > 2) setSelectedSlotIndex(2);
            break;
          case BumpBarAction.Slot4:
            if (currentTickets.length > 3) setSelectedSlotIndex(3);
            break;
          case BumpBarAction.Slot5:
            if (currentTickets.length > 4) setSelectedSlotIndex(4);
            break;
          case BumpBarAction.Slot6:
            if (currentTickets.length > 5) setSelectedSlotIndex(5);
            break;
          case BumpBarAction.Slot7:
            if (currentTickets.length > 6) setSelectedSlotIndex(6);
            break;
          case BumpBarAction.Slot8:
            if (currentTickets.length > 7) setSelectedSlotIndex(7);
            break;
          case BumpBarAction.NextSlot:
            if (currentTickets.length > 0) {
              if (selectedSlotIndex + 1 < currentTickets.length) {
                setSelectedSlotIndex((prev) => prev + 1);
              } else if (currentPage < totalPages) {
                setCurrentPage((p) => p + 1);
                setSelectedSlotIndex(0);
              } else {
                setSelectedSlotIndex(0);
              }
            }
            break;
          case BumpBarAction.PrevSlot:
            if (currentTickets.length > 0) {
              if (selectedSlotIndex > 0) {
                setSelectedSlotIndex((prev) => prev - 1);
              } else if (currentPage > 1) {
                setCurrentPage((p) => p - 1);
                setSelectedSlotIndex(Math.max(0, pageSize - 1));
              } else {
                setSelectedSlotIndex(currentTickets.length - 1);
              }
            }
            break;
          case BumpBarAction.BumpSelected: {
            const safeIndex =
              currentTickets.length === 0
                ? -1
                : Math.min(selectedSlotIndex, currentTickets.length - 1);
            const target = safeIndex >= 0 ? currentTickets[safeIndex] : undefined;
            if (target) {
              handleBump(target.id);
            } else {
              playErrorBuzzer();
            }
            break;
          }
          case BumpBarAction.RecallLast:
            handleRecall();
            break;
          case BumpBarAction.NextPage:
            if (currentPage < totalPages) {
              setCurrentPage((p) => p + 1);
              setSelectedSlotIndex(0);
            }
            break;
          case BumpBarAction.PrevPage:
            if (currentPage > 1) {
              setCurrentPage((p) => p - 1);
              setSelectedSlotIndex(0);
            }
            break;
          default:
            break;
        }
      },
      [
        currentTickets,
        selectedSlotIndex,
        currentPage,
        totalPages,
        pageSize,
        handleBump,
        handleRecall,
      ],
    ),
  );

  const isRecallAvailable = Boolean(
    lastBumpedId && !normalizedTickets.some((t) => t.id === lastBumpedId),
  );

  return (
    <section
      className="flex w-full flex-col gap-6"
      aria-label={t("kds:queue.title", "Kitchen display")}
    >
      {/* Header controls: ticket counts, board pagination, and hardware launcher */}
      <div className="border-border-subtle flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="font-display text-ink text-2xl font-bold">
            {t("kds:queue.title", "Kitchen display")}
          </h2>
          <p className="text-ink-muted text-sm">
            {t("kds:queue.subtitle_other", {
              count: normalizedTickets.length,
              defaultValue: `${normalizedTickets.length} active orders`,
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Board pagination controls */}
          <div className="bg-surface-elevated border-border-subtle flex items-center gap-1.5 rounded-lg border px-2 py-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={activePage <= 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                setSelectedSlotIndex(0);
              }}
              className="h-7 gap-1 px-2 font-mono text-xs"
              aria-label="Previous Page (PgUp)"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>PREV</span>
            </Button>

            <span
              className="bg-surface border-border-subtle text-ink rounded border px-2 py-0.5 font-mono text-xs font-semibold"
              aria-live="polite"
            >
              Page {activePage} / {totalPages}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={activePage >= totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                setSelectedSlotIndex(0);
              }}
              className="h-7 gap-1 px-2 font-mono text-xs"
              aria-label="Next Page (PgDn)"
            >
              <span>NEXT</span>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>

          {/* Recall Last Bumped Order */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isRecallAvailable}
            onClick={() => handleRecall()}
            className="h-9 gap-1.5 font-mono text-xs text-amber-500 hover:bg-amber-950/40 hover:text-amber-400 disabled:opacity-40"
            aria-label={t("kds:bumpBar.recallLast", "Recall last bumped ticket")}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("kds:bumpBar.recallLastBtn", "Recall Last")}</span>
          </Button>

          {/* Audio Mute/Unmute Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleMute}
            className="h-9 w-9 p-0"
            aria-label={muted ? "Unmute audio" : "Mute audio"}
          >
            {muted ? (
              <VolumeX className="text-ink-muted h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            )}
          </Button>

          {/* Launcher Button for Virtual Bump Bar Popup */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openVirtualBumpBar()}
            className="h-9 gap-2 font-mono text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            {t("kds:bumpBar.openVirtual", "Open Virtual Bump Bar")}
          </Button>
        </div>
      </div>

      {/* 8-Slot Tickets Grid */}
      {currentTickets.length === 0 ? (
        <div className="border-border-subtle bg-surface-elevated/40 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center">
          <p className="font-display text-ink mb-1 text-xl font-bold">
            {t("kds:queue.empty", "No active orders. Great work!")}
          </p>
          <p className="text-ink-muted text-sm">
            Incoming orders will appear here automatically in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentTickets.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              slotNumber={index + 1}
              isSelected={selectedSlotIndex === index}
              onSelect={() => setSelectedSlotIndex(index)}
              onAdvance={() => handleAdvance(ticket)}
              onBump={() => handleBump(ticket.id)}
              onRecall={onRecallOrder ? () => handleRecall(ticket.id) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default KdsTicketGrid;
