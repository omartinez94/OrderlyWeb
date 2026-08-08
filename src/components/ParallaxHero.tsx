import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SignInBridgeTrigger } from "./SignInDialog/SignInBridgeTrigger";
import { ArrowRight, ChefHat, Zap, Activity, Sparkles, Flame } from "lucide-react";

export function ParallaxHero() {
  const { t } = useTranslation("common");
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const midGlowRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [chips, setChips] = useState<{ id: string; delay: number }[]>([]);

  useEffect(() => {
    // Random number of chips between 2 and 4
    const count = 2 + Math.floor(Math.random() * 3);
    const newChips = Array.from({ length: count }, (_, i) => ({
      id: `chip-left-${i}`,
      delay: i * 1500, // staggered delay
    }));
    setChips(newChips);
  }, []);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        // Background image moves slowest — classic parallax
        if (bgRef.current) {
          bgRef.current.style.transform = `translateY(${scrollY * 0.45}px)`;
        }

        // Foreground chef+plate moves faster than bg — creates depth pop
        if (fgRef.current) {
          fgRef.current.style.transform = `translateY(${scrollY * 0.15}px)`;
        }

        // Mid gradient glow moves slightly faster
        if (midGlowRef.current) {
          midGlowRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        // Content scrolls out fastest — fades as user scrolls
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
          contentRef.current.style.opacity = `${Math.max(0, 1 - scrollY / 550)}`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      aria-label="Hero — Kitchen-to-Table parallax"
      className="border-border-subtle relative flex h-[92vh] min-h-[660px] w-full items-center justify-center overflow-hidden bg-black"
    >
      {/* ── Layer 1: Background Photo (moves slowest) ─────────────────── */}
      <div ref={bgRef} className="absolute inset-0 z-0 h-[130%] w-full will-change-transform">
        <img
          src="/images/parallax-hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-105 object-cover object-center brightness-90 filter"
        />
        {/* Dark gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-[ellipse_80%_70%_at_50%_50%] from-transparent via-black/20 to-black/60" />
      </div>

      {/* ── Layer 1.5: Foreground Chef + Plate ── */}
      <div
        ref={fgRef}
        className="pointer-events-none absolute inset-0 z-[5] h-[115%] w-full will-change-transform"
      >
        <img
          src="/images/parallax-hero-fg-greenscreen-cropped.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-[-5%] left-2/5 h-[95%] w-auto translate-x-1/2 object-contain object-bottom [mix-blend-mode:screen]"
        />
      </div>

      {/* ── Layer 2: Animated Ambient Glow Orbs ─────────────── */}
      <div
        ref={midGlowRef}
        className="pointer-events-none absolute inset-0 z-10 h-[120%] w-full will-change-transform"
      >
        {/* Pulsing Brand Glow Orbs */}
        <div className="bg-primary/30 absolute top-10 -left-32 h-96 w-96 animate-pulse rounded-full blur-[130px] duration-10000" />
        <div className="bg-accent/25 absolute -right-24 bottom-0 h-80 w-80 animate-pulse rounded-full blur-[120px] duration-7000" />
        <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/15 blur-[100px]" />
      </div>

      {/* ── Layer 3: Dynamic Floating Status Chips ── */}
      <div
        ref={chipsRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full will-change-transform"
      >
        {chips.map((chip, index) => (
          <FloatingChip
            key={chip.id}
            id={chip.id}
            index={index}
            total={chips.length}
            initialDelay={chip.delay}
          />
        ))}
      </div>

      {/* ── Layer 4: Hero Main Content ────────── */}
      <div
        ref={contentRef}
        className="relative z-30 mx-auto flex max-w-4xl flex-col items-center px-4 text-center will-change-transform sm:px-6 lg:px-8"
      >
        <Badge
          variant="outline"
          className="border-primary/40 hover:border-primary mb-6 inline-flex items-center gap-2 bg-black/50 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-white uppercase shadow-xl backdrop-blur-md transition-all hover:bg-black/70"
        >
          <Sparkles className="text-accent h-3.5 w-3.5 animate-spin duration-3000" />
          {t("home.hero.badge")}
        </Badge>

        <h1 className="font-display text-5xl leading-[1.05] font-extrabold tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
          {t("home.hero.titlePart1")}
          <br />
          <span className="bg-gradient-to-r from-[#4A8B98] via-[#7AB89E] to-[#F26A3A] bg-clip-text text-transparent">
            {t("home.hero.titlePart2")}
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed font-medium text-white/80 drop-shadow-md sm:text-lg">
          {t("home.hero.description")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <SignInBridgeTrigger>
            <Button
              id="hero-sign-in-btn"
              size="lg"
              className="group h-13 bg-white px-8 text-sm font-bold text-[#1F4254] shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              {t("home.hero.getStarted")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </SignInBridgeTrigger>
          <a href="#architecture">
            <Button
              id="hero-learn-more-btn"
              size="lg"
              variant="outline"
              className="h-13 border-white/30 px-8 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              {t("home.hero.exploreArchitecture")}
            </Button>
          </a>
        </div>

        {/* Live system indicators */}
        <div className="mt-10 flex items-center justify-center gap-6 font-mono text-xs text-white/60">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
            {t("home.hero.latencyHub")}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden items-center gap-1 sm:flex">
            <Flame className="text-accent h-3.5 w-3.5" /> {t("home.hero.microservicesCount")}
          </span>
          <span className="hidden sm:inline">•</span>
          <span>{t("home.hero.gatewayOnline")}</span>
        </div>
      </div>

      {/* Bottom gradient fade into page surface */}
      <div className="from-surface via-surface/60 pointer-events-none absolute inset-x-0 bottom-0 z-40 h-36 bg-gradient-to-t to-transparent" />
    </section>
  );
}

const MOCK_EVENTS = [
  {
    key: "kdsLive",
    Icon: Activity,
    color: "text-emerald-400",
    bg: "bg-emerald-400/20",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.3)]",
  },
  {
    key: "kitchenReady",
    Icon: ChefHat,
    color: "text-primary",
    bg: "bg-primary/20",
    glow: "shadow-[0_0_30px_rgba(31,66,84,0.5)]",
  },
  {
    key: "signalrHub",
    Icon: Activity,
    color: "text-accent",
    bg: "bg-accent/20",
    glow: "shadow-[0_0_30px_rgba(242,106,58,0.4)]",
  },
  {
    key: "realtimeSync",
    Icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-400/20",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.3)]",
  },
  {
    key: "orderReceived",
    Icon: Activity,
    color: "text-blue-400",
    bg: "bg-blue-400/20",
    glow: "shadow-[0_0_30px_rgba(96,165,250,0.3)]",
  },
];

function FloatingChip({
  id,
  index,
  total,
  initialDelay,
}: {
  id: string;
  index: number;
  total: number;
  initialDelay: number;
}) {
  const { t } = useTranslation("common");
  const [event, setEvent] = useState(MOCK_EVENTS[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: "0%" });

  useEffect(() => {
    let isMounted = true;
    let cycleTimeout: ReturnType<typeof setTimeout>;
    let hideTimeout: ReturnType<typeof setTimeout>;

    const cycle = () => {
      if (!isMounted) return;

      // Segment the vertical space to avoid overlaps (leaving space at the top and bottom)
      const segmentHeight = 72 / total;
      const minTop = 10 + index * segmentHeight;
      // Allow random variance within the segment, with a safety margin
      const topOffset = minTop + Math.random() * Math.max(5, segmentHeight - 12);

      setPosition({ top: `${topOffset}%` });

      const nextEvent = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      setEvent(nextEvent);
      setIsVisible(true);

      hideTimeout = setTimeout(
        () => {
          if (!isMounted) return;
          setIsVisible(false);
          cycleTimeout = setTimeout(cycle, 3500);
        },
        8000 + Math.random() * 3000,
      );
    };

    const initTimeout = setTimeout(cycle, initialDelay);
    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      clearTimeout(cycleTimeout);
      clearTimeout(hideTimeout);
    };
  }, [id, index, total, initialDelay]);

  const { key, Icon, color, bg, glow } = event;
  const titleKey = `home.hero.chips.${key}` as unknown as "home.hero.chips.kdsLive";
  const descKey = `home.hero.chips.${key}Desc` as unknown as "home.hero.chips.kdsLiveDesc";
  const title = t(titleKey);
  const desc = t(descKey);
  const style = {
    top: position.top,
    left: "5%",
  };

  const boxShadowValue = glow.replace(/^shadow-\[|\]$/g, "").replace(/_/g, " ");

  return (
    <>
      <style>{`
        @keyframes chip-in-${id} {
          from { transform: scale(0.8) translateY(10px); opacity: 0; box-shadow: none; }
          to   { transform: scale(1) translateY(0); opacity: 1; box-shadow: ${boxShadowValue}; }
        }
        @keyframes chip-out-${id} {
          from { transform: scale(1) translateY(0); opacity: 1; box-shadow: ${boxShadowValue}; }
          to   { transform: scale(0.8) translateY(-10px); opacity: 0; box-shadow: none; }
        }
      `}</style>
      <div
        style={{
          ...style,
          animation: isVisible
            ? `chip-in-${id} 1200ms cubic-bezier(0.16, 1, 0.3, 1) forwards`
            : `chip-out-${id} 1000ms ease-in-out forwards`,
        }}
        className="border-border-subtle absolute hidden items-center gap-3 rounded-2xl border bg-black/60 px-4 py-3 backdrop-blur-md transition-transform hover:scale-105 lg:flex"
      >
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white">{title}</p>
          <p className="font-mono text-xs text-white/60">{desc}</p>
        </div>
      </div>
    </>
  );
}
