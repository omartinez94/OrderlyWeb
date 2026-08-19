import { useTranslate } from "../hooks/useTranslate";
import { MarketingHeader } from "../components/Header/MarketingHeader";
import { SiteFooter } from "../components/Layout/SiteFooter";
import { ParallaxHero } from "../components/ParallaxHero";
import { HeroCarousel } from "../components/HeroCarousel";
import { ScrollReveal } from "../components/Motion/ScrollReveal";
import { StatsGrid, type StatItem } from "../components/ui";
import {
  ArchitectureSection,
  ZoneShowcaseSection,
  AtmosphereSection,
  CtaJumbotron,
  FaqSection,
  LiveTicketSimulator,
  ThreeTicketShowcase,
} from "../components/Home";

export function HomePage() {
  const translate = useTranslate("common");

  const homeStats: StatItem[] = [
    {
      value: "< 50ms",
      label: translate("home.stats.latency.label"),
      detail: translate("home.stats.latency.detail"),
    },
    {
      value: "7 Core",
      label: translate("home.stats.microservices.label"),
      detail: translate("home.stats.microservices.detail"),
    },
    {
      value: "8 Roles",
      label: translate("home.stats.rolePrecision.label"),
      detail: translate("home.stats.rolePrecision.detail"),
    },
    {
      value: "99.99%",
      label: translate("home.stats.hubUptime.label"),
      detail: translate("home.stats.hubUptime.detail"),
    },
  ];

  return (
    <div className="bg-surface text-ink selection:bg-primary/20 selection:text-primary min-h-screen font-sans antialiased">
      <MarketingHeader />
      <main id="main">
        {/* Big Picture Hero Parallax */}
        <ParallaxHero />

        {/* 3D Scroll-Deck Asset Showcase
        <ThreeAssetShowcase />*/}

        {/* Stats & Trust Banner */}
        <ScrollReveal direction="up">
          <StatsGrid stats={homeStats} />
        </ScrollReveal>

        {/* Live KDS Ticket Simulation Widget */}
        <ScrollReveal direction="up" delay={100}>
          <LiveTicketSimulator />
        </ScrollReveal>

        {/* 3D Scroll-Driven Ticket Flow */}
        <ThreeTicketShowcase />

        {/* 3D Scroll-Driven KDS ↔ Admin Card Flip
        <ScrollRotateShowcase />*/}

        {/* Big Picture Hero Jumbotron with Carousel */}
        <ScrollReveal direction="up">
          <HeroCarousel />
        </ScrollReveal>

        {/* Architecture & Microservices Highlight */}
        <ArchitectureSection />

        {/* Multi-Zone Deep Dive */}
        <ZoneShowcaseSection />

        {/* Vibe / Atmosphere Hero Highlight */}
        <ScrollReveal direction="up">
          <AtmosphereSection />
        </ScrollReveal>

        {/* Call to Action Jumbotron */}
        <ScrollReveal direction="up">
          <CtaJumbotron />
        </ScrollReveal>

        {/* FAQ Section */}
        <ScrollReveal direction="up">
          <FaqSection />
        </ScrollReveal>
      </main>

      <SiteFooter />
    </div>
  );
}
