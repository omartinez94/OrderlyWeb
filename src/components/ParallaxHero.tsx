import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SignInBridgeTrigger } from "./SignInDialog/SignInBridgeTrigger";
import { ArrowRight, ChefHat, Zap, Activity } from "lucide-react";

export function ParallaxHero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const midGlowRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

        // Mid gradient glow moves slightly faster
        if (midGlowRef.current) {
          midGlowRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        // Floating status chips move at medium speed
        if (chipsRef.current) {
          chipsRef.current.style.transform = `translateY(${scrollY * 0.2}px)`;
        }

        // Content scrolls out fastest — fades as user scrolls
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${scrollY * 0.6}px)`;
          contentRef.current.style.opacity = `${Math.max(0, 1 - scrollY / 500)}`;
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
      className="border-border-subtle relative flex h-[92vh] min-h-[640px] w-full items-center justify-center overflow-hidden border-b bg-black"
    >
      {/* ── Layer 1: Background Photo (moves slowest) ─────────────────── */}
      <div ref={bgRef} className="absolute inset-0 z-0 h-[130%] w-full will-change-transform">
        <img
          src="/images/parallax-hero-main.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        {/* Dark gradient from bottom to ensure text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-radial-[ellipse_80%_70%_at_50%_50%] from-transparent to-black/40" />
      </div>

      {/* ── Layer 2: Atmospheric glow orbs (medium speed) ─────────────── */}
      <div
        ref={midGlowRef}
        className="pointer-events-none absolute inset-0 z-10 h-[120%] w-full will-change-transform"
      >
        {/* Primary brand glow — top-left */}
        <div className="bg-primary/20 absolute -left-32 top-10 h-96 w-96 rounded-full blur-[120px]" />
        {/* Accent glow — bottom-right */}
        <div className="bg-accent/15 absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-[100px]" />
        {/* Subtle centre glow for depth */}
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/10 blur-[90px]" />
      </div>

      {/* ── Layer 3: Floating status chips (slightly faster than glow) ── */}
      <div
        ref={chipsRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full will-change-transform"
      >
        {/* Top-right chip */}
        <div className="border-border-subtle absolute right-10 top-24 hidden rounded-2xl border bg-black/50 px-4 py-3 shadow-xl backdrop-blur-md lg:flex lg:flex-col lg:gap-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="font-mono text-xs font-medium text-white/80">KDS Live</span>
          </div>
          <p className="font-display text-sm font-bold text-white">3 orders · queue</p>
        </div>

        {/* Left chip */}
        <div className="border-border-subtle absolute left-10 top-1/3 hidden -translate-y-1/2 rounded-2xl border bg-black/50 px-4 py-3 shadow-xl backdrop-blur-md lg:flex lg:items-center lg:gap-3">
          <div className="bg-primary/20 flex h-9 w-9 items-center justify-center rounded-xl">
            <ChefHat className="text-primary h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">Kitchen Ready</p>
            <p className="font-mono text-xs text-white/60">Table 12 · Plating</p>
          </div>
        </div>

        {/* Bottom-left chip */}
        <div className="border-border-subtle absolute bottom-28 left-10 hidden rounded-2xl border bg-black/50 px-4 py-3 shadow-xl backdrop-blur-md lg:flex lg:items-center lg:gap-3">
          <div className="bg-accent/20 flex h-9 w-9 items-center justify-center rounded-xl">
            <Activity className="text-accent h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">SignalR Hub</p>
            <p className="font-mono text-xs text-white/60">&lt;50ms · 99.99% uptime</p>
          </div>
        </div>

        {/* Bottom-right chip */}
        <div className="border-border-subtle absolute bottom-28 right-10 hidden rounded-2xl border bg-black/50 px-4 py-3 shadow-xl backdrop-blur-md lg:flex lg:items-center lg:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20">
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">Real-time Sync</p>
            <p className="font-mono text-xs text-white/60">All zones active</p>
          </div>
        </div>
      </div>

      {/* ── Layer 4: Hero Content (moves fastest → exits first) ────────── */}
      <div
        ref={contentRef}
        className="relative z-30 mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8 will-change-transform"
      >
        <Badge
          variant="outline"
          className="border-primary/40 bg-black/40 mb-6 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-white/90 uppercase shadow-lg backdrop-blur-md"
        >
          Restaurant Operations Platform
        </Badge>

        <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
          Where Every Order
          <br />
          <span className="bg-gradient-to-r from-[#4A8B98] via-[#7AB89E] to-[#F26A3A] bg-clip-text text-transparent">
            Flows Flawlessly
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-white/75 drop-shadow-md sm:text-lg">
          Orderly unifies your kitchen display, floor operations, and admin in one sub-second
          real-time system — built for high-volume dining.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <SignInBridgeTrigger>
            <Button
              id="hero-sign-in-btn"
              size="lg"
              className="h-12 bg-white px-7 text-sm font-bold text-[#1F4254] shadow-2xl transition-transform hover:scale-105 hover:bg-white/95"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </SignInBridgeTrigger>
          <a href="#architecture">
            <Button
              id="hero-learn-more-btn"
              size="lg"
              variant="outline"
              className="h-12 border-white/30 px-7 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10"
            >
              Explore Architecture
            </Button>
          </a>
        </div>

        {/* Social proof row */}
        <p className="mt-8 font-mono text-xs tracking-widest text-white/40 uppercase">
          7 microservices · 8 roles · SignalR real-time · YARP gateway
        </p>
      </div>

      {/* Bottom fade to page surface */}
      <div className="from-surface pointer-events-none absolute inset-x-0 bottom-0 z-40 h-32 bg-gradient-to-t to-transparent" />
    </section>
  );
}
