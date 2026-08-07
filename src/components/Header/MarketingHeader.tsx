import { Link } from "react-router";
import { Zap } from "lucide-react";
import { Button } from "../ui/button";
import { SignInBridgeTrigger } from "../SignInDialog/SignInBridgeTrigger";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

export function MarketingHeader() {
  return (
    <header className="border-border-subtle bg-surface/85 sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="group flex items-center gap-2">
            <div className="bg-gradient-primary flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-display text-primary text-2xl font-bold tracking-tight">
              Orderly
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="text-ink-muted hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#capabilities" className="hover:text-primary transition-colors">
              Capabilities
            </a>
            <a href="#architecture" className="hover:text-primary transition-colors">
              Architecture
            </a>
            <a href="#zones" className="hover:text-primary transition-colors">
              Three Zones
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-surface-elevated flex items-center gap-1.5 rounded-full border p-1">
            <ThemeToggle />
          </div>

          <SignInBridgeTrigger>
            <Button size="sm" className="font-semibold shadow-xs transition-transform hover:scale-105">
              Sign in
            </Button>
          </SignInBridgeTrigger>
        </div>
      </div>
    </header>
  );
}
