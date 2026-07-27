import type { Zone } from '../types';

type Load = 'neutral' | 'amber' | 'tangerine';

function loadFor(count: number): Load {
  if (count <= 5) return 'neutral';
  if (count <= 10) return 'amber';
  return 'tangerine';
}

function copyFor(count: number, zone: Zone): string {
  if (zone === 'kitchen') {
    return `${count} in kitchen`;
  }
  return `${count} in progress`;
}

/**
 * Ops badge — live count of in-progress orders.
 * Hidden on the admin zone (controlled by the parent).
 * Hidden entirely at 0 (empty state = no badge).
 *
 * Color rules (Service-Flow Rule binds the exception):
 *   0-5   → neutral (Carbon Ink on Sage Linen High)
 *   6-10  → Saffron Amber (12% tint, 28% border, full fg)
 *   11+   → Burnt Tangerine (14% tint, 32% border, full fg)
 *
 * This is the one place tangerine is allowed to shout — it is a
 * service hue carrying status meaning, not decoration.
 */
export interface OpsBadgeProps {
  count: number;
  zone: Zone;
  onClick?: () => void;
}

export function OpsBadge({ count, zone, onClick }: OpsBadgeProps) {
  const load = loadFor(count);
  const label = copyFor(count, zone);

  return (
    <button
      type="button"
      className="ds-ops-badge"
      data-load={load}
      onClick={onClick}
      aria-label={`${label}. Click to view orders.`}
    >
      <span className="ds-ops-badge__count">{count}</span>
      <span>{zone === 'kitchen' ? 'in kitchen' : 'in progress'}</span>
    </button>
  );
}
