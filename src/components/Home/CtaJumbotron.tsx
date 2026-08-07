import { Link } from "react-router";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SignInBridgeTrigger } from "../SignInDialog/SignInBridgeTrigger";
import { PATH } from "../../router/pathNames";

export function CtaJumbotron() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-primary relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl sm:p-12 lg:p-16">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse duration-5000" />

          <div className="relative z-10 max-w-3xl">
            <Badge
              variant="secondary"
              className="mb-6 border-none bg-white/20 text-white hover:bg-white/30"
            >
              Ready to Upgrade Your Shift?
            </Badge>
            <h2 className="font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
              Get started with Orderly in minutes.
            </h2>
            <p className="mt-4 font-sans text-lg leading-relaxed text-white/90">
              Sign in with your staff credentials or contact your Restaurant Administrator to
              request zone access.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <SignInBridgeTrigger>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-primary h-12 px-8 font-bold shadow-lg transition-transform hover:scale-105 hover:bg-white"
                >
                  Open Sign-In Dialog
                </Button>
              </SignInBridgeTrigger>

              <Link to={PATH.SHOWCASE}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/40 font-medium text-white backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white/10"
                >
                  View Component Showcase
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
