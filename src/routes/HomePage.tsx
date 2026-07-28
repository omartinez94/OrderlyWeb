/**
 * Orderly Home Page — public landing for unauthenticated visitors.
 *
 * Moved from `src/pages/HomePage.tsx` to `src/routes/HomePage.tsx`
 * as part of the routing foundation plan. Behavior is unchanged
 * except that:
 *   - `TooltipProvider`, `Toaster`, and `SignInDialogHost` are no
 *     longer mounted here; they are mounted once by `RootLayout`.
 *   - A small "Design system" link in the footer routes to
 *     `/showcase` so the design-system showcase is reachable from
 *     the marketing surface and back (browser back works).
 */

import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { StatusPill } from "../components/StatusPill/StatusPill";
import { Header } from "../components/Header/Header";
import {
  MOCK_CURRENT_USER,
  MOCK_NOTIFICATIONS,
  MOCK_RESTAURANTS,
} from "../components/Header/mockData";
import { toast } from "../components/ui/sonner";
import { Separator } from "../components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { SignInDialog } from "../components/SignInDialog/SignInDialog";
import { SignInBridgeTrigger } from "../components/SignInDialog/SignInBridgeTrigger";
import { useDialogBridge } from "../components/SignInDialog/useDialogBridge";
import { PATH } from "../router/pathNames";

const FAQ_ITEMS = [
  {
    q: "What does Orderly replace?",
    a: "Three fragmented tools — kitchen display, floor POS, and back-office console — become one role-aware app.",
  },
  {
    q: "How does live sync work?",
    a: "Updates travel on SignalR hubs. Nothing polls; every screen reads from the same source.",
  },
  {
    q: "How do invites work?",
    a: "Restaurant Admins invite staff from the back office. Permissions are derived from role, not granted manually.",
  },
] as const;

const GUEST_HEADER_PROPS = {
  zone: "admin" as const,
  currentRestaurantId: "r-001",
  restaurants: MOCK_RESTAURANTS,
  notifications: MOCK_NOTIFICATIONS,
  user: MOCK_CURRENT_USER,
};

export function HomePage() {
  return (
    <div className="bg-surface text-ink min-h-screen font-sans antialiased">
      <HomeHeader />
      <main id="main" className="bg-surface">
        <HeroSection />
        <WhyOrderlySection />
        <SignInSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function HomeHeader() {
  const [signInOpen, setSignInOpen] = useState(false);
  const openSignIn = (): void => setSignInOpen(true);
  useDialogBridge(openSignIn);

  return (
    <>
      <Header
        {...GUEST_HEADER_PROPS}
        onRestaurantChange={() => {
          toast.info("Restaurant switching lands with the auth slice.", {
            description: "Sign in to choose a restaurant.",
          });
        }}
        onNotificationClick={() => openSignIn()}
        onMarkAllRead={() => openSignIn()}
        onProfile={openSignIn}
        onLogout={openSignIn}
      />
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </>
  );
}

function HeroSection() {
  return (
    <section id="why" aria-labelledby="hero-heading" className="bg-surface relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 pt-16 pb-20 sm:pt-24 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:pt-32 lg:pb-32">
        <div className="lg:col-span-7">
          <Badge variant="secondary" className="mb-6 inline-flex">
            For restaurant teams
          </Badge>
          <h1
            id="hero-heading"
            className="text-primary font-display text-[clamp(2.5rem,5.6vw,4rem)] leading-[1.05] font-extrabold tracking-[-0.02em]"
          >
            One tool for the kitchen, the floor, and the back office.
          </h1>
          <p className="text-ink-muted mt-6 max-w-xl font-sans text-lg leading-relaxed">
            Orderly replaces three fragmented tools with one role-aware app. Every screen reads from
            the same source, so the same number lands on every screen at the same moment.
          </p>

          <SignInBridgeTrigger className="mt-10 inline-flex">
            <Button size="lg">Sign in to Orderly</Button>
          </SignInBridgeTrigger>
          <p className="text-ink-subtle mt-4 font-sans text-xs">
            Single sign-on for staff. Restaurant Admins provision roles from the back office.
          </p>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <aside className="lg:col-span-5" aria-hidden="true">
      <Card className="border-border-subtle bg-surface-elevated">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-primary font-display text-base font-bold">Order #1284</CardTitle>
            <StatusPill status="preparing" />
          </div>
          <CardDescription className="font-sans">Table 7 · 4 minutes elapsed</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-ink m-0 flex flex-col gap-2 p-0 font-sans text-sm">
            <li className="flex items-center justify-between">
              <span className="font-medium">Margherita</span>
              <span className="text-ink-muted text-xs">Pizza station</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">Caesar salad</span>
              <span className="text-ink-muted text-xs">Cold station</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">Tiramisu · ×2</span>
              <span className="text-ink-muted text-xs">Pastry</span>
            </li>
          </ul>
          <Separator className="my-4" />
          <div className="text-ink-muted flex items-center justify-between text-xs">
            <span>Same number, every screen.</span>
            <span className="font-mono tabular-nums">12 in motion</span>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

const PROMISE = [
  { id: "one", label: "One source of record", detail: "Three tools, one system." },
  { id: "live", label: "Live shared state", detail: "No polling. Sub-second." },
  { id: "role", label: "Role-aware", detail: "Eight roles. Three zones. One matrix." },
] as const;

function WhyOrderlySection() {
  return (
    <section aria-label="Why Orderly" className="bg-surface border-border-subtle border-y">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-12 lg:px-8">
        {PROMISE.map((p) => (
          <div key={p.id} className="flex items-baseline gap-3">
            <span className="text-ink-subtle font-mono text-xs tabular-nums">
              0{PROMISE.indexOf(p) + 1}
            </span>
            <div>
              <div className="text-primary font-display text-base leading-tight font-bold">
                {p.label}
              </div>
              <p className="text-ink-muted m-0 font-sans text-xs leading-relaxed">{p.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SignInSection() {
  return (
    <section id="signin" aria-labelledby="signin-heading" className="bg-surface">
      <div className="mx-auto w-full max-w-3xl px-5 py-20 sm:py-28 lg:px-8">
        <h2
          id="signin-heading"
          className="text-primary font-display text-3xl leading-tight font-bold tracking-[-0.01em] sm:text-4xl"
        >
          Sign in to Orderly.
        </h2>
        <p className="text-ink-muted mt-4 max-w-xl font-sans text-base leading-relaxed">
          Use your work email. New here? Ask a Restaurant Admin to invite you. Both paths are wired
          to the same `/login` endpoint.
        </p>

        <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <SignInBridgeTrigger>
            <Button size="lg">Open sign-in</Button>
          </SignInBridgeTrigger>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="lg">
                Keyboard shortcuts
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <kbd className="font-mono">⌘</kbd>+<kbd className="font-mono">K</kbd> opens command
              palette — search orders, staff, settings.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-surface border-border-subtle border-t">
      <div className="mx-auto w-full max-w-3xl px-5 py-20 sm:py-24 lg:px-8">
        <h2
          id="faq-heading"
          className="text-primary font-display text-3xl leading-tight font-bold tracking-[-0.01em] sm:text-4xl"
        >
          Common questions
        </h2>

        <Accordion type="single" collapsible className="mt-8">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="font-sans text-base">{item.q}</AccordionTrigger>
              <AccordionContent>
                <p className="text-ink-muted m-0 font-sans text-sm leading-relaxed">{item.a}</p>
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
    <footer aria-label="Site footer" className="bg-surface">
      <div className="border-border-subtle border-t">
        <div className="text-ink-subtle mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 font-sans text-xs sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© Orderly. Built for restaurants, by shift.</span>
          <SignInBridgeTrigger>
            <button
              type="button"
              className="hover:text-ink rounded-control focus-visible:outline-primary underline-offset-4 transition-colors hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Sign in
            </button>
          </SignInBridgeTrigger>
          <Link
            to={PATH.SHOWCASE}
            className="hover:text-ink rounded-control focus-visible:outline-primary underline-offset-4 transition-colors hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Design system
          </Link>
          <span className="font-mono tabular-nums">v0.0.0</span>
        </div>
      </div>
    </footer>
  );
}
