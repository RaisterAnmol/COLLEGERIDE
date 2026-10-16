/**
 * CampusRide Design System Tokens — Campus Atlas (v2)
 * Master source of truth for color palettes, typography, spacing, shadows, and motion curves.
 */

export const color = {
  // Canvas & Surfaces
  canvas: {
    DEFAULT: "#F7F5F0",
    warm: "#F7F5F0",
  },
  surface: {
    DEFAULT: "#FFFDFC",
    paper: "#FFFDFC",
    raised: "#FFFFFF",
    inverse: "#111614",
  },
  background: {
    base: "#F7F5F0",
    canvas: "#F7F5F0",
    surface: "#FFFDFC",
    raised: "#FFFFFF",
    inverse: "#18201D",
    subtle: "#EAE7DF",
  },

  // Foregrounds & Inks
  foreground: {
    primary: "#18201D",
    secondary: "#5F6964",
    muted: "#8A938E",
    inverse: "#F7F5F0",
  },
  ink: {
    primary: "#18201D",
    secondary: "#5F6964",
    muted: "#8A938E",
  },

  // Brand / Route Palette (Deep Route Forest)
  brand: {
    primary: "#143D32",
    primaryHover: "#0F2E26",
    subtle: "#EDF5F2",
    border: "#20594B",
    route: "#143D32",
    routeLight: "#2D6A4F",
    routePale: "#EDF5F2",
  },
  route: {
    DEFAULT: "#143D32",
    light: "#2D6A4F",
    pale: "#EDF5F2",
  },

  // Signal & Emergency
  signal: {
    amber: "#D97706",
    amberBg: "#FEF3C7",
    crimson: "#DC2626",
    crimsonBg: "#FEE2E2",
  },
  accent: {
    primary: "#143D32",
    primaryHover: "#0F2E26",
    amber: "#D97706",
    crimson: "#DC2626",
    subtle: "#EDF5F2",
  },

  // Status & Verification
  status: {
    success: "#16A34A",
    successSubtle: "#DCFCE7",
    verified: "#16A34A",
    verifiedSubtle: "#DCFCE7",
    warning: "#D97706",
    warningSubtle: "#FEF3C7",
    danger: "#DC2626",
    dangerSubtle: "#FEE2E2",
    emergency: "#DC2626",
    info: "#4F8098",
    infoSubtle: "#E0F2FE",
  },

  // Borders & Linework
  line: {
    subtle: "#EAE7DF",
    base: "#DDD9CE",
    strong: "#B5B0A4",
  },
  border: {
    subtle: "#EAE7DF",
    base: "#DDD9CE",
    strong: "#B5B0A4",
    focus: "#143D32",
  },
} as const;

export const fontFamily = {
  display: '"Fraunces", "Plus Jakarta Sans", "Inter", serif',
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"Space Mono", "JetBrains Mono", monospace',
} as const;

export const typography = {
  fonts: fontFamily,
  display: {
    fontFamily: fontFamily.display,
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
    fontWeight: "700",
    letterSpacing: "-0.02em",
  },
  h1: {
    fontFamily: fontFamily.display,
    fontSize: "clamp(2rem, 3.5vw, 3rem)",
    fontWeight: "700",
    letterSpacing: "-0.02em",
  },
  h2: {
    fontFamily: fontFamily.display,
    fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
    fontWeight: "600",
    letterSpacing: "-0.015em",
  },
  h3: {
    fontFamily: fontFamily.display,
    fontSize: "1.5rem",
    fontWeight: "600",
    letterSpacing: "-0.01em",
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: "1rem",
    lineHeight: "1.5",
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: "0.875rem",
  },
} as const;

export const type = {
  display: "clamp(2.5rem, 5vw, 4.5rem)",
  h1: "clamp(2rem, 3.5vw, 3rem)",
  h2: "clamp(1.5rem, 2.5vw, 2.25rem)",
  h3: "1.5rem",
  h4: "1.25rem",
  bodyLarge: "1.125rem",
  body: "1rem",
  small: "0.875rem",
  caption: "0.75rem",
  tiny: "0.6875rem",
  fontFamily,
} as const;

export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const shadow = {
  subtle: "0 1px 2px 0 rgba(24, 32, 29, 0.04)",
  card: "0 1px 3px 0 rgba(24, 32, 29, 0.05), 0 1px 2px -1px rgba(24, 32, 29, 0.03)",
  ticket: "0 1px 1px rgba(24, 32, 29, 0.08), 0 4px 12px rgba(24, 32, 29, 0.05)",
  sm: "0 1px 2px rgba(24, 32, 29, 0.04)",
  md: "0 4px 12px rgba(24, 32, 29, 0.08)",
  lg: "0 12px 32px rgba(24, 32, 29, 0.12)",
  cardHover: "0 4px 16px rgba(20, 61, 50, 0.08)",
} as const;

export const radius = {
  none: "0px",
  ticket: "6px",
  control: "8px",
  sm: "6px",
  md: "10px",
  surface: "16px",
  lg: "16px",
  xl: "24px",
  pill: "9999px",
  full: "9999px",
} as const;

export const motion = {
  duration: {
    instant: 0,
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
    deliberate: 0.6,
  },
  ease: {
    out: [0.16, 1, 0.3, 1],
    inOut: [0.65, 0, 0.35, 1],
    utility: [0.22, 0.8, 0.3, 1],
    spring: { damping: 25, stiffness: 300 },
  },
} as const;
