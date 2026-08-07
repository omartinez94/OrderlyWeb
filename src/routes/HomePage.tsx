import { MarketingHeader } from "../components/Header/MarketingHeader";
import { SiteFooter } from "../components/Layout/SiteFooter";
import { ParallaxHero } from "../components/ParallaxHero";
import { LiveTicketSimulator } from "../components/Home/LiveTicketSimulator";
import { HeroCarousel } from "../components/HeroCarousel";
import { ScrollReveal } from "../components/Motion/ScrollReveal";
import { StatsGrid, type StatItem } from "../components/ui/stats-grid";
import { ArchitectureSection } from "../components/Home/ArchitectureSection";
import { ZoneShowcaseSection } from "../components/Home/ZoneShowcaseSection";
import { AtmosphereSection } from "../components/Home/AtmosphereSection";
import { CtaJumbotron } from "../components/Home/CtaJumbotron";
import { FaqSection } from "../components/Home/FaqSection";

const HOME_STATS: StatItem[] = [
  { label: "Real-time Latency", value: "< 50ms", detail: "SignalR web sockets" },
  { label: "Microservices", value: "7 Core", detail: "YARP API Gateway backed" },
  { label: "Role Precision", value: "8 Roles", detail: "Granular zone access" },
  { label: "Hub Uptime", value: "99.99%", detail: "Resilient auto-reconnect" },
];

export function HomePage() {
  return (
    <div className="bg-surface text-ink selection:bg-primary/20 selection:text-primary min-h-screen font-sans antialiased">
      <MarketingHeader />
      <main id="main">
        {/* Big Picture Hero Parallax */}
        <ParallaxHero />

        {/* Stats & Trust Banner */}
        <ScrollReveal direction="up">
          <StatsGrid stats={HOME_STATS} />
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
