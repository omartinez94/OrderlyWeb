import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { StatusPill } from "../StatusPill/StatusPill";
import { ChefHat, Clock, Play, RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";

interface Ticket {
  id: string;
  table: string;
  items: string[];
  status: "new" | "acknowledged" | "preparing" | "plating" | "ready";
  elapsed: number;
  station: string;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "#ORD-402",
    table: "Table 04",
    items: ["Pan-seared Ribeye x2", "Truffle Fries", "Craft IPA x2"],
    status: "preparing",
    elapsed: 140,
    station: "Grill & Sides",
  },
  {
    id: "#ORD-403",
    table: "Table 12",
    items: ["Wild Mushroom Risotto", "Crispy Calamari", "Chardonnay"],
    status: "acknowledged",
    elapsed: 45,
    station: "Hot Line",
  },
  {
    id: "#ORD-404",
    table: "Bar 02",
    items: ["Smoked Old Fashioned x2", "Charcuterie Board"],
    status: "new",
    elapsed: 12,
    station: "Beverage",
  },
];

const NEXT_STATUS: Record<Ticket["status"], Ticket["status"]> = {
  new: "acknowledged",
  acknowledged: "preparing",
  preparing: "plating",
  plating: "ready",
  ready: "new",
};

export function LiveTicketSimulator() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(true);
  const [activeTicketId, setActiveTicketId] = useState<string>("#ORD-402");

  // Timer loop & auto-advancement simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => ({
          ...t,
          elapsed: t.elapsed + 1,
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAutoAdvancing) return;

    const autoTimer = setInterval(() => {
      setTickets((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        return prev.map((t, idx) => {
          if (idx === randomIndex) {
            const nextSt = NEXT_STATUS[t.status];
            return {
              ...t,
              status: nextSt,
              elapsed: nextSt === "new" ? 5 : t.elapsed,
            };
          }
          return t;
        });
      });
    }, 4500);

    return () => clearInterval(autoTimer);
  }, [isAutoAdvancing]);

  const advanceTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextSt = NEXT_STATUS[t.status];
          return {
            ...t,
            status: nextSt,
            elapsed: nextSt === "new" ? 0 : t.elapsed,
          };
        }
        return t;
      })
    );
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <section className="bg-surface relative overflow-hidden py-16 lg:py-24 border-b border-border-subtle">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[450px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-teal-500/10 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 inline-flex items-center gap-1.5 border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Live KDS SignalR Simulator
          </Badge>
          <h2 className="font-display text-ink text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Experience real-time tickets in action
          </h2>
          <p className="text-ink-muted mt-3 font-sans text-base sm:text-lg">
            Watch sub-second order dispatch or click any ticket card to manually transition order state.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant={isAutoAdvancing ? "default" : "outline"}
              onClick={() => setIsAutoAdvancing(!isAutoAdvancing)}
              className="gap-2 text-xs font-semibold"
            >
              {isAutoAdvancing ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {isAutoAdvancing ? "Auto-Advancing Shifts" : "Resume Auto Simulation"}
            </Button>
          </div>
        </div>

        {/* Live Interactive Tickets Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tickets.map((t) => {
            const isSelected = t.id === activeTicketId;
            return (
              <div
                key={t.id}
                onClick={() => setActiveTicketId(t.id)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-surface-elevated shadow-xl scale-[1.02] ring-2 ring-primary/20"
                    : "border-border-subtle bg-surface-elevated/70 hover:border-border-strong hover:bg-surface-elevated hover:shadow-md"
                }`}
              >
                {/* Status bar top indicator */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm font-bold text-ink">{t.id}</span>
                  </div>
                  <StatusPill status={t.status} />
                </div>

                {/* Ticket Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-ink">{t.table}</span>
                    <Badge variant="secondary" className="font-mono text-[11px] text-ink-muted">
                      {t.station}
                    </Badge>
                  </div>

                  <ul className="space-y-1.5 border-t border-border-subtle pt-3 text-sm text-ink-muted">
                    {t.items.map((item, idx) => (
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
                    <span>{formatElapsed(t.elapsed)}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      advanceTicket(t.id);
                    }}
                    className="h-8 gap-1 px-3 text-xs font-semibold transition-transform active:scale-95 hover:bg-primary hover:text-white"
                  >
                    Advance
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
