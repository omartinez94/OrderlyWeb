import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollReveal } from "../Motion/ScrollReveal";
import { SignInBridgeTrigger } from "../SignInDialog/SignInBridgeTrigger";
import {
  ShieldCheck,
  ChefHat,
  Store,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

export interface ZoneItem {
  id: string;
  name: string;
  path: string;
  badge: string;
  icon: LucideIcon;
  description: string;
  image: string;
  points: string[];
}

export const ZONES: ZoneItem[] = [
  {
    id: "admin",
    name: "Admin & Executive Zone",
    path: "/site/admin",
    badge: "SuperAdmin · Manager",
    icon: ShieldCheck,
    description:
      "Complete back-office control center for staff provisioning, menu catalogs, multi-unit governance, and system metrics.",
    image: "/images/04-staff-management.jpg",
    points: [
      "Staff onboarding and role assignment",
      "Global category and menu item cataloging",
      "System audit logs and operational health",
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen Display System (KDS)",
    path: "/site/kitchen",
    badge: "KitchenManager · Line Cook",
    icon: ChefHat,
    description:
      "High-velocity ticket queue designed for intense shift environments with automated cool-to-warm time-urgency gradients.",
    image: "/images/03-kds-mockup.jpg",
    points: [
      "Sub-second order state updates",
      "Station-filtered ticket dispatch",
      "Dynamic color-coded prep timer thresholds",
    ],
  },
  {
    id: "restaurant",
    name: "Floor & Dining Operations",
    path: "/site/restaurant",
    badge: "Waiter · Cashier · Host",
    icon: Store,
    description:
      "Fast table-side POS ordering, seat management, flexible bill splitting, and instant reservation routing.",
    image: "/images/04-split-bill.jpg",
    points: [
      "Frictionless seat-based check splitting",
      "Live table occupancy status map",
      "Direct Redis-backed basket pricing",
    ],
  },
];

export function ZoneShowcaseSection() {
  const { t } = useTranslation("common");
  const [activeZone, setActiveZone] = useState<string>("admin");

  const translatedZones = ZONES.map((zone) => {
    const nameKey = `home.zones.${zone.id}.name` as unknown as "home.zones.admin.name";
    const badgeKey = `home.zones.${zone.id}.badge` as unknown as "home.zones.admin.badge";
    const descriptionKey =
      `home.zones.${zone.id}.description` as unknown as "home.zones.admin.description";
    const p1Key = `home.zones.${zone.id}.p1` as unknown as "home.zones.admin.p1";
    const p2Key = `home.zones.${zone.id}.p2` as unknown as "home.zones.admin.p2";
    const p3Key = `home.zones.${zone.id}.p3` as unknown as "home.zones.admin.p3";

    return {
      ...zone,
      name: t(nameKey),
      badge: t(badgeKey),
      description: t(descriptionKey),
      points: [t(p1Key), t(p2Key), t(p3Key)],
    };
  });

  const current = translatedZones.find((z) => z.id === activeZone) || translatedZones[0];
  const Icon = current.icon;

  return (
    <section
      id="zones"
      className="bg-surface-elevated/40 border-border-subtle relative border-b py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Badge
              variant="outline"
              className="text-primary border-border-strong mb-4 text-xs tracking-wider uppercase"
            >
              {t("home.zones.badge")}
            </Badge>
            <h2 className="font-display text-ink text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {t("home.zones.title")}
            </h2>
            <p className="text-ink-muted mt-4 font-sans text-lg">{t("home.zones.description")}</p>
          </div>
        </ScrollReveal>

        {/* Zone Selector Buttons */}
        <ScrollReveal direction="up" delay={100}>
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {translatedZones.map((zone) => {
              const ZIcon = zone.icon;
              const isSelected = zone.id === activeZone;
              return (
                <button
                  key={zone.id}
                  onClick={() => setActiveZone(zone.id)}
                  className={`font-display flex items-center gap-3 rounded-xl border px-6 py-3.5 text-base font-bold transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary ring-primary/20 scale-[1.03] text-white shadow-xl ring-4"
                      : "border-border-strong bg-surface text-ink hover:bg-surface-elevated hover:scale-105"
                  }`}
                >
                  <ZIcon className={`h-5 w-5 ${isSelected ? "text-white" : "text-primary"}`} />
                  {zone.name}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Active Zone Display Card */}
        <ScrollReveal direction="up" delay={200}>
          <div className="border-border-strong bg-surface grid grid-cols-1 items-center gap-8 rounded-2xl border p-8 shadow-2xl transition-all duration-500 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-primary font-mono text-xs">
                  {current.badge}
                </Badge>
              </div>

              <h3 className="font-display text-ink text-3xl font-bold tracking-tight transition-all">
                {current.name}
              </h3>

              <p className="text-ink-muted font-sans text-lg leading-relaxed">
                {current.description}
              </p>

              <ul className="text-ink space-y-3 font-sans text-sm">
                {current.points.map((pt, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <SignInBridgeTrigger>
                  <Button className="font-semibold shadow-md transition-all hover:scale-105">
                    {t("home.zones.access", { name: current.name })}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignInBridgeTrigger>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border-border-subtle group relative overflow-hidden rounded-xl border shadow-xl">
                <img
                  src={current.image}
                  alt={current.name}
                  className="h-[360px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
