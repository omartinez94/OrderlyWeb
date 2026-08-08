import { Clock, CheckCircle2 } from "lucide-react";
import { Badge, Button } from "../../../components/ui";
import { StatusPill, type OrderStatus } from "../../../components/StatusPill/StatusPill";
import "./TicketCard.css";

export interface TicketData {
  id: string;
  table: string;
  items: string[];
  status: OrderStatus;
  elapsed: number;
  station: string;
}

interface TicketCardProps {
  ticket: TicketData;
  isSelected?: boolean;
  onSelect?: () => void;
  onAdvance?: () => void;
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

export function TicketCard({ ticket, isSelected = false, onSelect, onAdvance }: TicketCardProps) {
  const isReady = ticket.status === "ready";
  const isServed = ticket.status === "served";
  const isPreparing = ticket.status === "preparing";

  return (
    <div
      onClick={onSelect}
      className={`group ticket-card-transition relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 ${
        onSelect ? "cursor-pointer" : ""
      } ${isReady ? "ticket-card-ready-glow" : ""} ${
        isSelected
          ? "border-primary bg-surface-elevated ring-primary/20 scale-[1.02] shadow-xl ring-2"
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
        <div className="flex items-center gap-2">
          {isPreparing ? (
            <div className="fire-container">
              <span className="fire-flame fire-flame-1">🔥</span>
              <span className="fire-flame fire-flame-2">🔥</span>
              <span className="fire-flame fire-flame-3">🔥</span>
              <span
                className="apple-emoji-spin emoji-sizzle text-lg"
                role="img"
                aria-label="Preparing status"
              >
                {STATUS_EMOJI[ticket.status]}
              </span>
            </div>
          ) : (
            <span className="apple-emoji-spin text-lg" role="img" aria-label="Status icon">
              {STATUS_EMOJI[ticket.status]}
            </span>
          )}
          <span className="text-ink font-mono text-sm font-bold">{ticket.id}</span>
        </div>
        <StatusPill status={ticket.status} />
      </div>

      {/* Ticket Details */}
      <div className="z-10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-ink text-lg font-bold">{ticket.table}</span>
          <Badge variant="secondary" className="text-ink-muted font-mono text-[11px]">
            {ticket.station}
          </Badge>
        </div>

        <ul className="border-border-subtle text-ink-muted space-y-1.5 border-t pt-3 text-sm">
          {ticket.items.map((item, idx) => (
            <li key={idx} className="ticket-item-slide flex items-center gap-2">
              <span className="bg-primary/60 h-1.5 w-1.5 rounded-full" />
              <span className="text-ink font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Controls & Live Counter */}
      <div className="border-border-subtle z-10 mt-6 flex items-center justify-between border-t pt-4">
        <div className="text-ink-muted flex items-center gap-1.5 font-mono text-xs">
          <Clock className="text-accent h-3.5 w-3.5 animate-pulse" />
          <span>{formatElapsed(ticket.elapsed)}</span>
        </div>

        {onAdvance && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAdvance();
            }}
            className="hover:bg-primary h-8 gap-1 px-3 text-xs font-semibold transition-transform hover:text-white active:scale-95"
          >
            Advance
            <CheckCircle2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
