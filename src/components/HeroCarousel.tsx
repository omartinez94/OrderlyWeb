import * as React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("common");
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

  const translatedSlides = HERO_SLIDES.map((slide) => {
    const badgeKey =
      `home.carousel.slides.${slide.id}.badge` as unknown as "home.carousel.slides.platform.badge";
    const titleKey =
      `home.carousel.slides.${slide.id}.title` as unknown as "home.carousel.slides.platform.title";
    const descKey =
      `home.carousel.slides.${slide.id}.description` as unknown as "home.carousel.slides.platform.description";
    const highlightKey =
      `home.carousel.slides.${slide.id}.highlight` as unknown as "home.carousel.slides.platform.highlight";
    return {
      ...slide,
      badge: t(badgeKey),
      title: t(titleKey),
      description: t(descKey),
      highlight: t(highlightKey),
    };
  });

  return (
    <div className="bg-surface relative w-full overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-20">
      {/* Background ambient lighting glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary, #1F4254) 0%, var(--color-accent, #F26A3A) 100%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {translatedSlides.map((slide) => {
              const Icon = slide.icon;
              return (
                <CarouselItem key={slide.id} className="w-full">
                  <div className="grid grid-cols-1 items-center gap-8 py-4 lg:grid-cols-12 lg:gap-12">
                    {/* Text Column */}
                    <div className="flex flex-col justify-center space-y-6 text-left lg:col-span-6">
                      <div>
                        <Badge
                          variant="outline"
                          className="border-border-strong bg-surface-elevated text-primary inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wider uppercase shadow-xs"
                        >
                          <Icon className="text-accent h-3.5 w-3.5" />
                          {slide.badge}
                        </Badge>
                      </div>

                      <h1 className="font-display text-ink text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        {slide.title}
                      </h1>

                      <p className="text-ink-muted max-w-2xl font-sans text-lg leading-relaxed sm:text-xl">
                        {slide.description}
                      </p>

                      {/* Highlight pill */}
                      <div className="border-border-subtle bg-surface-elevated/70 flex w-fit items-center gap-3 rounded-lg border p-3 backdrop-blur-sm">
                        <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full">
                          <Zap className="h-4 w-4" />
                        </div>
                        <span className="text-ink font-sans text-sm font-medium">
                          {slide.highlight}
                        </span>
                      </div>

                      {/* CTAs */}
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <SignInBridgeTrigger>
                          <Button
                            size="lg"
                            className="h-12 px-8 text-base font-semibold shadow-md transition-all hover:scale-[1.02]"
                          >
                            {t("home.carousel.signIn")}
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </SignInBridgeTrigger>

                        <a href="#features">
                          <Button
                            variant="outline"
                            size="lg"
                            className="border-border-strong hover:bg-surface-elevated h-12 text-base font-medium"
                          >
                            {t("home.carousel.explore")}
                          </Button>
                        </a>
                      </div>
                    </div>

                    {/* Image / Jumbotron Preview Column */}
                    <div className="relative lg:col-span-6">
                      <div className="group border-border-strong bg-surface-elevated hover:shadow-3xl relative overflow-hidden rounded-2xl border shadow-2xl transition-all">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="h-[360px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[450px]"
                        />
                        {/* Gradient overlay */}
                        <div className="from-ink/60 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

                        {/* Slide Caption Overlay */}
                        <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                          <p className="font-display text-lg font-bold text-white shadow-sm">
                            {slide.badge}
                          </p>
                          <p className="font-sans text-xs text-gray-200 opacity-90">
                            {t("home.carousel.slideCaption")}
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
          <div className="border-border-subtle mt-6 flex items-center justify-between border-t pt-6">
            {/* Custom Dot Indicators */}
            <div className="flex items-center gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    current === index
                      ? "bg-primary w-8"
                      : "bg-border-strong hover:bg-ink-subtle w-2.5"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="relative flex items-center gap-2">
              <CarouselPrevious className="border-border-strong hover:bg-surface-elevated static h-9 w-9 translate-y-0" />
              <CarouselNext className="border-border-strong hover:bg-surface-elevated static h-9 w-9 translate-y-0" />
            </div>
          </div>
        </Carousel>
      </div>
    </div>
  );
}
