/**
 * SignInDialog — the modal sign-in surface.
 *
 * Lifted from the marketing HomePage so the same dialog can be opened
 * from any surface (footer CTAs, "Locked" pages, etc.) without
 * duplicating the dialog state. Mounted once by `SignInDialogHost`,
 * which lives inside `RootLayout` so it's available across the app.
 *
 * Visual contract: blue-teal primary, glass-strong backdrop, single
 * form, SSO row at the bottom for Google / Microsoft providers. The
 * auth plan replaces this with the real form when the Identity
 * Service is wired.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

export interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
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

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="signin-email">Work email</Label>
            <Input id="signin-email" type="email" placeholder="staff@acme.com" autoComplete="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" size="lg">
            Continue
          </Button>
        </form>

        <div className="my-2 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-ink-subtle font-sans text-xs tracking-wider uppercase">or</span>
          <Separator className="flex-1" />
        </div>

        <div className="grid gap-2">
          <Button variant="outline" type="button">
            Continue with Google
          </Button>
          <Button variant="outline" type="button">
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
