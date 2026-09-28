// RITMO palette — "Starboy" moodboard: a deep, cinematic void/navy/crimson scheme.
// Do not introduce new colors here; screens should reference semantic tokens from
// `theme/index.ts` (ThemeColors), not these raw values directly.

// The RITMO logo (app icon, native splash, in-app RitmoMark) is a fixed brand mark —
// intentionally independent of the UI theme below, so it never drifts from the icon/
// splash assets already baked into the native build, regardless of theme or light/dark.
export const brandMark = {
  amber: '#CA8541',
  gold: '#DCAB35',
  teal: '#006A67',
} as const;

export const palette = {
  primary: {
    void: '#1A0F0D',
    ivory: '#F6F4EE',
  },
  secondary: {
    navy: '#0B2E66',
    navyBright: '#2F5FA8',
    crimson: '#A10F1F',
  },
  // Deliberately not from the Starboy scheme — habit streaks, success states and charts
  // read better with a warmer/brighter range than the moody primary palette allows.
  accent: {
    gold: '#DCAB35',
    teal: '#00B8A9',
    forest: '#2ECC71',
  },
  neutralLight: {
    background: '#F6F4EE',
    surface: '#FFFFFF',
    surfaceAlt: '#EDE9DF',
    border: '#DDD6C9',
    ink: '#1A0F0D',
    textSecondary: '#4A3F3A',
    textTertiary: '#8C8079',
  },
  neutralDark: {
    background: '#1A0F0D',
    surface: '#241713',
    surfaceAlt: '#2E1E18',
    border: '#3B2620',
    textPrimary: '#F6F4EE',
    textSecondary: '#C7BDB4',
    textTertiary: '#8C8079',
  },
} as const;

// Categories and charts are explicitly allowed to break from the Starboy scheme — the
// idea is a wider, more vivid range that makes the schedule and graphs pop against the
// moody brand palette, not another five shades of navy/crimson/void.
export const categoryColors = {
  Universidad: '#00B8A9',
  Trabajo: '#2F5FA8',
  Salud: '#2ECC71',
  Personal: '#F2994A',
  Hogar: '#E8598B',
  Proyectos: '#DCAB35',
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  onPrimary: string;
  onPrimaryStrong: string;
  accentGold: string;
  accentTeal: string;
  accentForest: string;
  success: string;
  overlay: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  statusPending: string;
  statusInProgress: string;
  statusCompleted: string;
  statusSkipped: string;
  statusOverdue: string;
}

export const lightColors: ThemeColors = {
  background: palette.neutralLight.background,
  surface: palette.neutralLight.surface,
  surfaceAlt: palette.neutralLight.surfaceAlt,
  border: palette.neutralLight.border,
  textPrimary: palette.neutralLight.ink,
  textSecondary: palette.neutralLight.textSecondary,
  textTertiary: palette.neutralLight.textTertiary,
  primary: palette.secondary.navy,
  primaryStrong: palette.primary.void,
  primarySoft: palette.secondary.navyBright,
  onPrimary: palette.neutralLight.surface,
  onPrimaryStrong: palette.primary.ivory,
  accentGold: palette.accent.gold,
  accentTeal: palette.accent.teal,
  accentForest: palette.accent.forest,
  success: palette.accent.forest,
  overlay: 'rgba(26, 15, 13, 0.45)',
  priorityHigh: palette.secondary.crimson,
  priorityMedium: palette.accent.gold,
  priorityLow: palette.neutralLight.textTertiary,
  statusPending: palette.neutralLight.textTertiary,
  statusInProgress: palette.accent.gold,
  statusCompleted: palette.accent.forest,
  statusSkipped: palette.neutralLight.textTertiary,
  statusOverdue: palette.secondary.crimson,
};

export const darkColors: ThemeColors = {
  background: palette.neutralDark.background,
  surface: palette.neutralDark.surface,
  surfaceAlt: palette.neutralDark.surfaceAlt,
  border: palette.neutralDark.border,
  textPrimary: palette.neutralDark.textPrimary,
  textSecondary: palette.neutralDark.textSecondary,
  textTertiary: palette.neutralDark.textTertiary,
  primary: palette.secondary.navyBright,
  primaryStrong: palette.secondary.navy,
  primarySoft: palette.secondary.navyBright,
  onPrimary: palette.primary.ivory,
  onPrimaryStrong: palette.primary.ivory,
  accentGold: palette.accent.gold,
  accentTeal: palette.accent.teal,
  accentForest: palette.accent.forest,
  success: palette.accent.forest,
  overlay: 'rgba(0, 0, 0, 0.6)',
  priorityHigh: palette.secondary.crimson,
  priorityMedium: palette.accent.gold,
  priorityLow: palette.neutralDark.textSecondary,
  statusPending: palette.neutralDark.textSecondary,
  statusInProgress: palette.accent.gold,
  statusCompleted: palette.accent.forest,
  statusSkipped: palette.neutralDark.textSecondary,
  statusOverdue: palette.secondary.crimson,
};
