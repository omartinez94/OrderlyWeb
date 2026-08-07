import { Badge } from "../ui/badge";
import { ScrollReveal } from "../Motion/ScrollReveal";
import { FeatureCard, type FeatureCardItem } from "../ui/feature-card";
import { Server, Activity, Lock } from "lucide-react";

const ARCHITECTURE_FEATURES: FeatureCardItem[] = [
  {
    icon: Server,
    title: "Microservice Mesh",
    description: "Independent backend services for Identity, Catalog, Order, Kitchen, Basket & Notification.",
    points: [
      "YARP API Gateway (Port 6004)",
      "Redis-backed Basket calculation",
      "Single flight JWT refresh flow",
    ],
  },
  {
    icon: Activity,
    title: "Live SignalR Pipeline",
    description: "Instant WebSocket dispatch ensures tickets update without polling or manual refreshes.",
    points: [
      "OrderReceived & OrderReady hubs",
      "5-stage auto-reconnect policy",
      "ItemStateChanged live dispatch",
    ],
    variant: "accent",
  },
  {
    icon: Lock,
    title: "Role-Based Security",
    description: "Role-aware interface routing keeps staff focused on their specific operational domain.",
    points: [
      "In-memory JWT access token",
      "Layout-level GuardedPage wrapper",
      "8 roles across 3 top-level zones",
    ],
  },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="bg-surface border-border-subtle border-b py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge
              variant="outline"
              className="text-primary border-border-strong mb-4 text-xs tracking-wider uppercase"
            >
              Enterprise Architecture
            </Badge>
            <h2 className="font-display text-ink text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Engineered for zero downtime & maximum throughput
            </h2>
            <p className="text-ink-muted mt-4 font-sans text-lg leading-relaxed">
              Orderly decouples frontend delivery from backend domain services via YARP Gateway,
              delivering sub-second real-time state across every device.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {ARCHITECTURE_FEATURES.map((feature, idx) => (
            <ScrollReveal key={idx} direction="up" delay={(idx + 1) * 100}>
              <FeatureCard feature={feature} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
