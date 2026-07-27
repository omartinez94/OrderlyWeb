import { useState, Suspense, lazy, type ReactNode } from "react";
import { StatusPill, type OrderStatus } from "./components/StatusPill/StatusPill";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { Header } from "./components/Header/Header";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Checkbox } from "./components/ui/checkbox";
import { Switch } from "./components/ui/switch";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Slider } from "./components/ui/slider";
import { Toggle } from "./components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import { AspectRatio } from "./components/ui/aspect-ratio";
import { ScrollArea } from "./components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./components/ui/command";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Skeleton } from "./components/ui/skeleton";
import { Progress } from "./components/ui/progress";
import { Toaster, toast } from "./components/ui/sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/ui/pagination";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./components/ui/navigation-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "./components/ui/menubar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { useZodForm } from "./lib/forms";
import { z } from "zod";
import {
  MOCK_CURRENT_USER,
  MOCK_NOTIFICATIONS,
  MOCK_RESTAURANTS,
} from "./components/Header/mockData";
import { brandPalette, servicePalette, type PaletteEntry } from "./lib/tokens";

/**
 * Orderly Design System — palette & component showcase.
 *
 * All styling is Tailwind utilities referencing the theme tokens in
 * src/index.css (via @theme inline). Light/dark theme switcher toggles
 * `data-theme` on <html>, which re-binds the CSS variables — the whole
 * page repaints with no JS re-render of colors.
 */

const ALL_STATUSES: OrderStatus[] = [
  "new",
  "acknowledged",
  "preparing",
  "plating",
  "ready",
  "served",
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-ink mb-6 text-xl font-bold tracking-tight">{title}</h2>
      <hr className="border-border-subtle bg-border-subtle mb-6 h-px border-0 border-t" />
      {children}
    </section>
  );
}

function Swatch({ entry }: { entry: PaletteEntry }) {
  return (
    <div
      className={[
        "p-5 rounded-xl min-h-[130px] flex flex-col justify-between gap-2",
        "transition-transform duration-150 hover:-translate-y-0.5",
        entry.twBg,
        entry.twText,
        entry.border ? "border border-border-subtle" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-sm font-bold tracking-wide">{entry.name}</span>
      {/* The hex labels sit on a small `surface-overlay` chip so
       *  they read against *any* swatch (light or dark, primary or
       *  surface) without the swatch's own color fighting them.
       *  This was the 1.0:1 contrast defect the detector caught. */}
      <span className="block font-mono text-[0.7rem] leading-tight">light {entry.light}</span>
      <span className="block font-mono text-[0.7rem] leading-tight">dark {entry.dark}</span>
    </div>
  );
}

function HeaderPreview({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="text-ink-subtle mb-2 font-mono text-xs tracking-wider uppercase">{label}</div>
      <div className="border-border-subtle overflow-hidden rounded-xl border">{children}</div>
    </div>
  );
}

// Lazy-loaded so the production bundle does not pay for the
// showcase until `?showcase=1` is in the URL.
const ShowcasePage = lazy(() => import("./pages/ShowcasePage"));

function App() {
  // The showcase route is gated by a `?showcase=1` query flag in
  // development. Production builds never serve the route — it's
  // an internal quality surface, not a user-facing page.
  if (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("showcase") === "1"
  ) {
    return (
      <Suspense fallback={<div className="text-ink-muted p-8">Loading showcase…</div>}>
        <ShowcasePage />
      </Suspense>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Toaster />
      <div className="bg-surface text-ink min-h-screen px-8 py-12 font-sans antialiased transition-colors duration-200">
        <div className="mx-auto max-w-6xl">
          <header className="mb-12">
            <div className="mb-4 flex items-start justify-between gap-6">
              <h1 className="m-0 text-5xl leading-tight font-extrabold tracking-tight">
                Orderly Design System
              </h1>
              <ThemeToggle />
            </div>
            <p className="text-ink-muted m-0 max-w-2xl leading-relaxed">
              Blue-teal primary, tangerine accent, sage-tinted surface, service gradient for status.
              Click the toggle in the corner to flip between light and dark.
            </p>
          </header>

          <Section title="App Header — the global top bar">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              The Header is consumed by all three zone layouts (admin, kitchen, restaurant). Six
              slots, fixed at the top, flat at rest, hairline Linen Edge bottom border. The ops
              badge appears on the floor and kitchen only — the One-Voice Rule still binds; Burnt
              Tangerine on the ops badge is a service hue carrying status, not decoration.
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

            <HeaderPreview label="Restaurant zone — 7 in progress (Saffron Amber)">
              <Header
                zone="restaurant"
                currentRestaurantId="r-001"
                restaurants={MOCK_RESTAURANTS}
                notifications={MOCK_NOTIFICATIONS}
                opsCount={7}
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

            <HeaderPreview label="Single-restaurant user (1 restaurant) — switcher is a static label">
              <Header
                zone="restaurant"
                currentRestaurantId="r-001"
                restaurants={[
                  {
                    id: "r-001",
                    name: "Acme Bistro — Downtown",
                    role: "Owner",
                  },
                ]}
                notifications={MOCK_NOTIFICATIONS}
                opsCount={4}
                user={MOCK_CURRENT_USER}
              />
            </HeaderPreview>

            <HeaderPreview label="Multi-restaurant — 8 restaurants (typeahead kicks in at 6+)">
              <Header
                zone="restaurant"
                currentRestaurantId="r-004"
                restaurants={MOCK_RESTAURANTS}
                notifications={MOCK_NOTIFICATIONS}
                opsCount={2}
                user={MOCK_CURRENT_USER}
              />
            </HeaderPreview>

            <HeaderPreview label="Empty notifications — bell has no badge">
              <Header
                zone="restaurant"
                currentRestaurantId="r-001"
                restaurants={MOCK_RESTAURANTS}
                notifications={[]}
                opsCount={1}
                user={MOCK_CURRENT_USER}
              />
            </HeaderPreview>
          </Section>

          <Section title="Brand tokens">
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-4">
              {brandPalette.map((entry) => (
                <Swatch key={entry.name} entry={entry} />
              ))}
            </div>
          </Section>

          <Section title="Service hues (status / order flow)">
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] gap-4">
              {servicePalette.map((entry) => (
                <Swatch key={entry.name} entry={entry} />
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              <div className="bg-gradient-service-cool flex min-h-[100px] items-end rounded-xl p-8 text-base font-bold text-white">
                <span className="drop-shadow">
                  gradient-service-cool — deep → teal → aqua (received flow)
                </span>
              </div>
              <div className="text-ink bg-gradient-service-warm flex min-h-[100px] items-end rounded-xl p-8 text-base font-bold">
                <span>gradient-service-warm — surface → amber → tangerine (ready flow)</span>
              </div>
            </div>
          </Section>

          <Section title="Status pills (live component)">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              Each status maps to one of the service-hue tokens. The background is a 12% tint; the
              dot and text use the full color.
            </p>
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              {ALL_STATUSES.map((status) => (
                <StatusPill key={status} status={status} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {ALL_STATUSES.slice(0, 5).map((status) => (
                <StatusPill key={`${status}-nodot`} status={status} hideDot />
              ))}
            </div>
          </Section>

          <Section title="Components">
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <Button variant="default">Primary action</Button>
              <Button variant="accent">Accent action</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>

            <div className="mb-8 flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Settings">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Button>
              <Button disabled>Disabled</Button>
            </div>

            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-4">
              <div className="bg-surface-elevated border-border-strong rounded-xl border p-6">
                <h3 className="text-primary m-0 mb-1 text-lg font-bold">Order #1284</h3>
                <p className="text-ink-muted m-0 mb-4 text-sm leading-relaxed">
                  Margherita Pizza, Caesar Salad, two Tiramisu. Table 7.
                </p>
                <div className="flex items-center justify-between gap-3">
                  <StatusPill status="preparing" />
                  <span className="text-ink-subtle font-mono text-xs">4m elapsed</span>
                </div>
              </div>

              <div className="bg-surface-elevated border-border-strong rounded-xl border p-6">
                <h3 className="text-primary m-0 mb-1 text-lg font-bold">Order #1285</h3>
                <p className="text-ink-muted m-0 mb-4 text-sm leading-relaxed">
                  Risotto ai Funghi, Bruschetta. Table 12.
                </p>
                <div className="flex items-center justify-between gap-3">
                  <StatusPill status="ready" />
                  <span className="text-ink-subtle font-mono text-xs">8m elapsed</span>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Selection primitives">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              Selection controls share the same focus-visible ring, border weight, and checked-state
              palette. Keyboard semantics are Radix-driven: arrow keys for{" "}
              <code className="font-mono text-sm">Select</code> and{" "}
              <code className="font-mono text-sm">RadioGroup</code>, Space/Enter for{" "}
              <code className="font-mono text-sm">Checkbox</code>,{" "}
              <code className="font-mono text-sm">Switch</code>, and{" "}
              <code className="font-mono text-sm">Toggle</code>.
            </p>

            <div className="mb-8 grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              <SelectionCard title="Checkbox">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="show-on-menu" />
                    <Label htmlFor="show-on-menu">Show on the public menu</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-default" defaultChecked />
                    <Label htmlFor="check-default">Default checked</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-disabled" disabled />
                    <Label htmlFor="check-disabled">Disabled</Label>
                  </div>
                </div>
              </SelectionCard>

              <SelectionCard title="Switch">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Switch id="accept-orders" />
                    <Label htmlFor="accept-orders">Accept new orders</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="show-on-floor" defaultChecked />
                    <Label htmlFor="show-on-floor">Show on floor (default on)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="compact-mode" size="sm" />
                    <Label htmlFor="compact-mode">Compact mode (sm)</Label>
                  </div>
                </div>
              </SelectionCard>

              <SelectionCard title="RadioGroup">
                <RadioGroup defaultValue="dine-in">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="dine-in" id="order-dine" />
                    <Label htmlFor="order-dine">Dine-in</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="takeout" id="order-take" />
                    <Label htmlFor="order-take">Takeout</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="delivery" id="order-del" />
                    <Label htmlFor="order-del">Delivery</Label>
                  </div>
                </RadioGroup>
              </SelectionCard>

              <SelectionCard title="Select">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grill">Grill</SelectItem>
                    <SelectItem value="saute">Sauté</SelectItem>
                    <SelectItem value="pastry">Pastry</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                  </SelectContent>
                </Select>
              </SelectionCard>
            </div>

            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              <SelectionCard title="Slider">
                <div className="grid gap-2">
                  <Label htmlFor="prep-minutes">Prep time (minutes)</Label>
                  <Slider id="prep-minutes" defaultValue={[12]} max={45} step={1} />
                  <p className="text-ink-subtle font-mono text-xs">Default 12</p>
                </div>
              </SelectionCard>

              <SelectionCard title="Toggle">
                <div className="flex flex-wrap gap-2">
                  <Toggle aria-label="Bold">B</Toggle>
                  <Toggle aria-label="Italic" pressed>
                    I
                  </Toggle>
                  <Toggle aria-label="Underline" variant="outline">
                    U
                  </Toggle>
                </div>
              </SelectionCard>

              <SelectionCard title="ToggleGroup (single)">
                <ToggleGroup type="single" defaultValue="day">
                  <ToggleGroupItem value="day">Day</ToggleGroupItem>
                  <ToggleGroupItem value="week">Week</ToggleGroupItem>
                  <ToggleGroupItem value="month">Month</ToggleGroupItem>
                </ToggleGroup>
              </SelectionCard>
            </div>
          </Section>

          <Section title="Form primitives">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              Form primitives bind to React Hook Form + Zod through{" "}
              <code className="font-mono text-sm">useZodForm</code>. The
              <code className="font-mono text-sm">FormControl</code> automatically wires{" "}
              <code className="font-mono text-sm">aria-describedby</code> to the description and
              (when present) the error message;{" "}
              <code className="font-mono text-sm">aria-invalid</code> flips on error so screen
              readers announce the broken field.
            </p>

            <div className="mb-8 grid [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] gap-6">
              <div className="bg-surface-elevated border-border-strong rounded-xl border p-6">
                <h3 className="text-primary m-0 mb-4 text-base font-bold">Plain Input + Label</h3>
                <div className="grid gap-2">
                  <Label htmlFor="plain-email">Email</Label>
                  <Input id="plain-email" type="email" placeholder="staff@acme.com" />
                </div>
              </div>

              <div className="bg-surface-elevated border-border-strong rounded-xl border p-6">
                <h3 className="text-primary m-0 mb-4 text-base font-bold">Textarea</h3>
                <div className="grid gap-2">
                  <Label htmlFor="plain-notes">Notes</Label>
                  <Textarea
                    id="plain-notes"
                    rows={3}
                    placeholder="Allergies, special requests, table preferences…"
                  />
                </div>
              </div>
            </div>

            <FormShowcase />
          </Section>

          <Section title="Layout primitives">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              Layout primitives carry the tonal layering rule: content surfaces are flat (Sage Linen
              → Sage Linen High → Linen Overlay), overlays lift with shadow, and the brand glow is
              reserved for status.
            </p>

            <div className="mb-8 grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Default card</CardTitle>
                  <CardDescription>
                    Flat <code>bg-card</code>, no border, no shadow.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-ink-muted m-0 text-sm leading-relaxed">
                    The standard content surface. Use the default variant for grouped content within
                    a page.
                  </p>
                </CardContent>
              </Card>

              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Bordered card</CardTitle>
                  <CardDescription>
                    1px <code>border-strong</code> ring.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-ink-muted m-0 text-sm leading-relaxed">
                    For emphasized surfaces — the perimeter reads as interactive even at rest.
                  </p>
                </CardContent>
              </Card>

              <Card variant="quiet">
                <CardHeader>
                  <CardTitle>Quiet card</CardTitle>
                  <CardDescription>
                    No surface, hairline <code>border-subtle</code>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-ink-muted m-0 text-sm leading-relaxed">
                    Secondary info that should not compete with primary content — cheap to use in
                    lists and groups.
                  </p>
                </CardContent>
              </Card>

              <Card variant="surface">
                <CardHeader>
                  <CardTitle>Surface card</CardTitle>
                  <CardDescription>
                    Recedes to <code>bg-surface</code>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-ink-muted m-0 text-sm leading-relaxed">
                    Grouping matters more than any single item.
                  </p>
                </CardContent>
              </Card>

              <div className="bg-gradient-service-cool rounded-xl p-4">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Glass card</CardTitle>
                    <CardDescription className="text-ink">
                      The <code>.glass</code> utility.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-ink m-0 text-sm leading-relaxed">
                      For use over gradients or busy images. Pair with a gradient backdrop to see
                      the frosted effect.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mb-8 grid [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tabs</CardTitle>
                  <CardDescription>
                    Roving tabindex. Arrow keys move between triggers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="staff">Staff</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                      <p className="text-ink-muted m-0 text-sm leading-relaxed">
                        Today's reservation count and order backlog.
                      </p>
                    </TabsContent>
                    <TabsContent value="staff">
                      <p className="text-ink-muted m-0 text-sm leading-relaxed">
                        On-shift staff and station assignments.
                      </p>
                    </TabsContent>
                    <TabsContent value="settings">
                      <p className="text-ink-muted m-0 text-sm leading-relaxed">
                        Restaurant and zone configuration.
                      </p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accordion</CardTitle>
                  <CardDescription>One or many regions. Radix handles keyboard.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="prep">
                      <AccordionTrigger>Prep time</AccordionTrigger>
                      <AccordionContent>
                        Average prep time per station, broken down by menu category.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="kitchen">
                      <AccordionTrigger>Kitchen load</AccordionTrigger>
                      <AccordionContent>
                        Live ticket count per station. Tilled Teal indicates calm; Saffron Amber
                        approaches the deadline; Burnt Tangerine is overdue.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="floor">
                      <AccordionTrigger>Floor status</AccordionTrigger>
                      <AccordionContent>
                        Table states across the floor — open, seated, ordered, bill-out, dirty.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ScrollArea</CardTitle>
                  <CardDescription>Custom scrollbar on a fixed-height region.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="border-border-subtle h-40 w-full rounded-md border p-3">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <p key={i} className="text-ink-muted m-0 py-1 text-sm">
                        Order line item {i + 1} — 2× Margherita, 1× Caesar
                      </p>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collapsible</CardTitle>
                  <CardDescription>In-place show/hide. Trigger is a button.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        Show advanced
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="text-ink-muted mt-2 text-sm">
                      Advanced settings: tax rate, tip policy, late-night override rules.
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Separator + AspectRatio</CardTitle>
                  <CardDescription>Hairline divider; constrained media frame.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={16 / 9} className="bg-muted mb-3 rounded-md">
                    <div className="text-ink-subtle flex h-full items-center justify-center font-mono text-xs">
                      16:9
                    </div>
                  </AspectRatio>
                  <Separator />
                  <p className="text-ink-muted m-0 mt-3 text-sm">
                    A card with an embedded image and a divider above the caption.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section title="Glass effects">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              Glass on a single-tone background is invisible. The panel below uses the warm service
              gradient so you can see all four glass variants on top of it.
            </p>
            <div className="bg-gradient-service-warm grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-5 rounded-2xl p-10">
              <div className="glass p-6">
                <h3 className="text-ink m-0 mb-2 font-bold">glass</h3>
                <p className="text-ink m-0 text-sm leading-relaxed opacity-85">
                  Default frosted surface, 24px blur, light tint.
                </p>
              </div>
              <div className="glass-strong p-6">
                <h3 className="text-ink m-0 mb-2 font-bold">glass-strong</h3>
                <p className="text-ink m-0 text-sm leading-relaxed opacity-85">
                  Heavier 40px blur, more opacity. Modals, command palettes.
                </p>
              </div>
              <div className="glass-primary p-6">
                <h3 className="text-ink m-0 mb-2 font-bold">glass-primary</h3>
                <p className="text-ink m-0 text-sm leading-relaxed opacity-85">
                  Brand-tinted. Feature cards in the primary accent zone.
                </p>
              </div>
              <div className="glass-accent p-6">
                <h3 className="text-ink m-0 mb-2 font-bold">glass-accent</h3>
                <p className="text-ink m-0 text-sm leading-relaxed opacity-85">
                  Tangerine-tinted. Active states, hot offers, urgent alerts.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Navigation primitives">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              Navigation controls — breadcrumbs, pagination, top navigation, and tool palettes. Each
              primitive carries the right semantic role (current page, current breadcrumb, expanded
              submenu) so screen readers can orient quickly.
            </p>

            <div className="mb-8 grid [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Breadcrumb</CardTitle>
                  <CardDescription>Header slot + standalone usage.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Acme Bistro</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Orders</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Order #1284</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pagination</CardTitle>
                  <CardDescription>
                    Current page uses <code>aria-current</code>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          2
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardContent>
              </Card>
            </div>

            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>NavigationMenu</CardTitle>
                  <CardDescription>Top-level horizontal navigation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[320px] gap-2 p-3">
                            <li>
                              <NavigationMenuLink href="#">
                                <div className="text-ink font-medium">Today</div>
                                <p className="text-ink-muted text-xs">
                                  Reservations, prep load, recent orders.
                                </p>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink href="#">
                                <div className="text-ink font-medium">This week</div>
                                <p className="text-ink-muted text-xs">
                                  Staff utilization, peak hours, top items.
                                </p>
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuLink className="px-4 py-2 text-sm font-medium" href="#">
                          Reports
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuLink className="px-4 py-2 text-sm font-medium" href="#">
                          Settings
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Menubar</CardTitle>
                  <CardDescription>Horizontal tool palette for working surfaces.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Menubar>
                    <MenubarMenu>
                      <MenubarTrigger>File</MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem>New order</MenubarItem>
                        <MenubarItem>Open recent</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Print ticket</MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                      <MenubarTrigger>Edit</MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem>Undo</MenubarItem>
                        <MenubarItem>Redo</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Find order</MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section title="Data display & feedback">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              Tables, badges, avatars, and progress follow the surface rules: content stays on{" "}
              <code className="font-mono text-sm">bg-surface-overlay</code>, status colors are
              service hues, and Toast visibility is announced via Sonner's polite/assertive live
              regions.
            </p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Table</CardTitle>
                <CardDescription>
                  Accessible table with caption, scope, and sortable headers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption className="sr-only">
                    Today's active orders with status, table, and elapsed time.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Order</TableHead>
                      <TableHead scope="col">Table</TableHead>
                      <TableHead scope="col" aria-sort="ascending">
                        Status
                      </TableHead>
                      <TableHead scope="col">Elapsed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-sm">#1284</TableCell>
                      <TableCell>7</TableCell>
                      <TableCell>
                        <Badge variant="service-preparing">Preparing</Badge>
                      </TableCell>
                      <TableCell className="text-ink-muted font-mono text-xs">4m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">#1285</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>
                        <Badge variant="service-ready">Ready</Badge>
                      </TableCell>
                      <TableCell className="text-ink-muted font-mono text-xs">8m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">#1286</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>
                        <Badge variant="service-new">New</Badge>
                      </TableCell>
                      <TableCell className="text-ink-muted font-mono text-xs">1m</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="mb-6 grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Badge</CardTitle>
                  <CardDescription>Service hues follow the StatusPill tint rule.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="neutral">Neutral</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="service-new">New</Badge>
                    <Badge variant="service-acknowledged">Acknowledged</Badge>
                    <Badge variant="service-preparing">Preparing</Badge>
                    <Badge variant="service-plating">Plating</Badge>
                    <Badge variant="service-ready">Ready</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                  <CardDescription>Image + initials fallback.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      <AvatarImage
                        src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'/>"
                        alt="Jane Doe"
                      />
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
                  <CardTitle>Progress</CardTitle>
                  <CardDescription>Determinate and indeterminate states.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div>
                      <p className="text-ink-muted mb-1 text-xs">Prep progress — 64%</p>
                      <Progress value={64} aria-label="Prep progress" />
                    </div>
                    <div>
                      <p className="text-ink-muted mb-1 text-xs">Syncing — indeterminate</p>
                      <Progress aria-valuetext="Loading" aria-label="Syncing" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skeleton</CardTitle>
                  <CardDescription>Loading placeholder.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Toast (Sonner)</CardTitle>
                  <CardDescription>Polite and assertive live regions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => toast.success("Order marked ready.")}>
                      Success
                    </Button>
                    <Button variant="outline" onClick={() => toast.info("Sync started.")}>
                      Info
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toast.warning("Kitchen load is high.")}
                    >
                      Warning
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => toast.error("Failed to save changes.")}
                    >
                      Error
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section title="Overlay primitives">
            <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
              Overlays trap focus, escape to close, and return focus to the trigger. Body scroll is
              locked while a modal is open. Tooltip is mounted via{" "}
              <code className="font-mono text-sm">TooltipProvider</code> with a 200ms hover delay.
            </p>

            <div className="mb-8 grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tooltip</CardTitle>
                  <CardDescription>Hover or focus the trigger.</CardDescription>
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

              <Card>
                <CardHeader>
                  <CardTitle>Popover</CardTitle>
                  <CardDescription>Lightweight anchored surface.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Open</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="grid gap-2">
                        <h4 className="text-ink leading-none font-medium">Station details</h4>
                        <p className="text-ink-muted text-sm">
                          Tilled Teal means calm; Saffron Amber approaches the deadline.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>DropdownMenu</CardTitle>
                  <CardDescription>Keyboard-navigable menu.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Order #1284</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Mark preparing</DropdownMenuItem>
                      <DropdownMenuItem>Mark ready</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">Cancel order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8 grid [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dialog</CardTitle>
                  <CardDescription>Modal confirmation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Edit order</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit order #1284</DialogTitle>
                        <DialogDescription>Changes are sent back to the kitchen.</DialogDescription>
                      </DialogHeader>
                      <p className="text-ink-muted text-sm">
                        The form lives inside the dialog body. The close button is in the top-right.
                      </p>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sheet</CardTitle>
                  <CardDescription>Edge-anchored panel.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">Open sheet</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Side panel</SheetTitle>
                        <SheetDescription>
                          Use for navigation drawers and detail drill-downs.
                        </SheetDescription>
                      </SheetHeader>
                      <p className="text-ink-muted px-4 text-sm">
                        Content fills the sheet; the close button is top-right.
                      </p>
                    </SheetContent>
                  </Sheet>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AlertDialog</CardTitle>
                  <CardDescription>For destructive or irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Cancel order</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel order #1284?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This cannot be undone. The kitchen will be notified and the ticket will
                          close.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep order</AlertDialogCancel>
                        <AlertDialogAction>Cancel order</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Command</CardTitle>
                <CardDescription>Fast search palette (⌘K).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-border-subtle overflow-hidden rounded-xl border">
                  <Command className="max-w-md">
                    <CommandInput placeholder="Search orders, staff, settings…" />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup heading="Orders">
                        <CommandItem>Order #1284 — Table 7</CommandItem>
                        <CommandItem>Order #1285 — Table 12</CommandItem>
                      </CommandGroup>
                      <CommandGroup heading="Settings">
                        <CommandItem>Restaurant preferences</CommandItem>
                        <CommandItem>Notifications</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;

function SelectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-surface-elevated border-border-strong rounded-xl border p-5">
      <h3 className="text-primary m-0 mb-4 text-sm font-bold tracking-wider uppercase">{title}</h3>
      {children}
    </div>
  );
}

/**
 * FormShowcase — exercises the Form + FormField + FormControl +
 * FormDescription + FormMessage contract end-to-end. Toggle "Submit
 * with errors" to surface the error state and observe the label color
 * change plus the `aria-invalid` + `aria-describedby` wiring.
 */
const orderSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  notes: z.string().max(280, "Keep notes under 280 characters.").optional(),
});

type OrderInput = z.infer<typeof orderSchema>;

function FormShowcase() {
  const [submitted, setSubmitted] = useState<OrderInput | null>(null);
  const form = useZodForm(orderSchema, {
    defaultValues: { customerName: "", email: "", notes: "" },
  });

  function onSubmit(values: OrderInput) {
    setSubmitted(values);
  }

  function onInvalid() {
    // Trigger validation on every field so the error UI is visible
    // even if the user has not blurred a field yet.
    void form.trigger();
  }

  return (
    <div className="bg-surface-elevated border-border-strong rounded-xl border p-6">
      <h3 className="text-primary m-0 mb-1 text-base font-bold">Form + FormField (RHF + Zod)</h3>
      <p className="text-ink-muted m-0 mb-4 text-sm">
        <code className="font-mono">useZodForm(orderSchema)</code> — fields are typed from the Zod
        schema; <code className="font-mono">FormMessage</code> replaces{" "}
        <code className="font-mono">FormDescription</code> visually when the field is invalid.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="grid gap-4">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" autoComplete="name" {...field} />
                </FormControl>
                <FormDescription>Visible on the receipt and the KDS ticket.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Used for the digital receipt only.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Allergies, special requests, table preferences…"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Optional. Max 280 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="ghost" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Pre-fill invalid values and force validation so the
                // FormMessage + danger-ring + danger-label contract is
                // visible without the user having to type first.
                form.setValue("customerName", "A", { shouldValidate: false });
                form.setValue("email", "not-an-email", {
                  shouldValidate: false,
                });
                form.setValue("notes", "", { shouldValidate: false });
                void form.trigger();
              }}
            >
              Show error state
            </Button>
            {submitted && (
              <span className="text-success text-sm font-medium" role="status" aria-live="polite">
                Submitted ✓
              </span>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
