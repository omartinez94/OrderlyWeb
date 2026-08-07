import { ChefHat, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { StatusPill, type OrderStatus } from "../../../components/StatusPill/StatusPill";

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

export function TicketCard({ ticket, isSelected = false, onSelect, onAdvance }: TicketCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 ${
        onSelect ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-primary bg-surface-elevated shadow-xl scale-[1.02] ring-2 ring-primary/20"
          : "border-border-subtle bg-surface-elevated/70 hover:border-border-strong hover:bg-surface-elevated hover:shadow-md"
      }`}
    >
      {/* Status bar top indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-bold text-ink">{ticket.id}</span>
        </div>
        <StatusPill status={ticket.status} />
      </div>

      {/* Ticket Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold text-ink">{ticket.table}</span>
          <Badge variant="secondary" className="font-mono text-[11px] text-ink-muted">
            {ticket.station}
          </Badge>
        </div>

        <ul className="space-y-1.5 border-t border-border-subtle pt-3 text-sm text-ink-muted">
          {ticket.items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <span className="font-medium text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Controls & Live Counter */}
      <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
        <div className="flex items-center gap-1.5 font-mono text-xs text-ink-muted">
          <Clock className="h-3.5 w-3.5 text-accent animate-pulse" />
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
            className="h-8 gap-1 px-3 text-xs font-semibold transition-transform active:scale-95 hover:bg-primary hover:text-white"
          >
            Advance
            <CheckCircle2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
