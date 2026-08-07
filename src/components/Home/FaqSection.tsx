import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How does Orderly unify front of house and back of house?",
    a: "Instead of running separate software for kitchen display, POS terminals, and management dashboards, Orderly provides a single role-aware frontend connected to YARP API Gateway microservices.",
  },
  {
    q: "How does live WebSocket sync operate across devices?",
    a: "Orderly connects all active browser clients to a SignalR hub with automatic back-off reconnection (1s, 2s, 5s, 10s, 30s). State changes push instantly without client polling.",
  },
  {
    q: "What security measures govern role access?",
    a: "Authentication uses short-lived in-memory JWT access tokens combined with secure httpOnly refresh cookies. All zone routes are guarded by layout-level role predicates.",
  },
  {
    q: "Can Orderly scale to multi-location restaurant chains?",
    a: "Yes. The backend microservices architecture decouples Identity, Catalog, Order, Basket, Discount, Kitchen, and Notification domains for maximum throughput and horizontal scalability.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-surface border-border-subtle border-t py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge
            variant="outline"
            className="text-primary border-border-strong mb-3 text-xs tracking-wider uppercase"
          >
            Questions & Answers
          </Badge>
          <h2 className="font-display text-ink text-3xl font-extrabold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-border-subtle bg-surface-elevated rounded-xl border px-6 transition-all hover:border-primary/40"
            >
              <AccordionTrigger className="text-ink hover:text-primary py-4 font-sans text-base font-semibold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-ink-muted pb-4 font-sans text-sm leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
