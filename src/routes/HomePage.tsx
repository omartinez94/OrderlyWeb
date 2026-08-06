import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { SignInBridgeTrigger } from "../components/SignInDialog/SignInBridgeTrigger";
import { HeroCarousel } from "../components/HeroCarousel";
import { ThemeToggle } from "../components/ThemeToggle/ThemeToggle";
import { PATH } from "../router/pathNames";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

import {
  ChefHat,
  ShieldCheck,
  Store,
  Zap,
  Activity,
  Server,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

const STATS = [
  { label: "Real-time Latency", value: "< 50ms", detail: "SignalR web sockets" },
  { label: "Microservices", value: "7 Core", detail: "YARP API Gateway backed" },
  { label: "Role Precision", value: "8 Roles", detail: "Granular zone access" },
  { label: "Hub Uptime", value: "99.99%", detail: "Resilient auto-reconnect" },
];

const ZONES = [
  {
    id: "admin",
    name: "Admin & Executive Zone",
    path: "/site/admin",
    badge: "SuperAdmin · Manager",
    icon: ShieldCheck,
    description:
      "Complete back-office control center for staff provisioning, menu catalogs, multi-unit governance, and system metrics.",
    image: "/images/04-staff-management.jpg",
    points: [
      "Staff onboarding and role assignment",
      "Global category and menu item cataloging",
      "System audit logs and operational health",
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen Display System (KDS)",
    path: "/site/kitchen",
    badge: "KitchenManager · Line Cook",
    icon: ChefHat,
    description:
      "High-velocity ticket queue designed for intense shift environments with automated cool-to-warm time-urgency gradients.",
    image: "/images/03-kds-mockup.jpg",
    points: [
      "Sub-second order state updates",
      "Station-filtered ticket dispatch",
      "Dynamic color-coded prep timer thresholds",
    ],
  },
  {
    id: "restaurant",
    name: "Floor & Dining Operations",
    path: "/site/restaurant",
    badge: "Waiter · Cashier · Host",
    icon: Store,
    description:
      "Fast table-side POS ordering, seat management, flexible bill splitting, and instant reservation routing.",
    image: "/images/04-split-bill.jpg",
    points: [
      "Frictionless seat-based check splitting",
      "Live table occupancy status map",
      "Direct Redis-backed basket pricing",
    ],
  },
];

const FAQ_ITEMS = [
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
] as const;

export function HomePage() {
  const [activeZone, setActiveZone] = useState<string>("admin");

  return (
    <div className="bg-surface text-ink selection:bg-primary/20 selection:text-primary min-h-screen font-sans antialiased">
      <MarketingHeader />
      <main id="main">
        {/* Big Picture Hero Jumbotron with Carousel */}
        <HeroCarousel />

        {/* Stats & Trust Banner */}
        <StatsBanner />

        {/* Architecture & Microservices Highlight */}
        <ArchitectureSection />

        {/* Multi-Zone Deep Dive */}
        <ZoneShowcaseSection activeZone={activeZone} setActiveZone={setActiveZone} />

        {/* Vibe / Atmosphere Hero Highlight */}
        <AtmosphereSection />

        {/* Call to Action Jumbotron */}
        <CtaJumbotron />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      <SiteFooter />
    </div>
  );
}

function MarketingHeader() {
  return (
    <header className="border-border-subtle bg-surface/85 sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="group flex items-center gap-2">
            <div className="bg-gradient-primary flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-display text-primary text-2xl font-bold tracking-tight">
              Orderly
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="text-ink-muted hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#capabilities" className="hover:text-primary transition-colors">
              Capabilities
            </a>
            <a href="#architecture" className="hover:text-primary transition-colors">
              Architecture
            </a>
            <a href="#zones" className="hover:text-primary transition-colors">
              Three Zones
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-surface-elevated flex items-center gap-1.5 rounded-full border p-1">
            <ThemeToggle />
          </div>

          <SignInBridgeTrigger>
            <Button size="sm" className="font-semibold shadow-xs">
              Sign in
            </Button>
          </SignInBridgeTrigger>
        </div>
      </div>
    </header>
  );
}

function StatsBanner() {
  return (
    <section
      aria-label="Key Performance Indicators"
      className="border-border-subtle bg-surface-elevated/60 border-y py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat, idx) => (
            <div key={idx} className="border-primary/30 flex flex-col border-l-2 pl-4 sm:pl-6">
              <span className="text-primary font-mono text-3xl font-extrabold tracking-tight sm:text-4xl">
                {stat.value}
              </span>
              <span className="font-display text-ink mt-1 text-sm font-bold">{stat.label}</span>
              <span className="text-ink-muted font-sans text-xs">{stat.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="bg-surface border-border-subtle border-b py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="border-border-subtle bg-surface-elevated shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Server className="h-6 w-6" />
              </div>
              <CardTitle className="font-display text-xl font-bold">Microservice Mesh</CardTitle>
              <CardDescription className="text-ink-muted">
                Independent backend services for Identity, Catalog, Order, Kitchen, Basket &
                Notification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-ink-muted space-y-2.5 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                  <span>YARP API Gateway (Port 6004)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                  <span>Redis-backed Basket calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                  <span>Single flight JWT refresh flow</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border-subtle bg-surface-elevated shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="bg-accent/10 text-accent mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Activity className="h-6 w-6" />
              </div>
              <CardTitle className="font-display text-xl font-bold">
                Live SignalR Pipeline
              </CardTitle>
              <CardDescription className="text-ink-muted">
                Instant WebSocket dispatch ensures tickets update without polling or manual
                refreshes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-ink-muted space-y-2.5 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-accent h-4 w-4 shrink-0" />
                  <span>OrderReceived & OrderReady hubs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-accent h-4 w-4 shrink-0" />
                  <span>5-stage auto-reconnect policy</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-accent h-4 w-4 shrink-0" />
                  <span>ItemStateChanged live dispatch</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border-subtle bg-surface-elevated shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="font-display text-xl font-bold">Role-Based Security</CardTitle>
              <CardDescription className="text-ink-muted">
                Role-aware interface routing keeps staff focused on their specific operational
                domain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-ink-muted space-y-2.5 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                  <span>In-memory JWT access token</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                  <span>Layout-level GuardedPage wrapper</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                  <span>8 roles across 3 top-level zones</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ZoneShowcaseSection({
  activeZone,
  setActiveZone,
}: {
  activeZone: string;
  setActiveZone: (id: string) => void;
}) {
  const current = ZONES.find((z) => z.id === activeZone) || ZONES[0];
  const Icon = current.icon;

  return (
    <section
      id="zones"
      className="bg-surface-elevated/40 border-border-subtle border-b py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge
            variant="outline"
            className="text-primary border-border-strong mb-4 text-xs tracking-wider uppercase"
          >
            Three Operational Zones
          </Badge>
          <h2 className="font-display text-ink text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Tailored interfaces for every restaurant shift
          </h2>
          <p className="text-ink-muted mt-4 font-sans text-lg">
            Click a zone below to preview the dedicated workspace.
          </p>
        </div>

        {/* Zone Selector Buttons */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {ZONES.map((zone) => {
            const ZIcon = zone.icon;
            const isSelected = zone.id === activeZone;
            return (
              <button
                key={zone.id}
                onClick={() => setActiveZone(zone.id)}
                className={`font-display flex items-center gap-3 rounded-xl border px-5 py-3 text-base font-bold transition-all ${
                  isSelected
                    ? "border-primary bg-primary scale-[1.02] text-white shadow-md"
                    : "border-border-strong bg-surface text-ink hover:bg-surface-elevated"
                }`}
              >
                <ZIcon className={`h-5 w-5 ${isSelected ? "text-white" : "text-primary"}`} />
                {zone.name}
              </button>
            );
          })}
        </div>

        {/* Active Zone Display Card */}
        <div className="border-border-strong bg-surface grid grid-cols-1 items-center gap-8 rounded-2xl border p-8 shadow-xl lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <Icon className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="text-primary font-mono text-xs">
                {current.badge}
              </Badge>
            </div>

            <h3 className="font-display text-ink text-3xl font-bold tracking-tight">
              {current.name}
            </h3>

            <p className="text-ink-muted font-sans text-lg leading-relaxed">
              {current.description}
            </p>

            <ul className="text-ink space-y-3 font-sans text-sm">
              {current.points.map((pt, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <SignInBridgeTrigger>
                <Button className="font-semibold shadow-xs">
                  Access {current.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInBridgeTrigger>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="border-border-subtle relative overflow-hidden rounded-xl border shadow-lg">
              <img
                src={current.image}
                alt={current.name}
                className="h-[360px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AtmosphereSection() {
  return (
    <section className="bg-surface relative overflow-hidden py-28">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/06-ingredients.jpg"
          alt="Fresh restaurant ingredients"
          className="h-full w-full object-cover"
        />
        <div className="from-surface via-surface/80 to-surface absolute inset-0 bg-gradient-to-t" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <Badge
          variant="outline"
          className="text-primary border-border-strong bg-surface/80 mb-4 text-xs tracking-wider uppercase"
        >
          Chef & Guest Experience
        </Badge>
        <h2 className="font-display text-ink text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          "Orderly gave our kitchen line peace and doubled table turnover efficiency."
        </h2>
        <p className="text-ink-muted mx-auto mt-6 max-w-2xl font-sans text-xl leading-relaxed">
          Designed specifically to eliminate noisy ticket printers and manual communication
          breakdowns between servers and chefs.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <img
            src="/images/05-staff-avatar-set.jpg"
            alt="Orderly Staff Team"
            className="border-primary h-14 w-14 rounded-full border-2 object-cover shadow-md"
          />
          <div className="text-left">
            <p className="font-display text-ink text-base font-bold">Executive Chef & Operations</p>
            <p className="text-ink-muted font-sans text-xs">Grand Bistro & Culinary Group</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaJumbotron() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-primary relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl sm:p-12 lg:p-16">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 max-w-3xl">
            <Badge
              variant="secondary"
              className="mb-6 border-none bg-white/20 text-white hover:bg-white/30"
            >
              Ready to Upgrade Your Shift?
            </Badge>
            <h2 className="font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
              Get started with Orderly in minutes.
            </h2>
            <p className="mt-4 font-sans text-lg leading-relaxed text-white/90">
              Sign in with your staff credentials or contact your Restaurant Administrator to
              request zone access.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <SignInBridgeTrigger>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-primary h-12 px-8 font-bold shadow-lg hover:bg-white"
                >
                  Open Sign-In Dialog
                </Button>
              </SignInBridgeTrigger>

              <Link to={PATH.SHOWCASE}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/40 font-medium text-white hover:bg-white/10"
                >
                  View Component Showcase
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
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
              className="border-border-subtle bg-surface-elevated rounded-xl border px-6 transition-colors"
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

function SiteFooter() {
  return (
    <footer
      aria-label="Site footer"
      className="border-border-subtle bg-surface-elevated border-t py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 pb-12 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-lg text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-display text-primary text-xl font-bold">Orderly</span>
            </div>
            <p className="text-ink-muted font-sans text-xs leading-relaxed">
              Enterprise staff-facing management system for modern dining rooms and kitchen
              operations.
            </p>
          </div>

          <div>
            <p className="font-display text-ink mb-3 text-sm font-bold">Zones</p>
            <ul className="text-ink-muted space-y-2 font-sans text-xs">
              <li>
                <Link to="/site/admin" className="hover:text-primary transition-colors">
                  Admin Console
                </Link>
              </li>
              <li>
                <Link to="/site/kitchen" className="hover:text-primary transition-colors">
                  Kitchen KDS
                </Link>
              </li>
              <li>
                <Link to="/site/restaurant" className="hover:text-primary transition-colors">
                  Restaurant Operations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-ink mb-3 text-sm font-bold">System</p>
            <ul className="text-ink-muted space-y-2 font-sans text-xs">
              <li>
                <Link to={PATH.SHOWCASE} className="hover:text-primary transition-colors">
                  UI Primitive Showcase
                </Link>
              </li>
              <li>
                <a href="#architecture" className="hover:text-primary transition-colors">
                  Microservice Gateway
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-ink mb-3 text-sm font-bold">Gateway Status</p>
            <div className="border-border-subtle bg-surface flex items-center gap-2 rounded-lg border p-3 text-xs">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-ink font-mono font-medium">Gateway 6004 Online</span>
            </div>
          </div>
        </div>

        <div className="border-border-subtle text-ink-subtle flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row">
          <p>© Orderly. Built for high-volume restaurant shifts.</p>
          <div className="flex items-center gap-6">
            <SignInBridgeTrigger>
              <button type="button" className="hover:text-ink transition-colors">
                Staff Sign In
              </button>
            </SignInBridgeTrigger>
            <Link to={PATH.SHOWCASE} className="hover:text-ink transition-colors">
              Design Tokens
            </Link>
            <span className="font-mono">v0.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
