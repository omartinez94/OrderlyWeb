/**
 * LoginPage — real form (Phase 3).
 *
 * Calls `useLoginMutation()` from `identityApi`. On success the
 * session slice is populated via the mutation's `onQueryStarted`
 * listener, `selectIsAuthenticated` flips true, and the user is
 * redirected to `defaultZoneForRoles(roles)` via the root
 * redirector (or the `returnTo` query param when present).
 *
 * Errors surface inline as a Sonner toast.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "../components/ui/sonner";
import { useLoginMutation } from "../app/api/identity";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated, selectDefaultZone } from "../app/session/sessionSelectors";
import { safeReturnPath } from "../lib/safeReturnPath";
import { PATH } from "../router/pathNames";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const defaultZone = useAppSelector(selectDefaultZone);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
      const message = (err as { data?: { message?: string } }).data?.message ?? "Sign-in failed";
      toast.error("Could not sign in", { description: message });
    }
  };

  return (
    <div className="bg-surface text-ink min-h-screen font-sans antialiased">
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-stretch justify-center gap-6 px-5 py-24">
        <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">Sign in</p>
        <h1 className="text-primary font-display text-4xl font-bold tracking-tight">
          Welcome back.
        </h1>
        <p className="text-ink-muted font-sans text-base leading-relaxed">
          Use your work email. New here? Ask a Restaurant Admin to invite you.
        </p>

        <form className="mt-2 grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="login-email">Work email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="staff@acme.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-danger font-sans text-sm" role="alert">
              {(error as { data?: { message?: string } }).data?.message ??
                "Sign-in failed. Please try again."}
            </p>
          )}
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <div>
          <Button asChild variant="outline">
            <Link to={PATH.HOME}>Back to home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
