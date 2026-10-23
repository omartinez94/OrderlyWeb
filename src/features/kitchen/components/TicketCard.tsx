import { Clock, CheckCircle2, RotateCcw, Play } from "lucide-react";
import { Badge, Button } from "../../../components/ui";
import { StatusPill, OrderStatus } from "../../../components/StatusPill/StatusPill";
import { useElapsedTimer } from "../../../hooks/useElapsedTimer";
import "./TicketCard.css";

export interface TicketData {
  id: string;
  orderNumber?: string;
  table: string;
  items: string[];
  status: OrderStatus;
  elapsed: number;
  receivedAt?: string | null;
  station: string;
}

export interface TicketCardProps {
  ticket: TicketData;
  isSelected?: boolean;
  slotNumber?: number;
  onSelect?: () => void;
  onAdvance?: () => void;
  onBump?: () => void;
  onRecall?: () => void;
}

export function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

const STATUS_EMOJI: Record<OrderStatus, string> = {
  new: "🔔",
  acknowledged: "👀",
  preparing: "🍳",
  plating: "🍽️",
  ready: "🛎️",
  served: "✅",
};

export function TicketCard({
  ticket,
  isSelected = false,
  slotNumber,
  onSelect,
  onAdvance,
  onBump,
  onRecall,
}: TicketCardProps) {
  const isReady = ticket.status === OrderStatus.Ready;
  const isServed = ticket.status === OrderStatus.Served;
  const isPreparing = ticket.status === OrderStatus.Preparing;
  const isNew = ticket.status === OrderStatus.New;

  const { formatted: liveElapsed } = useElapsedTimer(ticket.receivedAt);
  const formattedTime = ticket.receivedAt ? liveElapsed : formatElapsed(ticket.elapsed ?? 0);

  let actionLabel = "Bump";
  let ActionIcon = CheckCircle2;
  let actionHandler = onBump || onAdvance;

  if (onAdvance && isNew) {
    actionLabel = "Start Prep";
    ActionIcon = Play;
    actionHandler = onAdvance;
  } else if (onAdvance && isPreparing) {
    actionLabel = "Mark Ready";
    ActionIcon = CheckCircle2;
    actionHandler = onAdvance;
  } else {
    actionLabel = "Bump";
    ActionIcon = CheckCircle2;
    actionHandler = onBump || onAdvance;
  }

  return (
    <div
      onClick={onSelect}
      className={`group ticket-card-transition relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 ${
        onSelect ? "cursor-pointer" : ""
      } ${isReady ? "ticket-card-ready-glow" : ""} ${
        isSelected
          ? "border-primary bg-surface-elevated ring-primary/40 scale-[1.02] shadow-xl ring-2"
          : "border-border-subtle bg-surface-elevated/70 hover:border-border-strong hover:bg-surface-elevated hover:shadow-md"
      }`}
    >
      {/* Top Status Glow Bar */}
      <div
        className={`ticket-status-glow ticket-status-glow--${ticket.status}`}
        aria-hidden="true"
      />

      {/* Completed Shimmer Glint */}
      {(isReady || isServed) && <div className="ticket-completed-shimmer" />}

      {/* Confetti Explosion (one-shot decoration) */}
      {(isReady || isServed) && (
        <div className="confetti-burst">
          <div
            className="confetti-particle bg-amber-400"
            style={{ "--tx": "0px", "--ty": "-18px" } as React.CSSProperties}
          />
          <div
            className="confetti-particle bg-orange-400"
            style={{ "--tx": "14px", "--ty": "-12px" } as React.CSSProperties}
          />
          <div
            className="confetti-particle bg-rose-400"
            style={{ "--tx": "18px", "--ty": "4px" } as React.CSSProperties}
          />
          <div
            className="confetti-particle bg-emerald-400"
            style={{ "--tx": "8px", "--ty": "16px" } as React.CSSProperties}
          />
          <div
            className="confetti-particle bg-sky-400"
            style={{ "--tx": "-12px", "--ty": "12px" } as React.CSSProperties}
          />
          <div
            className="confetti-particle bg-violet-400"
            style={{ "--tx": "-18px", "--ty": "-6px" } as React.CSSProperties}
          />
        </div>
      )}

      {/* Status bar top indicator */}
      <div className="z-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {slotNumber !== undefined && (
            <Badge
              variant={isSelected ? "default" : "secondary"}
              className={`px-3 py-1 font-mono text-sm font-black tracking-wider ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-elevated text-ink-muted border"
              }`}
            >
              #{slotNumber}
            </Badge>
          )}
          {isPreparing ? (
            <div className="fire-container">
              <span className="fire-flame fire-flame-1">🔥</span>
              <span className="fire-flame fire-flame-2">🔥</span>
              <span className="fire-flame fire-flame-3">🔥</span>
              <span
                className="apple-emoji-spin emoji-sizzle text-2xl"
                role="img"
                aria-label="Preparing status"
              >
                {STATUS_EMOJI[ticket.status] ?? "🍳"}
              </span>
            </div>
          ) : (
            <span className="apple-emoji-spin text-2xl" role="img" aria-label="Status icon">
              {STATUS_EMOJI[ticket.status] ?? "🔔"}
            </span>
          )}
          <span className="text-ink font-mono text-base font-bold">
            {ticket.orderNumber || ticket.id}
          </span>
        </div>
        <div className="origin-right scale-105">
          <StatusPill status={ticket.status} />
        </div>
      </div>

      {/* Ticket Details */}
      <div className="z-10 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-ink text-xl font-bold">{ticket.table}</span>
          <Badge variant="secondary" className="text-ink-muted px-2.5 py-0.5 font-mono text-xs">
            {ticket.station}
          </Badge>
        </div>

        <ul className="border-border-subtle text-ink-muted space-y-2.5 border-t pt-3 text-base">
          {ticket.items.map((item, idx) => (
            <li key={idx} className="ticket-item-slide flex items-center gap-2.5">
              <span className="bg-primary/70 h-2 w-2 shrink-0 rounded-full" />
              <span className="text-ink leading-snug font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Controls & Live Counter */}
      <div className="border-border-subtle z-10 mt-6 flex flex-wrap items-center justify-between gap-2.5 border-t pt-4">
        <div className="text-ink-muted flex items-center gap-2 font-mono text-sm font-bold">
          <Clock className="text-accent h-4 w-4 animate-pulse" />
          <span>{formattedTime}</span>
        </div>

        {/* Hotkey Indicators when selected */}
        {isSelected && (
          <div className="flex items-center gap-1.5 rounded border border-emerald-800 bg-emerald-950/60 px-2.5 py-1 font-mono text-xs text-emerald-400">
            <span className="font-bold">[ENTER: Bump]</span>
            <span className="opacity-50">·</span>
            <span className="font-bold text-amber-400">[R: Recall]</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onRecall && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRecall();
              }}
              className="h-9 gap-1.5 px-3 text-xs font-semibold text-amber-500 hover:bg-amber-950/40 hover:text-amber-400"
              aria-label={`Recall ticket ${ticket.id}`}
            >
              <RotateCcw className="h-4 w-4" />
              Recall
            </Button>
          )}
          {actionHandler && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                actionHandler();
              }}
              className="hover:bg-primary h-9 gap-1.5 px-4 text-sm font-bold transition-transform hover:text-white active:scale-95"
              aria-label={`${actionLabel} ticket ${ticket.id}`}
            >
              {actionLabel}
              <ActionIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
