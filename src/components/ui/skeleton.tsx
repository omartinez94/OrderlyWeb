import { cn } from "@/lib/utils";

/**
 * Skeleton — placeholder block while data loads.
 *
 * Contract:
 *   - Use sparingly; skeletons are loud and accumulate quickly.
 *   - The pulse animation is gated on `prefers-reduced-motion`
 *     through the browser's `animation` behavior; the rendered
 *     surface is the same either way.
 *   - Default color is `bg-muted` (Sage Linen High) so it reads
 *     against both the page and the elevated card surface.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
