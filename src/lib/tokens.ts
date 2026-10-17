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
  primary: "#0F172A",
  primaryHover: "#1E293B",
  primaryForeground: "#F8FAFC",

  accent: "#EA580C",
  accentHover: "#C2410C",
  accentForeground: "#FFFFFF",

  // --- Neutral: ink ---
  ink: "#0F172A",
  inkMuted: "#475569",
  inkSubtle: "#64748B",

  // --- Neutral: surface (brushed stainless) ---
  surface: "#F1F5F9",
  surfaceElevated: "#FFFFFF",
  surfaceOverlay: "#FFFFFF",
  borderSubtle: "#E2E8F0",
  borderStrong: "#94A3B8",

  // --- Service hues (status gradient stops) ---
  serviceDeep: "#1D4ED8",
  serviceTeal: "#0284C7",
  serviceAqua: "#0D9488",
  serviceAmber: "#D97706",
  serviceTangerine: "#EA580C",

  // --- Semantic states ---
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#0284C7",
} as const;

export const darkColors = {
  // --- Brand (lifted for dark contrast) ---
  primary: "#38BDF8",
  primaryHover: "#7DD3FC",
  primaryForeground: "#0B0F14",

  accent: "#FB923C",
  accentHover: "#FDBA74",
  accentForeground: "#0B0F14",

  // --- Neutral: ink (light text on dark) ---
  ink: "#F8FAFC",
  inkMuted: "#94A3B8",
  inkSubtle: "#64748B",

  // --- Neutral: surface (cast iron & smoked carbon) ---
  surface: "#0B0F14",
  surfaceElevated: "#141B22",
  surfaceOverlay: "#1C2530",
  borderSubtle: "#212C37",
  borderStrong: "#374756",

  // --- Service hues (lifted) ---
  serviceDeep: "#60A5FA",
  serviceTeal: "#38BDF8",
  serviceAqua: "#2DD4BF",
  serviceAmber: "#FBBF24",
  serviceTangerine: "#FB923C",

  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  info: "#38BDF8",
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
