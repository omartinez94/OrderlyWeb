/**
 * Order domain types.
 *
 * `OrderStatus` is the canonical order lifecycle. The StatusPill
 * component (a UI primitive) maps each status to a service-hue
 * gradient stop and an accessibility label. The status enum is
 * hoisted here so feature code can import it without pulling in the
 * StatusPill component (which carries CSS dependencies).
 *
 * Lifecycle (per `docs/website-spec.md` §5.4):
 *   new          -> received, untouched
 *   acknowledged -> someone claimed it
 *   preparing    -> in progress
 *   plating      -> almost done
 *   ready        -> waiting to be served
 *   served       -> terminal state
 */

export type OrderStatus = "new" | "acknowledged" | "preparing" | "plating" | "ready" | "served";
