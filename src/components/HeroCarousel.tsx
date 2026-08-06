import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "./ui/carousel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { SignInBridgeTrigger } from "./SignInDialog/SignInBridgeTrigger";
import { ChevronRight, ShieldCheck, Zap, Layers, Sparkles } from "lucide-react";

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  highlight: string;
  icon: React.ComponentType<{ className?: string }>;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "platform",
    badge: "Enterprise Hospitality Platform",
    title: "One unified OS for your kitchen, floor & back office",
    description:
      "Orderly eliminates legacy POS fragmentation. A single role-aware platform keeping every station perfectly synchronized in real time.",
    image: "/images/01-welcome-hero.jpg",
    highlight: "Sub-second live sync across all devices",
    icon: Zap,
  },
  {
    id: "kds",
    badge: "Smart Kitchen Display System",
    title: "Calm ticket routing with dynamic status gradients",
    description:
      "Color-coded urgency algorithms move orders smoothly from teal prep states to tangerine service alerts so line cooks stay focused.",
    image: "/images/03-kds-mockup.jpg",
    highlight: "Reduces ticket prep times by up to 28%",
    icon: Layers,
  },
  {
    id: "staff",
    badge: "Role-Aware Governance",
    title: "Multi-zone access controls for staff & management",
    description:
      "SuperAdmin, Kitchen Manager, Waiter, and Cashier zones automatically adapt interfaces based on staff duties and active shifts.",
    image: "/images/04-staff-management.jpg",
    highlight: "8 granular roles built into 3 core zones",
    icon: ShieldCheck,
  },
  {
    id: "split",
    badge: "Next-Gen POS & Billing",
    title: "Frictionless checkout and instant bill splitting",
    description:
      "Empower waitstaff to split complex checks by seat or item with real-time recalculation and zero waiting time at the terminal.",
    image: "/images/04-split-bill.jpg",
    highlight: "Instant Redis-backed basket calculation",
    icon: Sparkles,
  },
];

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play timer
  React.useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="relative w-full overflow-hidden bg-surface pb-12 pt-6 lg:pb-20 lg:pt-10">
      {/* Background ambient lighting glow */}
      <div 
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--color-primary, #1F4254) 0%, var(--color-accent, #F26A3A) 100%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {HERO_SLIDES.map((slide) => {
              const Icon = slide.icon;
              return (
                <CarouselItem key={slide.id} className="w-full">
                  <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12 py-4">
                    {/* Text Column */}
                    <div className="flex flex-col justify-center lg:col-span-6 text-left space-y-6">
                      <div>
                        <Badge
                          variant="outline"
                          className="inline-flex items-center gap-2 border-border-strong bg-surface-elevated px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-xs"
                        >
                          <Icon className="h-3.5 w-3.5 text-accent" />
                          {slide.badge}
                        </Badge>
                      </div>

                      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.08]">
                        {slide.title}
                      </h1>

                      <p className="max-w-2xl font-sans text-lg leading-relaxed text-ink-muted sm:text-xl">
                        {slide.description}
                      </p>

                      {/* Highlight pill */}
                      <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated/70 p-3 backdrop-blur-sm w-fit">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Zap className="h-4 w-4" />
                        </div>
                        <span className="font-sans text-sm font-medium text-ink">
                          {slide.highlight}
                        </span>
                      </div>

                      {/* CTAs */}
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <SignInBridgeTrigger>
                          <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-md transition-all hover:scale-[1.02]">
                            Sign in to Platform
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </SignInBridgeTrigger>
                        
                        <a href="#features">
                          <Button variant="outline" size="lg" className="h-12 border-border-strong text-base font-medium hover:bg-surface-elevated">
                            Explore Capabilities
                          </Button>
                        </a>
                      </div>
                    </div>

                    {/* Image / Jumbotron Preview Column */}
                    <div className="relative lg:col-span-6">
                      <div className="group relative overflow-hidden rounded-2xl border border-border-strong bg-surface-elevated shadow-2xl transition-all hover:shadow-3xl">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="h-[360px] sm:h-[450px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                        
                        {/* Slide Caption Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <p className="font-display text-lg font-bold text-white shadow-sm">
                            {slide.badge}
                          </p>
                          <p className="font-sans text-xs text-gray-200 opacity-90">
                            Orderly Multi-zone Architecture
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Controls & Pagination */}
          <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-6">
            {/* Custom Dot Indicators */}
            <div className="flex items-center gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    current === index
                      ? "w-8 bg-primary"
                      : "w-2.5 bg-border-strong hover:bg-ink-subtle"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="relative flex items-center gap-2">
              <CarouselPrevious className="static translate-y-0 h-9 w-9 border-border-strong hover:bg-surface-elevated" />
              <CarouselNext className="static translate-y-0 h-9 w-9 border-border-strong hover:bg-surface-elevated" />
            </div>
          </div>
        </Carousel>
      </div>
    </div>
  );
}
