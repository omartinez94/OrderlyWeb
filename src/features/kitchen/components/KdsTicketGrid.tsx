import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ExternalLink, Volume2, VolumeX } from "lucide-react";
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
import { useBumpOrderMutation, useRecallOrderMutation } from "../../../app/api/kitchen";
import type { KitchenTicketDto } from "../../../types/kitchen";

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
    id: dto.orderNumber || dto.id,
    table: dto.notes ? dto.notes : `Ticket #${dto.orderNumber || dto.id.slice(0, 6)}`,
    items: dto.items.map((i) => `${i.quantity}x ${i.menuItemName}`),
    status:
      dto.status === "New"
        ? "new"
        : dto.status === "InProgress"
          ? "preparing"
          : dto.status === "Ready"
            ? "ready"
            : "served",
    elapsed: 0,
    receivedAt: dto.receivedAt,
    station: dto.items[0]?.stationId ? `Station ${dto.items[0].stationId}` : "Line 1",
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
  const [lastBumpedId, setLastBumpedId] = useState<string | null>(null);
  const [muted, setMuted] = useState<boolean>(() => isAudioMuted());

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      setAudioMuted(next);
      return next;
    });
  }, []);

  const [bumpOrderMutation] = useBumpOrderMutation();
  const [recallOrderMutation] = useRecallOrderMutation();

  const normalizedTickets = useMemo(() => tickets.map(normalizeTicket), [tickets]);

  const totalPages = Math.max(1, Math.ceil(normalizedTickets.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const currentTickets = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return normalizedTickets.slice(start, start + pageSize);
  }, [normalizedTickets, activePage, pageSize]);

  const handleBump = useCallback(
    async (ticketId: string) => {
      playBumpChime();
      setLastBumpedId(ticketId);
      if (onBumpOrder) {
        onBumpOrder(ticketId);
      } else {
        try {
          await bumpOrderMutation(ticketId).unwrap();
        } catch {
          // Handled or toasted
        }
      }
      toast.success(t("kds:actions.markReady", `Ticket ${ticketId} bumped`));
    },
    [onBumpOrder, bumpOrderMutation, t],
  );

  const handleRecall = useCallback(
    async (ticketId?: string) => {
      const targetId = ticketId || lastBumpedId;
      if (!targetId) {
        playErrorBuzzer();
        toast.info(t("kds:bumpBar.noTicketToRecall", "No recently bumped ticket to recall"));
        return;
      }
      playRecallTone();
      if (onRecallOrder) {
        onRecallOrder(targetId);
      } else {
        try {
          await recallOrderMutation(targetId).unwrap();
        } catch {
          // Handled
        }
      }
      toast.info(t("kds:bumpBar.recalled", `Ticket ${targetId} recalled`));
    },
    [lastBumpedId, onRecallOrder, recallOrderMutation, t],
  );

  // Hardware Bump Bar Integration
  useBumpBar(
    useCallback(
      (action) => {
        switch (action) {
          case "SLOT_1":
            if (currentTickets.length > 0) setSelectedSlotIndex(0);
            break;
          case "SLOT_2":
            if (currentTickets.length > 1) setSelectedSlotIndex(1);
            break;
          case "SLOT_3":
            if (currentTickets.length > 2) setSelectedSlotIndex(2);
            break;
          case "SLOT_4":
            if (currentTickets.length > 3) setSelectedSlotIndex(3);
            break;
          case "SLOT_5":
            if (currentTickets.length > 4) setSelectedSlotIndex(4);
            break;
          case "SLOT_6":
            if (currentTickets.length > 5) setSelectedSlotIndex(5);
            break;
          case "SLOT_7":
            if (currentTickets.length > 6) setSelectedSlotIndex(6);
            break;
          case "SLOT_8":
            if (currentTickets.length > 7) setSelectedSlotIndex(7);
            break;
          case "BUMP_SELECTED": {
            const target = currentTickets[selectedSlotIndex];
            if (target) {
              handleBump(target.id);
            } else {
              playErrorBuzzer();
            }
            break;
          }
          case "RECALL_LAST":
            handleRecall();
            break;
          case "NEXT_PAGE":
            if (currentPage < totalPages) {
              setCurrentPage((p) => p + 1);
              setSelectedSlotIndex(0);
            }
            break;
          case "PREV_PAGE":
            if (currentPage > 1) {
              setCurrentPage((p) => p - 1);
              setSelectedSlotIndex(0);
            }
            break;
          default:
            break;
        }
      },
      [currentTickets, selectedSlotIndex, currentPage, totalPages, handleBump, handleRecall],
    ),
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
              onBump={() => handleBump(ticket.id)}
              onRecall={() => handleRecall(ticket.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default KdsTicketGrid;
