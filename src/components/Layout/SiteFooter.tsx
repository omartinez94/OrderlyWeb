import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Zap } from "lucide-react";
import { SignInBridgeTrigger } from "../SignInDialog/SignInBridgeTrigger";
import { PATH } from "../../router/pathNames";

export function SiteFooter() {
  const { t } = useTranslation("common");
  return (
    <footer
      aria-label="Site footer"
      className="border-border-subtle bg-surface-elevated border-t py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 pb-12 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-lg text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-display text-primary text-xl font-bold">Orderly</span>
            </div>
            <p className="text-ink-muted font-sans text-xs leading-relaxed">
              {t("marketing.footer.description")}
            </p>
          </div>

          <div>
            <p className="font-display text-ink mb-3 text-sm font-bold">
              {t("marketing.footer.zonesHeading")}
            </p>
            <ul className="text-ink-muted space-y-2 font-sans text-xs">
              <li>
                <Link to="/site/admin" className="hover:text-primary transition-colors">
                  {t("marketing.footer.adminConsole")}
                </Link>
              </li>
              <li>
                <Link to="/site/kitchen" className="hover:text-primary transition-colors">
                  {t("marketing.footer.kitchenKds")}
                </Link>
              </li>
              <li>
                <Link to="/site/restaurant" className="hover:text-primary transition-colors">
                  {t("marketing.footer.restaurantOps")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-ink mb-3 text-sm font-bold">
              {t("marketing.footer.systemHeading")}
            </p>
            <ul className="text-ink-muted space-y-2 font-sans text-xs">
              <li>
                <Link to={PATH.SHOWCASE} className="hover:text-primary transition-colors">
                  {t("marketing.footer.showcaseLink")}
                </Link>
              </li>
              <li>
                <a href="#architecture" className="hover:text-primary transition-colors">
                  {t("marketing.footer.gatewayLink")}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  {t("marketing.footer.faqLink")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-ink mb-3 text-sm font-bold">
              {t("marketing.footer.gatewayStatusHeading")}
            </p>
            <div className="border-border-subtle bg-surface flex items-center gap-2 rounded-lg border p-3 text-xs">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-ink font-mono font-medium">
                {t("marketing.footer.gatewayStatus")}
              </span>
            </div>
          </div>
        </div>

        <div className="border-border-subtle text-ink-subtle flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row">
          <p>{t("marketing.footer.copyright")}</p>
          <div className="flex items-center gap-6">
            <SignInBridgeTrigger>
              <button type="button" className="hover:text-ink transition-colors">
                {t("marketing.footer.staffSignIn")}
              </button>
            </SignInBridgeTrigger>
            <Link to={PATH.SHOWCASE} className="hover:text-ink transition-colors">
              {t("marketing.footer.designTokens")}
            </Link>
            <span className="font-mono">v0.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
