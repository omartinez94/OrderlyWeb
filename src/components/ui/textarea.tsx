import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Textarea — multi-line text input.
 *
 * Contract mirrors `Input`:
 *   - Pair with a `<Label htmlFor={id}>` (or `FormLabel`).
 *   - Error state via `aria-invalid`; description + error wired via
 *     `aria-describedby` automatically by `FormControl`.
 *   - `field-sizing-content` (when supported) lets the textarea grow
 *     with its content; otherwise the fixed `min-h-20` baseline holds.
 *   - Focus-visible uses 2px ring + 2px offset.
 *   - `resize-y` lets the user grow the field vertically on desktop.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md",
        "border border-input bg-surface-overlay text-ink",
        "px-3 py-2 text-base shadow-xs",
        "placeholder:text-ink-subtle",
        "transition-colors outline-none resize-y",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
