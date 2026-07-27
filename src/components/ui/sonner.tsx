"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

import { cn } from "@/lib/utils";

/**
 * Toaster — the Sonner toast portal mounted once at the app root.
 *
 * Variants and politeness:
 *   - `default` / `success` / `info` — `aria-live="polite"`. The
 *     screen reader announces after the current utterance
 *     finishes; non-urgent feedback.
 *   - `warning` — `aria-live="polite"`. A warning is still
 *     non-interruptive; the user can finish their current action.
 *   - `destructive` — `aria-live="assertive"`. Errors and
 *     destructive confirmations interrupt the current utterance;
 *     the user needs the feedback immediately.
 *
 * Throttling: identical messages are debounced within 500ms
 * through Sonner's `id` key — consumers that fire the same toast
 * twice in a tick will only see one. Tests assert this in Phase 8.
 */
type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      expand
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast",
            "bg-popover text-ink border border-border-subtle shadow-md",
            "rounded-xl",
          ),
          description: "text-ink-muted",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-ink-muted",
        },
      }}
      {...props}
    />
  );
}

/**
 * The four politeness variants the base library exposes. The Sonner
 * API is rich; this is the surface every consumer in the app should
 * use. Anything else (custom JSX, etc.) is reserved for one-off
 * feature work.
 */
type ToastVariant = "default" | "success" | "info" | "warning" | "destructive";

const variantClassNames: Record<ToastVariant, string> = {
  default: "",
  success: "border-success/40 text-success",
  info: "border-info/40 text-info",
  warning: "border-warning/40 text-warning",
  destructive: "border-danger/40 text-danger",
};

function toast(
  message: string,
  options?: { description?: string; duration?: number; id?: string | number },
) {
  return sonnerToast(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    id: options?.id,
  });
}

toast.success = (message: string, options?: { description?: string; id?: string | number }) =>
  sonnerToast.success(message, { description: options?.description, id: options?.id });

toast.info = (message: string, options?: { description?: string; id?: string | number }) =>
  sonnerToast.info(message, { description: options?.description, id: options?.id });

toast.warning = (message: string, options?: { description?: string; id?: string | number }) =>
  sonnerToast.warning(message, { description: options?.description, id: options?.id });

toast.error = (message: string, options?: { description?: string; id?: string | number }) =>
  sonnerToast.error(message, { description: options?.description, id: options?.id });

toast.dismiss = (id?: string | number) => sonnerToast.dismiss(id);

export { Toaster, toast, variantClassNames };
export type { ToastVariant };
