/**
 * ProfilePage — placeholder until the auth plan wires the real
 * profile view. The route exists so `RequireAuth` has a target once
 * authentication is required to view it.
 *
 * Body is intentionally minimal: a heading and a back-to-home link.
 * The auth plan replaces this with the live profile (user info,
 * role, restaurant).
 */

import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { PATH } from "../router/pathNames";

export function ProfilePage() {
  return (
    <main className="bg-surface text-ink min-h-screen font-sans antialiased">
      <div className="mx-auto max-w-3xl px-5 py-24">
        <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">Profile</p>
        <h1 className="text-primary font-display text-4xl font-bold tracking-tight">
          Read-only profile
        </h1>
        <p className="text-ink-muted mt-4 font-sans text-base leading-relaxed">
          The full profile view ships with the auth slice.
        </p>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to={PATH.HOME}>Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
