/**
 * RootErrorBoundary — the top-level errorElement for the router.
 * Catches loader errors, render errors, and any thrown `<Navigate>`.
 *
 * The boundary renders a recoverable error surface: a short message,
 * the error class name (when available), and two actions:
 *   - Reload: hard reload of the current route.
 *   - Back to home: navigate to the marketing `/home` page.
 *
 * No tokens leak in the error display. The boundary is intentionally
 * chatty about the *remedy* and quiet about the *cause* — the same
 * shape every error surface in the app uses.
 */

import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import { Button } from "../ui/button";
import { PATH } from "../../router/pathNames";

export function RootErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const status = isRouteErrorResponse(error) ? error.status : null;
  const title =
    status === 404 ? "Not found" : status === 403 ? "Forbidden" : "Something went wrong";
  const description =
    status === 404
      ? "We couldn't find that page."
      : status === 403
        ? "You don't have access to this page."
        : "An unexpected error occurred. Try again, or head back to the home page.";

  return (
    <div className="bg-surface text-ink min-h-screen font-sans antialiased">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-stretch justify-center gap-6 px-5 py-24">
        <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">
          {status != null ? `Error ${status}` : "Error"}
        </p>
        <h1 className="text-primary font-display text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-ink-muted max-w-xl font-sans text-base leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <Button variant="outline" onClick={() => navigate(PATH.HOME)}>
            Back to home
          </Button>
        </div>
      </main>
    </div>
  );
}
