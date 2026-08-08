/**
 * LoginPage — Modern World-Class Enterprise Auth Page.
 *
 * Implements a world-class split layout with an interactive brand showcase
 * on the left and a glassmorphic authentication panel on the right.
 *
 * Features:
 * - Enterprise Trust & Security Badges (SOC2 Type II, 256-Bit SSL, 99.99% SLA)
 * - Quick Demo / Role Preset buttons for developer convenience
 * - i18n & Theme Toggle integration
 * - Smooth state feedback and error handling
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowLeft,
  ChefHat,
  Crown,
  Globe,
  Lock,
  Server,
  ShieldCheck,
  Sparkles,
  Wine,
} from "lucide-react";
import { Button, Input, Label, Badge } from "../components/ui";
import { toast } from "../components/ui/sonner";
import { ThemeToggle } from "../components/ThemeToggle/ThemeToggle";
import { LanguageToggle } from "../components/LanguageToggle/LanguageToggle";
import { useLoginMutation } from "../app/api/identity";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated, selectDefaultZone } from "../app/session/sessionSelectors";
import { safeReturnPath } from "../lib/safeReturnPath";
import { PATH } from "../router/pathNames";
import "./LoginPage.css";

const DEMO_PRESETS: {
  email: string;
  key: "admin" | "kitchen" | "floorManager";
  Icon: typeof Crown;
}[] = [
  { email: "admin@acme.com", key: "admin", Icon: Crown },
  { email: "kitchen@acme.com", key: "kitchen", Icon: ChefHat },
  { email: "manager@acme.com", key: "floorManager", Icon: Wine },
];

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const defaultZone = useAppSelector(selectDefaultZone);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation("auth");
  const returnTo = safeReturnPath(searchParams.get("returnTo"), PATH.HOME);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo === PATH.HOME && defaultZone ? defaultZone : returnTo, { replace: true });
    }
  }, [isAuthenticated, defaultZone, navigate, returnTo]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login({ email, password }).unwrap();
    } catch (err) {
      const message =
        (err as { data?: { message?: string } }).data?.message ?? t("login.toastErrorFallback");
      toast.error(t("login.toastErrorTitle"), { description: message });
    }
  };

  const handlePreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("password123");
  };

  return (
    <div className="login-page-container">
      {/* Dynamic background ambient glows */}
      <div className="login-bg-glow-1" aria-hidden="true" />
      <div className="login-bg-glow-2" aria-hidden="true" />

      {/* LEFT SIDE: World-Class Hero Showcase (Desktops) */}
      <div className="login-hero-section">
        <div
          className="login-hero-image"
          aria-hidden="true"
          style={{ backgroundImage: "url('/images/02-login-background.jpg')" }}
        />
        <div className="login-hero-overlay" aria-hidden="true" />

        <div className="login-hero-header">
          <div className="bg-gradient-primary shadow-primary/20 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="login-hero-brand">{t("hero.brand")}</span>
        </div>

        <div className="login-hero-content">
          <div>
            <div className="login-hero-badge">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("hero.eyebrow")}</span>
            </div>
          </div>

          <h1 className="login-hero-title">{t("hero.title")}</h1>

          <p className="login-hero-description">{t("hero.description")}</p>

          <div className="login-preview-grid">
            <div className="login-preview-card">
              <div className="login-preview-icon">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-semibold">{t("hero.featureGlobalTitle")}</h3>
              <p className="mt-1 text-xs leading-relaxed">{t("hero.featureGlobalDescription")}</p>
            </div>

            <div className="login-preview-card">
              <div className="login-preview-icon">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-semibold">{t("hero.featureSlaTitle")}</h3>
              <p className="mt-1 text-xs leading-relaxed">{t("hero.featureSlaDescription")}</p>
            </div>
          </div>
        </div>

        <div className="login-hero-footer">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>{t("hero.badgeSoc")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Lock className="h-4 w-4" />
              <span>{t("hero.badgeSsl")}</span>
            </div>
          </div>
          <span className="font-mono text-xs">{t("hero.version")}</span>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="login-form-section">
        {/* Top Controls: Locale & Theme */}
        <div className="login-top-bar">
          <Button asChild variant="ghost" size="sm" className="text-ink-muted hover:text-ink">
            <Link to={PATH.HOME}>
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("login.backToHome")}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Form Card */}
        <div className="login-form-wrapper">
          <div className="login-card">
            <div className="mb-6 space-y-1.5">
              <Badge
                variant="outline"
                className="text-primary border-primary/30 font-mono text-xs tracking-wider uppercase"
              >
                {t("login.staffPortal")}
              </Badge>
              <h2 className="font-display text-ink text-2xl font-bold tracking-tight">
                {t("login.title")}
              </h2>
              <p className="text-ink-muted text-sm leading-relaxed">{t("login.subtitle")}</p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="login-email">{t("login.email")}</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">{t("login.password")}</Label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(t("login.forgotToast"));
                    }}
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    {t("login.forgotPassword")}
                  </a>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {error && (
                <div
                  className="bg-danger/10 border-danger/20 text-danger flex items-start gap-2 rounded-lg border p-3 text-xs font-medium"
                  role="alert"
                >
                  <AlertTriangle className="mt-px h-4 w-4 shrink-0" />
                  <span>
                    {(error as { data?: { message?: string } }).data?.message ??
                      t("login.errorInvalid")}
                  </span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="shadow-primary/20 h-11 w-full text-base font-semibold shadow-md"
                disabled={isLoading}
              >
                {isLoading ? t("login.submitting") : t("login.submit")}
              </Button>
            </form>

            {/* Quick Demo Preset Fillers */}
            <div className="border-border-subtle mt-6 border-t pt-5">
              <p className="text-ink-subtle mb-2.5 text-xs font-medium tracking-wider uppercase">
                {t("demoPresets.title")}
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_PRESETS.map(({ email: presetEmail, key, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePreset(presetEmail)}
                    className="login-preset-pill"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t(`demoPresets.${key}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-ink-subtle text-center text-xs">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </div>
  );
}
