/**
 * ShowcasePage — the design-system visual contract.
 *
 * Moved from `src/pages/ShowcasePage.tsx` and adapted for routing:
 *   - Adds a "Back to home" button in the header so visitors can
 *     return to the marketing landing without typing the URL.
 *   - Browser back button also lands on `/home`, since the route
 *     tree preserves history.
 *
 * This is a curated subset of the original showcase — the full
 * primitive gallery (every base component, every layout variant)
 * lives in the pre-routing foundation `App.tsx`. The routing
 * foundation just needs a back-link and enough surface to verify
 * the `/showcase` route renders under lazy loading.
 */

import { type ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Toaster } from "../components/ui/sonner";
import { StatusPill } from "../components/StatusPill/StatusPill";
import { ThemeToggle } from "../components/ThemeToggle/ThemeToggle";
import { Header } from "../components/Header/Header";
import {
  MOCK_CURRENT_USER,
  MOCK_NOTIFICATIONS,
  MOCK_RESTAURANTS,
} from "../components/Header/mockData";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-ink mb-6 text-xl font-bold tracking-tight">{title}</h2>
      <hr className="border-border-subtle bg-border-subtle mb-6 h-px border-0 border-t" />
      {children}
    </section>
  );
}

function HeaderPreview({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="text-ink-subtle mb-2 font-mono text-xs tracking-wider uppercase">
        {label}
      </div>
      <div className="border-border-subtle overflow-hidden rounded-xl border">{children}</div>
    </div>
  );
}

export function ShowcasePage() {
  return (
    <TooltipProvider delayDuration={200}>
      <Toaster />
      <div className="bg-surface text-ink min-h-screen px-8 py-12 font-sans antialiased transition-colors duration-200">
        <div className="mx-auto max-w-6xl">
          <header className="mb-12">
            <div className="mb-4 flex items-start justify-between gap-6">
              <div>
                <h1 className="m-0 text-5xl leading-tight font-extrabold tracking-tight">
                  Base Component Library
                </h1>
                <p className="text-ink-muted m-0 mt-3 max-w-2xl leading-relaxed">
                  The visual contract for every primitive in the Orderly design system. Each block
                  is the live component, themed to the Orderly tokens.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/home">Back to home</Link>
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <Section title="App Header — the global top bar">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              The Header is consumed by all three zone layouts (admin, kitchen, restaurant). Six
              slots, fixed at the top, flat at rest, hairline Linen Edge bottom border.
            </p>

            <HeaderPreview label="Admin zone — no ops badge, 3 notifications">
              <Header
                zone="admin"
                currentRestaurantId="r-001"
                restaurants={MOCK_RESTAURANTS}
                notifications={MOCK_NOTIFICATIONS}
                user={MOCK_CURRENT_USER}
              />
            </HeaderPreview>

            <HeaderPreview label="Restaurant zone — 3 in progress (neutral)">
              <Header
                zone="restaurant"
                currentRestaurantId="r-001"
                restaurants={MOCK_RESTAURANTS}
                notifications={MOCK_NOTIFICATIONS}
                opsCount={3}
                user={MOCK_CURRENT_USER}
              />
            </HeaderPreview>

            <HeaderPreview label="Kitchen zone — 12 in kitchen (Burnt Tangerine)">
              <Header
                zone="kitchen"
                currentRestaurantId="r-001"
                restaurants={MOCK_RESTAURANTS}
                notifications={MOCK_NOTIFICATIONS}
                opsCount={12}
                user={MOCK_CURRENT_USER}
              />
            </HeaderPreview>
          </Section>

          <Section title="Status pills (live component)">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              Each status maps to one of the service-hue tokens. The background is a 12% tint; the
              dot and text use the full color.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusPill status="new" />
              <StatusPill status="acknowledged" />
              <StatusPill status="preparing" />
              <StatusPill status="plating" />
              <StatusPill status="ready" />
              <StatusPill status="served" />
            </div>
          </Section>

          <Section title="Primitives — sample">
            <div className="mb-6 grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="default">Primary</Button>
                    <Button variant="accent">Accent</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avatars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <Avatar size="sm">
                      <AvatarFallback>CK</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tooltip</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>Station prep time, today.</TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            </div>
          </Section>
        </div>
      </div>
    </TooltipProvider>
  );
}
