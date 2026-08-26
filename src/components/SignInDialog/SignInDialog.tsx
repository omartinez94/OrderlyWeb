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
import { useTranslate } from "../../hooks/useTranslate";
import { ChefHat, Crown, Wine } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PasswordInput } from "../ui/password-input";
import { useLoginMutation } from "../../app/api/identity";
import { toast } from "../ui/sonner";

const DEMO_PRESETS: {
  email: string;
  key: "admin" | "kitchen" | "floorManager";
  Icon: typeof Crown;
}[] = [
  { email: "admin@orderly.com", key: "admin", Icon: Crown },
  { email: "kitchen@orderly.com", key: "kitchen", Icon: ChefHat },
  { email: "manager@orderly.com", key: "floorManager", Icon: Wine },
];

export interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const translate = useTranslate("auth");

  const handlePreset = (presetEmail: string) => {
    setEmail(presetEmail);
    // Identity password policy (docs/backend-architecture/architecture.md
    // §1, line 144): length ≥ 8, digit + non-alphanumeric + upper + lower.
    // `Admin@123456` is the seeded SuperAdmin credential — satisfies the
    // policy and matches the docs.
    setPassword("Admin@123456");
  };

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
            <PasswordInput
              id="signin-password"
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

        <div className="border-border-subtle mt-2 border-t pt-4">
          <p className="text-ink-subtle mb-2.5 text-xs font-medium tracking-wider uppercase">
            {translate("demoPresets.title", "Quick Demo Roles")}
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_PRESETS.map(({ email: presetEmail, key, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePreset(presetEmail)}
                className="border-border-subtle bg-surface hover:bg-surface-elevated text-ink flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{translate(`demoPresets.${key}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-ink-subtle mt-3 text-center font-sans text-xs">
          By signing in, you agree to your restaurant's data handling policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}
