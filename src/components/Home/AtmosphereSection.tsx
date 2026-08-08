import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";

export function AtmosphereSection() {
  const { t } = useTranslation("common");

  return (
    <section className="bg-surface relative overflow-hidden py-28">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/06-ingredients.jpg"
          alt="Fresh restaurant ingredients"
          className="h-full w-full scale-105 object-cover brightness-75 filter"
        />
        <div className="from-surface via-surface/85 to-surface absolute inset-0 bg-gradient-to-t" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <Badge
          variant="outline"
          className="text-primary border-border-strong bg-surface/80 mb-4 text-xs tracking-wider uppercase backdrop-blur-md"
        >
          {t("home.atmosphere.badge")}
        </Badge>
        <h2 className="font-display text-ink text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          {t("home.atmosphere.title")}
        </h2>
        <p className="text-ink-muted mx-auto mt-6 max-w-2xl font-sans text-xl leading-relaxed">
          {t("home.atmosphere.description")}
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <img
            src="/images/05-staff-avatar-set.jpg"
            alt="Orderly Staff Team"
            className="border-primary h-14 w-14 rounded-full border-2 object-cover shadow-lg transition-transform hover:scale-110"
          />
          <div className="text-left">
            <p className="font-display text-ink text-base font-bold">{t("home.atmosphere.role")}</p>
            <p className="text-ink-muted font-sans text-xs">{t("home.atmosphere.company")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
