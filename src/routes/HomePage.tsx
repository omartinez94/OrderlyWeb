import { useTranslation } from "react-i18next";
import { MarketingHeader } from "../components/Header/MarketingHeader";
import { SiteFooter } from "../components/Layout/SiteFooter";
import { ParallaxHero } from "../components/ParallaxHero";
import { LiveTicketSimulator } from "../components/Home/LiveTicketSimulator";
import { HeroCarousel } from "../components/HeroCarousel";
import { ScrollReveal } from "../components/Motion/ScrollReveal";
import { StatsGrid, type StatItem } from "../components/ui";
import { ArchitectureSection } from "../components/Home/ArchitectureSection";
import { ZoneShowcaseSection } from "../components/Home/ZoneShowcaseSection";
import { AtmosphereSection } from "../components/Home/AtmosphereSection";
import { CtaJumbotron } from "../components/Home/CtaJumbotron";
import { FaqSection } from "../components/Home/FaqSection";

export function HomePage() {
  const { t } = useTranslation("common");

  const homeStats: StatItem[] = [
    {
      value: "< 50ms",
      label: t("home.stats.latency.label"),
      detail: t("home.stats.latency.detail"),
    },
    {
      value: "7 Core",
      label: t("home.stats.microservices.label"),
      detail: t("home.stats.microservices.detail"),
    },
    {
      value: "8 Roles",
      label: t("home.stats.rolePrecision.label"),
      detail: t("home.stats.rolePrecision.detail"),
    },
    {
      value: "99.99%",
      label: t("home.stats.hubUptime.label"),
      detail: t("home.stats.hubUptime.detail"),
    },
  ];

  return (
    <div className="bg-surface text-ink selection:bg-primary/20 selection:text-primary min-h-screen font-sans antialiased">
      <MarketingHeader />
      <main id="main">
        {/* Big Picture Hero Parallax */}
        <ParallaxHero />

        {/* Stats & Trust Banner */}
        <ScrollReveal direction="up">
          <StatsGrid stats={homeStats} />
        </ScrollReveal>

        {/* Live KDS Ticket Simulation Widget */}
        <ScrollReveal direction="up" delay={100}>
          <LiveTicketSimulator />
        </ScrollReveal>

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
