// RITMO palette — strictly the 5-color "Starboy" scheme: every color anywhere in the
// theme (including categories and charts) is one of these 5 or a tonal variant of one of
// their 3 hue families (void/brown, navy, crimson). Nothing outside this palette.
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

// The streak "flame" is always this exact amber, in both themes — it reads as a warm,
// consistent signal (and matches the logo's own gold ring) rather than shifting tone
// with the rest of the palette.
export const flameColor = brandMark.gold;

export const palette = {
  // Primario 45% — dominant background/base color.
  void: {
    base: '#1A0F0D',
    mid: '#4A3226',
    light: '#7A5A44',
  },
  // Secundario 25% — primary interactive accent (buttons, active elements).
  navy: {
    base: '#0B2E66',
    mid: '#3D6FB4',
    light: '#6E96D0',
  },
  // Acento 15% — attention/important elements (reminders, overdue, high priority).
  crimson: {
    base: '#A10F1F',
    mid: '#C93646',
    light: '#E37079',
  },
  // Neutro claro 10% — light-mode surfaces, and (per spec) dark-mode primary text.
  ivory: '#F6F4EE',
  // Neutro oscuro 5% — light-mode primary text/icons/high-emphasis contrast.
  black: '#000000',
} as const;

// Categories and charts stay inside the same 3 hue families (void/brown, navy, crimson)
// as the rest of the palette, just at different tones so they're still distinguishable.
export const categoryColors = {
  Universidad: palette.navy.base,
  Trabajo: palette.crimson.base,
  Salud: palette.void.light,
  Personal: palette.navy.mid,
  Hogar: palette.crimson.mid,
  Proyectos: palette.void.mid,
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
  background: palette.ivory,
  surface: '#FFFFFF',
  surfaceAlt: '#EDEAE2',
  border: '#DDD8CC',
  textPrimary: palette.black,
  textSecondary: '#3D3733',
  textTertiary: '#7A736A',
  primary: palette.navy.base,
  primaryStrong: palette.void.base,
  primarySoft: palette.navy.mid,
  onPrimary: '#FFFFFF',
  onPrimaryStrong: palette.ivory,
  accentGold: flameColor,
  accentTeal: palette.navy.mid,
  accentForest: palette.void.mid,
  success: palette.navy.base,
  overlay: 'rgba(26, 15, 13, 0.45)',
  priorityHigh: palette.crimson.base,
  priorityMedium: palette.crimson.mid,
  priorityLow: '#7A736A',
  statusPending: '#7A736A',
  statusInProgress: palette.crimson.mid,
  statusCompleted: palette.navy.base,
  statusSkipped: '#7A736A',
  statusOverdue: palette.crimson.base,
};

export const darkColors: ThemeColors = {
  background: palette.void.base,
  surface: '#241713',
  surfaceAlt: '#2E1E18',
  border: '#3B2620',
  textPrimary: palette.ivory,
  textSecondary: '#C7BDB4',
  textTertiary: '#8C8079',
  primary: palette.navy.mid,
  primaryStrong: palette.navy.base,
  primarySoft: palette.navy.light,
  onPrimary: palette.ivory,
  onPrimaryStrong: palette.ivory,
  accentGold: flameColor,
  accentTeal: palette.navy.light,
  accentForest: palette.void.light,
  success: palette.navy.light,
  overlay: 'rgba(0, 0, 0, 0.6)',
  priorityHigh: palette.crimson.mid,
  priorityMedium: palette.crimson.light,
  priorityLow: '#8C8079',
  statusPending: '#8C8079',
  statusInProgress: palette.crimson.light,
  statusCompleted: palette.navy.light,
  statusSkipped: '#8C8079',
  statusOverdue: palette.crimson.mid,
};
