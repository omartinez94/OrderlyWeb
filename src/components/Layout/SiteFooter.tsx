import { Link } from "react-router";
import { Zap } from "lucide-react";
import { SignInBridgeTrigger } from "../SignInDialog/SignInBridgeTrigger";
import { PATH } from "../../router/pathNames";

export function SiteFooter() {
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
              Enterprise staff-facing management system for modern dining rooms and kitchen
              operations.
            </p>
          </div>

          <div>
            <p className="font-display text-ink mb-3 text-sm font-bold">Zones</p>
            <ul className="text-ink-muted space-y-2 font-sans text-xs">
              <li>
                <Link to="/site/admin" className="hover:text-primary transition-colors">
                  Admin Console
                </Link>
              </li>
              <li>
                <Link to="/site/kitchen" className="hover:text-primary transition-colors">
                  Kitchen KDS
                </Link>
              </li>
              <li>
                <Link to="/site/restaurant" className="hover:text-primary transition-colors">
                  Restaurant Operations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-ink mb-3 text-sm font-bold">System</p>
            <ul className="text-ink-muted space-y-2 font-sans text-xs">
              <li>
                <Link to={PATH.SHOWCASE} className="hover:text-primary transition-colors">
                  UI Primitive Showcase
                </Link>
              </li>
              <li>
                <a href="#architecture" className="hover:text-primary transition-colors">
                  Microservice Gateway
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-ink mb-3 text-sm font-bold">Gateway Status</p>
            <div className="border-border-subtle bg-surface flex items-center gap-2 rounded-lg border p-3 text-xs">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-ink font-mono font-medium">Gateway 6004 Online</span>
            </div>
          </div>
        </div>

        <div className="border-border-subtle text-ink-subtle flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row">
          <p>© Orderly. Built for high-volume restaurant shifts.</p>
          <div className="flex items-center gap-6">
            <SignInBridgeTrigger>
              <button type="button" className="hover:text-ink transition-colors">
                Staff Sign In
              </button>
            </SignInBridgeTrigger>
            <Link to={PATH.SHOWCASE} className="hover:text-ink transition-colors">
              Design Tokens
            </Link>
            <span className="font-mono">v0.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
