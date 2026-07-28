/**
 * Header icons — single source of truth for inline SVG icons used
 * by Header slot components. Hoisted to module scope so each icon
 * is created once per module load (not per render). Slot
 * components import them and pass `size` / `className`.
 *
 * Icons are typed as `Icon<{ size?: number; className?: string }>`.
 * Default `size` is 18 to match the bell/avatar dimensions; default
 * `strokeWidth` is 2 (Lucide convention).
 *
 * Phase 1 cleanup (Vercel `rendering-hoist-jsx`): previously these
 * SVGs were inlined inside each slot component, re-allocating the
 * element tree on every render.
 */

import type { SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "size"> {
  size?: number;
}

function baseProps(size: number): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
}

export function BellIcon({ size = 18, className, ...rest }: IconProps): React.ReactElement {
  return (
    <svg className={className} {...baseProps(size)} {...rest}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function UserIcon({ size = 16, className, ...rest }: IconProps): React.ReactElement {
  return (
    <svg className={className} {...baseProps(size)} {...rest}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function LogoutIcon({ size = 16, className, ...rest }: IconProps): React.ReactElement {
  return (
    <svg className={className} {...baseProps(size)} {...rest}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function CheckIcon({ size = 32, className, ...rest }: IconProps): React.ReactElement {
  return (
    <svg className={className} {...baseProps(size)} {...rest}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function ChevronIcon({ size = 14, className, ...rest }: IconProps): React.ReactElement {
  return (
    <svg className={className} {...baseProps(size)} {...rest}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function SunIcon({ size = 18, className, ...rest }: IconProps): React.ReactElement {
  return (
    <svg className={className} {...baseProps(size)} {...rest}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon({ size = 18, className, ...rest }: IconProps): React.ReactElement {
  return (
    <svg className={className} {...baseProps(size)} {...rest}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
