/**
 * LoginPage — placeholder until the auth plan wires the real login
 * flow. The route exists so `RequireAuth` has a redirect target.
 *
 * The body is intentionally minimal: a heading and a back-to-home
 * link. The auth plan (`.agents/plans/authentication-and-profile/`)
 * replaces this with the live form.
 */

import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { PATH } from "../router/pathNames";

export function LoginPage() {
  return (
    <div className="bg-surface text-ink min-h-screen font-sans antialiased">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-stretch justify-center gap-6 px-5 py-24">
        <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">Sign in</p>
        <h1 className="text-primary font-display text-4xl font-bold tracking-tight">
          Welcome back.
        </h1>
        <p className="text-ink-muted max-w-xl font-sans text-base leading-relaxed">
          The login form lands with the auth slice. For now, head back to the marketing page.
        </p>
        <div>
          <Button asChild variant="outline">
            <Link to={PATH.HOME}>Back to home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
