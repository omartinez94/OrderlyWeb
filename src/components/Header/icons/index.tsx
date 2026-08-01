/**
 * Header icons — single source of truth for icons used by Header slot components.
 * Centralizes the icon assets using `lucide-react` components under the hood,
 * ensuring consistency, tree-shakability, and styling compliance.
 *
 * Slot components import them and pass `size` / `className` / other SVG props.
 * Default sizes align with the original design specifications:
 * - BellIcon: 18px
 * - UserIcon: 16px
 * - LogoutIcon: 16px
 * - CheckIcon: 32px
 * - ChevronIcon: 14px
 * - SunIcon: 18px
 * - MoonIcon: 18px
 */

import * as React from "react";
import { Bell, User, LogOut, CheckCircle, ChevronDown, Sun, Moon } from "lucide-react";
import type { LucideProps } from "lucide-react";

export type IconProps = LucideProps;

export function BellIcon({ size = 18, ...props }: IconProps): React.ReactElement {
  return <Bell size={size} {...props} />;
}

export function UserIcon({ size = 16, ...props }: IconProps): React.ReactElement {
  return <User size={size} {...props} />;
}

export function LogoutIcon({ size = 16, ...props }: IconProps): React.ReactElement {
  return <LogOut size={size} {...props} />;
}

export function CheckIcon({ size = 32, ...props }: IconProps): React.ReactElement {
  return <CheckCircle size={size} {...props} />;
}

export function ChevronIcon({ size = 14, ...props }: IconProps): React.ReactElement {
  return <ChevronDown size={size} {...props} />;
}

export function SunIcon({ size = 18, ...props }: IconProps): React.ReactElement {
  return <Sun size={size} {...props} />;
}

export function MoonIcon({ size = 18, ...props }: IconProps): React.ReactElement {
  return <Moon size={size} {...props} />;
}
