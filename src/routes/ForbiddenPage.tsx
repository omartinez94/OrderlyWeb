/**
 * ForbiddenPage — the 403 surface rendered by `RequireRole` when the
 * predicate rejects the visitor. The contract: a forbidden response
 * is intentional, not an auth failure. The user sees a calm,
 * recoverable message with a back-to-home action.
 */

import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { PATH } from "../router/pathNames";

export function ForbiddenPage() {
  return (
    <div className="bg-surface text-ink min-h-screen font-sans antialiased">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-stretch justify-center gap-6 px-5 py-24">
        <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">Error 403</p>
        <h1 className="text-primary font-display text-4xl font-bold tracking-tight">Forbidden</h1>
        <p className="text-ink-muted max-w-xl font-sans text-base leading-relaxed">
          You don't have access to this page. If you think this is a mistake, ask a Restaurant Admin
          to update your role.
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
