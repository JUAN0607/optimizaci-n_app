// RITMO palette — exact hex values from the product spec. Do not introduce new colors here;
// screens should reference semantic tokens from `theme/index.ts`, not these raw values directly.

export const palette = {
  primary: {
    espresso: '#482C21',
    caramel: '#9C5F2C',
    amber: '#CA8541',
    cream: '#F2F2DC',
  },
  secondary: {
    forest: '#3E6231',
    teal: '#006A67',
    gold: '#DCAB35',
  },
  neutralLight: {
    white: '#FFFFFF',
    black: '#000000',
    background: '#FAF9F4',
    ink: '#241B17',
    textSecondary: '#6F625A',
    textTertiary: '#A99F98',
    border: '#E5DED4',
  },
  neutralDark: {
    background: '#171310',
    surface: '#241B17',
    surfaceAlt: '#30231C',
    textPrimary: '#F2F2DC',
    textSecondary: '#BDB0A5',
  },
} as const;

export const categoryColors = {
  Universidad: '#006A67',
  Trabajo: '#482C21',
  Salud: '#3E6231',
  Personal: '#CA8541',
  Hogar: '#9C5F2C',
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
  surface: palette.neutralLight.white,
  surfaceAlt: palette.primary.cream,
  border: palette.neutralLight.border,
  textPrimary: palette.neutralLight.ink,
  textSecondary: palette.neutralLight.textSecondary,
  textTertiary: palette.neutralLight.textTertiary,
  primary: palette.primary.caramel,
  primaryStrong: palette.primary.espresso,
  primarySoft: palette.primary.amber,
  onPrimary: palette.neutralLight.white,
  onPrimaryStrong: palette.primary.cream,
  accentGold: palette.secondary.gold,
  accentTeal: palette.secondary.teal,
  accentForest: palette.secondary.forest,
  success: palette.secondary.forest,
  overlay: 'rgba(36, 27, 23, 0.4)',
  priorityHigh: palette.primary.espresso,
  priorityMedium: palette.primary.caramel,
  priorityLow: palette.neutralLight.textTertiary,
  statusPending: palette.neutralLight.textTertiary,
  statusInProgress: palette.secondary.gold,
  statusCompleted: palette.secondary.forest,
  statusSkipped: palette.neutralLight.textTertiary,
  statusOverdue: palette.primary.espresso,
};

export const darkColors: ThemeColors = {
  background: palette.neutralDark.background,
  surface: palette.neutralDark.surface,
  surfaceAlt: palette.neutralDark.surfaceAlt,
  border: palette.neutralDark.surfaceAlt,
  textPrimary: palette.neutralDark.textPrimary,
  textSecondary: palette.neutralDark.textSecondary,
  textTertiary: palette.neutralDark.textSecondary,
  primary: palette.primary.amber,
  primaryStrong: palette.primary.cream,
  primarySoft: palette.primary.caramel,
  onPrimary: palette.neutralDark.background,
  onPrimaryStrong: palette.neutralDark.background,
  accentGold: palette.secondary.gold,
  accentTeal: palette.secondary.teal,
  accentForest: palette.secondary.forest,
  success: palette.secondary.forest,
  overlay: 'rgba(0, 0, 0, 0.6)',
  priorityHigh: palette.primary.amber,
  priorityMedium: palette.primary.caramel,
  priorityLow: palette.neutralDark.textSecondary,
  statusPending: palette.neutralDark.textSecondary,
  statusInProgress: palette.secondary.gold,
  statusCompleted: palette.secondary.forest,
  statusSkipped: palette.neutralDark.textSecondary,
  statusOverdue: palette.primary.amber,
};
