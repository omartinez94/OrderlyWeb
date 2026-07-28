/**
 * SignInDialog — the modal sign-in surface.
 *
 * Mounted once by `SignInDialogHost` (which sits inside RootLayout).
 * On submit, calls `useLoginMutation()` from `identityApi`. The
 * mutation's `onQueryStarted` listener populates the session slice;
 * the dialog closes via `onOpenChange(false)` and the host's
 * mounted tree re-renders against the new auth state.
 *
 * Phase 3 wires the real form. SSO buttons (Google / Microsoft) are
 * placeholders for the OAuth flow that lands with the identity
 * feature plan.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useLoginMutation } from "../../app/api/identity";
import { toast } from "../ui/sonner";

export interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login({ email, password }).unwrap();
      onOpenChange(false);
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message ?? "Sign-in failed";
      toast.error("Could not sign in", { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border-subtle glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary font-display text-2xl">
            Sign in to Orderly
          </DialogTitle>
          <DialogDescription className="text-ink-muted">
            Use your work email. New here? Ask a Restaurant Admin to invite you.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="signin-email">Work email</Label>
            <Input
              id="signin-email"
              type="email"
              placeholder="staff@acme.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <div className="my-2 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-ink-subtle font-sans text-xs tracking-wider uppercase">or</span>
          <Separator className="flex-1" />
        </div>

        <div className="grid gap-2">
          <Button variant="outline" type="button" disabled>
            Continue with Google
          </Button>
          <Button variant="outline" type="button" disabled>
            Continue with Microsoft
          </Button>
        </div>

        <p className="text-ink-subtle mt-3 text-center font-sans text-xs">
          By signing in, you agree to your restaurant's data handling policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}
