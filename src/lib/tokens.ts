/**
 * Orderly Web — design tokens (TypeScript).
 *
 * Mirrors src/index.css custom properties. Use this module when you need
 * a concrete hex string at runtime (Recharts series colors, canvas fills,
 * inline styles that JS computes dynamically), or when iterating over the
 * palette to render a swatch grid / dropdown.
 *
 * For static styling, prefer Tailwind utilities (e.g. `bg-primary`,
 * `text-ink`) — they read from the same CSS variables and respect the
 * light/dark theme automatically.
 *
 * Keep this file in sync with src/index.css.
 */

export const fonts = {
  /** MuseoModerno — display, headline, title, any contrasting text. */
  display: "'MuseoModerno', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  /** Urbanist — body, descriptions, long-form content, small UI text. */
  body: "'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  /** System mono — timestamps, IDs, measurement readouts. */
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
} as const;

export type FontToken = keyof typeof fonts;

export const colors = {
  // --- Brand ---
  primary: "#1F4254",
  primaryHover: "#16303D",
  primaryForeground: "#FFFFFF",

  accent: "#F26A3A",
  accentHover: "#D8582C",
  accentForeground: "#FFFFFF",

  // --- Neutral: ink ---
  ink: "#0E141A",
  inkMuted: "#4A5560",
  inkSubtle: "#7A8590",

  // --- Neutral: surface (sage-tinted) ---
  surface: "#EFF1ED",
  surfaceElevated: "#F6F8F4",
  surfaceOverlay: "#FFFFFF",
  borderSubtle: "#D8DED5",
  borderStrong: "#B8C0B2",

  // --- Service hues (status gradient stops) ---
  serviceDeep: "#1F4254",
  serviceTeal: "#4A8B98",
  serviceAqua: "#7AB89E",
  serviceAmber: "#E8A340",
  serviceTangerine: "#F26A3A",

  // --- Semantic states ---
  success: "#4A8870",
  warning: "#E8A340",
  danger: "#C84A3A",
  info: "#4A8B98",
} as const;

export const darkColors = {
  // --- Brand (lifted for dark contrast) ---
  primary: "#4A8B98",
  primaryHover: "#5FA0AE",
  primaryForeground: "#0E141A",

  accent: "#FF8A5A",
  accentHover: "#FFA478",
  accentForeground: "#0E141A",

  // --- Neutral: ink (light text on dark) ---
  ink: "#ECF0F2",
  inkMuted: "#A8B2BC",
  inkSubtle: "#6E7984",

  // --- Neutral: surface (deep near-black) ---
  surface: "#0E141A",
  surfaceElevated: "#152028",
  surfaceOverlay: "#1C2832",
  borderSubtle: "#1F2A33",
  borderStrong: "#2F3D48",

  // --- Service hues (lifted) ---
  serviceDeep: "#4A8B98",
  serviceTeal: "#6BA5B0",
  serviceAqua: "#98C9B0",
  serviceAmber: "#F0B560",
  serviceTangerine: "#FF8A5A",

  success: "#6BA88E",
  warning: "#F0B560",
  danger: "#E87060",
  info: "#6BA5B0",
} as const;

export type ColorToken = keyof typeof colors;

/**
 * A single entry in the palette. Used by App.tsx to render swatch grids
 * and any other UI that needs to iterate over the whole palette.
 */
export interface PaletteEntry {
  /** Token name, matches the CSS variable suffix and Tailwind class. */
  name: string;
  /** Tailwind background utility, e.g. 'bg-primary'. */
  twBg: string;
  /** Tailwind text utility, e.g. 'text-white' or 'text-ink'. */
  twText: string;
  /** Add a 1px subtle border — useful for light-on-light swatches. */
  border?: boolean;
  /** Hex value in light theme. */
  light: string;
  /** Hex value in dark theme. */
  dark: string;
}

export const brandPalette: PaletteEntry[] = [
  {
    name: "primary",
    twBg: "bg-primary",
    twText: "text-primary-foreground",
    light: colors.primary,
    dark: darkColors.primary,
  },
  {
    name: "accent",
    twBg: "bg-accent",
    twText: "text-accent-foreground",
    light: colors.accent,
    dark: darkColors.accent,
  },
  {
    name: "ink",
    twBg: "bg-ink",
    twText: "text-primary-foreground",
    border: true,
    light: colors.ink,
    dark: darkColors.ink,
  },
  {
    name: "surface",
    twBg: "bg-surface",
    twText: "text-ink",
    border: true,
    light: colors.surface,
    dark: darkColors.surface,
  },
];

export const servicePalette: PaletteEntry[] = [
  {
    name: "service-deep",
    twBg: "bg-service-deep",
    twText: "text-white",
    light: colors.serviceDeep,
    dark: darkColors.serviceDeep,
  },
  {
    name: "service-teal",
    twBg: "bg-service-teal",
    twText: "text-white",
    light: colors.serviceTeal,
    dark: darkColors.serviceTeal,
  },
  {
    name: "service-aqua",
    twBg: "bg-service-aqua",
    twText: "text-white",
    light: colors.serviceAqua,
    dark: darkColors.serviceAqua,
  },
  {
    name: "service-amber",
    twBg: "bg-service-amber",
    twText: "text-white",
    light: colors.serviceAmber,
    dark: darkColors.serviceAmber,
  },
  {
    name: "service-tangerine",
    twBg: "bg-service-tangerine",
    twText: "text-white",
    light: colors.serviceTangerine,
    dark: darkColors.serviceTangerine,
  },
];

export const gradients = {
  /** Service gradient — cool side: order received flow. */
  serviceCool: `linear-gradient(90deg, ${colors.serviceDeep} 0%, ${colors.serviceTeal} 50%, ${colors.serviceAqua} 100%)`,
  /** Service gradient — warm side: order ready flow. */
  serviceWarm: `linear-gradient(90deg, ${colors.surface} 0%, ${colors.serviceAmber} 50%, ${colors.serviceTangerine} 100%)`,
  /** Signature brand gradient — primary → accent. */
  primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
} as const;

export type GradientToken = keyof typeof gradients;

export const shadows = {
  glowPrimary: `0 0 16px ${colors.primary}`,
  glowAccent: `0 0 16px ${colors.accent}`,
} as const;

export type ShadowToken = keyof typeof shadows;
