import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { TicketCard, type TicketData } from "../../features/kitchen/components/TicketCard";
import { Play, RotateCcw, Sparkles } from "lucide-react";
import { type OrderStatus } from "../StatusPill/StatusPill";

const INITIAL_TICKETS: TicketData[] = [
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

const NEXT_STATUS: Record<OrderStatus, OrderStatus> = {
  new: "acknowledged",
  acknowledged: "preparing",
  preparing: "plating",
  plating: "ready",
  ready: "served",
  served: "new",
};

export function LiveTicketSimulator() {
  const [tickets, setTickets] = useState<TicketData[]>(INITIAL_TICKETS);
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
          {tickets.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              isSelected={t.id === activeTicketId}
              onSelect={() => setActiveTicketId(t.id)}
              onAdvance={() => advanceTicket(t.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
