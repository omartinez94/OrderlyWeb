/**
 * NotFoundPage — the 404 surface.
 *
 * Reached when no route matches. Lives at the wildcard `*` route in
 * `router.tsx`. Renders a quiet, recoverable error: explanation +
 * back-to-home action.
 */

import { Link } from "react-router";
import { Button } from "../components/ui";
import { PATH } from "../router/pathNames";

export function NotFoundPage() {
  return (
    <div className="bg-surface text-ink min-h-screen font-sans antialiased">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-stretch justify-center gap-6 px-5 py-24">
        <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">Error 404</p>
        <h1 className="text-primary font-display text-4xl font-bold tracking-tight">Not found</h1>
        <p className="text-ink-muted max-w-xl font-sans text-base leading-relaxed">
          We couldn't find that page. It may have moved, or the link might be stale.
        </p>
        <div>
          <Button asChild>
            <Link to={PATH.HOME}>Back to home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
