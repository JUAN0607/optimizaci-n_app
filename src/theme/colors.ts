// RITMO palette — built around the teal already in the app's own logo mark, so the
// brand feels like one coherent identity instead of a UI color scheme layered on top
// of an unrelated icon. Warm, soft neutrals (not stark white / not pure black) carry
// both themes; teal is the single interactive accent color across light and dark.
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
  teal: {
    900: '#134E4A', // deep — filled cards (primaryStrong in light mode)
    700: '#0F766E', // base — buttons/links (primary in light mode)
    600: '#0D9488', // chart accent
    400: '#2DD4BF', // bright — primary in dark mode, pops on dark surfaces
    300: '#5EEAD4', // soft — highlights, primarySoft
  },
  warm: {
    amber600: '#D97706', // light-mode gold accent
    amber400: '#FBBF24', // dark-mode gold accent
    green600: '#16A34A', // light-mode success
    green400: '#4ADE80', // dark-mode success
    red600: '#DC2626',   // light-mode attention/overdue
    red400: '#F87171',   // dark-mode attention/overdue
  },
  neutralLight: {
    background: '#FAF9F6',
    surface: '#FFFFFF',
    surfaceAlt: '#F1EFE9',
    border: '#E4E1D9',
    ink: '#1B1B18',
    textSecondary: '#635F57',
    textTertiary: '#9C978C',
  },
  neutralDark: {
    background: '#0E1416',
    surface: '#161D1F',
    surfaceAlt: '#1E2629',
    border: '#2B3538',
    textPrimary: '#F2F0EB',
    textSecondary: '#B7B2A9',
    textTertiary: '#7D7972',
  },
} as const;

// Categories and charts are intentionally off the brand's teal — a wider, more vivid
// qualitative range keeps the schedule and graphs easy to tell apart at a glance and
// avoids competing with teal's meaning as the interactive/brand accent everywhere else.
export const categoryColors = {
  Universidad: '#6366F1', // indigo
  Trabajo: '#F97316',     // orange
  Salud: '#22C55E',       // green
  Personal: '#EC4899',    // pink
  Hogar: '#F59E0B',       // amber
  Proyectos: '#A855F7',   // purple
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
  primary: palette.teal[700],
  primaryStrong: palette.teal[900],
  primarySoft: palette.teal[400],
  onPrimary: palette.neutralLight.surface,
  onPrimaryStrong: palette.neutralLight.surface,
  accentGold: palette.warm.amber600,
  accentTeal: palette.teal[600],
  accentForest: palette.warm.green600,
  success: palette.warm.green600,
  overlay: 'rgba(27, 27, 24, 0.45)',
  priorityHigh: palette.warm.red600,
  priorityMedium: palette.warm.amber600,
  priorityLow: palette.neutralLight.textTertiary,
  statusPending: palette.neutralLight.textTertiary,
  statusInProgress: palette.warm.amber600,
  statusCompleted: palette.warm.green600,
  statusSkipped: palette.neutralLight.textTertiary,
  statusOverdue: palette.warm.red600,
};

export const darkColors: ThemeColors = {
  background: palette.neutralDark.background,
  surface: palette.neutralDark.surface,
  surfaceAlt: palette.neutralDark.surfaceAlt,
  border: palette.neutralDark.border,
  textPrimary: palette.neutralDark.textPrimary,
  textSecondary: palette.neutralDark.textSecondary,
  textTertiary: palette.neutralDark.textTertiary,
  primary: palette.teal[400],
  primaryStrong: palette.teal[700],
  primarySoft: palette.teal[300],
  onPrimary: palette.neutralDark.background,
  onPrimaryStrong: palette.neutralDark.textPrimary,
  accentGold: palette.warm.amber400,
  accentTeal: palette.teal[300],
  accentForest: palette.warm.green400,
  success: palette.warm.green400,
  overlay: 'rgba(0, 0, 0, 0.6)',
  priorityHigh: palette.warm.red400,
  priorityMedium: palette.warm.amber400,
  priorityLow: palette.neutralDark.textSecondary,
  statusPending: palette.neutralDark.textSecondary,
  statusInProgress: palette.warm.amber400,
  statusCompleted: palette.warm.green400,
  statusSkipped: palette.neutralDark.textSecondary,
  statusOverdue: palette.warm.red400,
};
