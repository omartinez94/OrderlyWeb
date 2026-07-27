import './StatusPill.css';

/**
 * StatusPill — a compact badge showing an order/kitchen status.
 *
 * The status maps to one of the five service-hue gradient stops:
 *   new          -> deep     (received, untouched)
 *   acknowledged -> teal     (someone claimed it)
 *   preparing    -> aqua     (in progress)
 *   plating      -> amber    (almost done)
 *   ready        -> tangerine (waiting to be served)
 *   served       -> muted    (terminal state)
 *
 * Background uses a 10% tint of the service color so the dot/pill pair
 * reads as the same family without the pill competing with surrounding UI.
 */
export type OrderStatus = 'new' | 'acknowledged' | 'preparing' | 'plating' | 'ready' | 'served';

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New',
  acknowledged: 'Acknowledged',
  preparing: 'Preparing',
  plating: 'Plating',
  ready: 'Ready',
  served: 'Served',
};

const STATUS_TOKEN: Record<OrderStatus, string> = {
  new: 'deep',
  acknowledged: 'teal',
  preparing: 'aqua',
  plating: 'amber',
  ready: 'tangerine',
  served: 'muted',
};

export interface StatusPillProps {
  status: OrderStatus;
  /** Hide the colored dot, keep only the label. */
  hideDot?: boolean;
}

export function StatusPill({ status, hideDot = false }: StatusPillProps) {
  const token = STATUS_TOKEN[status];
  return (
    <span
      className={`status-pill status-pill--${token}`}
      role="status"
      aria-label={`Order status: ${STATUS_LABEL[status]}`}
    >
      {!hideDot && <span className="status-pill__dot" aria-hidden="true" />}
      <span className="status-pill__label">{STATUS_LABEL[status]}</span>
    </span>
  );
}
