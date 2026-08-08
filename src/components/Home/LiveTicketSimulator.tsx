import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("common");
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
        })),
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
      }),
    );
  };

  const translatedTickets = tickets.map((ticket) => {
    let table = ticket.table;
    if (ticket.table.startsWith("Table ")) {
      table = t("home.simulator.tickets.table", { num: ticket.table.substring(6) });
    } else if (ticket.table.startsWith("Bar ")) {
      table = t("home.simulator.tickets.bar", { num: ticket.table.substring(4) });
    }

    const items = ticket.items.map((item) => {
      if (item === "Pan-seared Ribeye x2") return t("home.simulator.tickets.ribeye");
      if (item === "Truffle Fries") return t("home.simulator.tickets.fries");
      if (item === "Craft IPA x2") return t("home.simulator.tickets.ipa");
      if (item === "Wild Mushroom Risotto") return t("home.simulator.tickets.risotto");
      if (item === "Crispy Calamari") return t("home.simulator.tickets.calamari");
      if (item === "Chardonnay") return t("home.simulator.tickets.chardonnay");
      if (item === "Smoked Old Fashioned x2") return t("home.simulator.tickets.oldFashioned");
      if (item === "Charcuterie Board") return t("home.simulator.tickets.charcuterie");
      return item;
    });

    let station = ticket.station;
    if (ticket.station === "Grill & Sides") station = t("home.simulator.tickets.grillSides");
    else if (ticket.station === "Hot Line") station = t("home.simulator.tickets.hotLine");
    else if (ticket.station === "Beverage") station = t("home.simulator.tickets.beverage");

    return {
      ...ticket,
      table,
      items,
      station,
    };
  });

  return (
    <section className="bg-surface border-border-subtle relative overflow-hidden border-b py-16 lg:py-24">
      {/* Background ambient lighting */}
      <div className="from-primary/10 via-accent/10 pointer-events-none absolute top-1/2 left-1/2 h-[450px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r to-teal-500/10 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary mb-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider uppercase"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("home.simulator.badge")}
          </Badge>
          <h2 className="font-display text-ink text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {t("home.simulator.title")}
          </h2>
          <p className="text-ink-muted mt-3 font-sans text-base sm:text-lg">
            {t("home.simulator.description")}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant={isAutoAdvancing ? "default" : "outline"}
              onClick={() => setIsAutoAdvancing(!isAutoAdvancing)}
              className="gap-2 text-xs font-semibold"
            >
              {isAutoAdvancing ? (
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {isAutoAdvancing ? t("home.simulator.autoAdvancing") : t("home.simulator.resumeAuto")}
            </Button>
          </div>
        </div>

        {/* Live Interactive Tickets Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {translatedTickets.map((tData) => (
            <TicketCard
              key={tData.id}
              ticket={tData}
              isSelected={tData.id === activeTicketId}
              onSelect={() => setActiveTicketId(tData.id)}
              onAdvance={() => advanceTicket(tData.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
