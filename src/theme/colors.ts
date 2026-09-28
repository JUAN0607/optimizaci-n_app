// RITMO palette — strictly the 5-color "Starboy" scheme: every color anywhere in the
// theme (including categories and charts) is one of these 5 or a tonal variant of one of
// their 3 hue families (void/brown, navy, crimson). Nothing outside this palette.
// Do not introduce new colors here; screens should reference semantic tokens from
// `theme/index.ts` (ThemeColors), not these raw values directly.

// The streak "flame" is always this exact amber, in both themes — it reads as a warm,
// consistent signal rather than shifting tone with the rest of the palette.
export const flameColor = '#DCAB35';

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
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F3F1',
  border: '#E4E3E0',
  textPrimary: palette.black,
  textSecondary: '#3D3D3D',
  textTertiary: '#7A7A7A',
  primary: palette.navy.base,
  primaryStrong: palette.black,
  primarySoft: palette.navy.mid,
  onPrimary: '#FFFFFF',
  onPrimaryStrong: '#FFFFFF',
  accentGold: flameColor,
  accentTeal: palette.navy.mid,
  accentForest: palette.void.mid,
  success: palette.navy.base,
  overlay: 'rgba(0, 0, 0, 0.45)',
  priorityHigh: palette.crimson.base,
  priorityMedium: palette.crimson.mid,
  priorityLow: '#7A7A7A',
  statusPending: '#7A7A7A',
  statusInProgress: palette.crimson.mid,
  statusCompleted: palette.navy.base,
  statusSkipped: '#7A7A7A',
  statusOverdue: palette.crimson.base,
};

export const darkColors: ThemeColors = {
  background: palette.black,
  surface: '#121212',
  surfaceAlt: '#1C1C1C',
  border: '#2A2A2A',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  primary: palette.navy.mid,
  primaryStrong: palette.navy.base,
  primarySoft: palette.navy.light,
  onPrimary: '#FFFFFF',
  onPrimaryStrong: '#FFFFFF',
  accentGold: flameColor,
  accentTeal: palette.navy.light,
  accentForest: palette.void.light,
  success: palette.navy.light,
  overlay: 'rgba(0, 0, 0, 0.7)',
  priorityHigh: palette.crimson.mid,
  priorityMedium: palette.crimson.light,
  priorityLow: '#808080',
  statusPending: '#808080',
  statusInProgress: palette.crimson.light,
  statusCompleted: palette.navy.light,
  statusSkipped: '#808080',
  statusOverdue: palette.crimson.mid,
};
