// Curated emoji set for habits, routines and categories, grouped for the picker UI.
export const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Movimiento',
    emojis: ['🏋️', '🏃', '🚴', '🧘', '🤸', '⚽', '🏀', '🎾', '🏊', '🚶', '🥊', '⛹️'],
  },
  {
    label: 'Salud y mente',
    emojis: ['💧', '😴', '🧠', '❤️', '🩺', '💊', '🥗', '🍎', '🌅', '🙏', '🌿', '☀️'],
  },
  {
    label: 'Estudio y trabajo',
    emojis: ['📖', '📚', '✏️', '💻', '🧑‍💻', '📝', '🎓', '🏢', '📊', '💼', '🔬', '🧮'],
  },
  {
    label: 'Hogar y proyectos',
    emojis: ['🏠', '🏡', '🧹', '🧺', '🪴', '🔧', '📁', '🗂️', '📦', '🛒', '🍳', '🧽'],
  },
  {
    label: 'Ocio y otros',
    emojis: ['🎨', '🎵', '🎸', '📷', '✈️', '🐶', '🎮', '📱', '💰', '⭐', '🎯', '📌'],
  },
];

// Keyword → emoji, matched against a lowercased, accent-stripped habit/routine name.
// First match wins, so more specific keywords should sort before generic ones.
export const EMOJI_KEYWORDS: [string, string][] = [
  ['gimnasio', '🏋️'],
  ['ejercicio', '🏋️'],
  ['pesas', '🏋️'],
  ['correr', '🏃'],
  ['caminar', '🚶'],
  ['bici', '🚴'],
  ['ciclismo', '🚴'],
  ['nadar', '🏊'],
  ['natacion', '🏊'],
  ['yoga', '🧘'],
  ['meditar', '🧘'],
  ['meditacion', '🧘'],
  ['futbol', '⚽'],
  ['basquet', '🏀'],
  ['tenis', '🎾'],
  ['agua', '💧'],
  ['dormir', '😴'],
  ['sueno', '😴'],
  ['leer', '📖'],
  ['lectura', '📖'],
  ['libro', '📚'],
  ['estudiar', '📚'],
  ['programar', '💻'],
  ['codigo', '💻'],
  ['trabajo', '💼'],
  ['oficina', '🏢'],
  ['reunion', '📊'],
  ['escribir', '📝'],
  ['universidad', '🎓'],
  ['clase', '🎓'],
  ['limpiar', '🧹'],
  ['limpieza', '🧹'],
  ['ropa', '🧺'],
  ['planta', '🪴'],
  ['cocinar', '🍳'],
  ['comida', '🍎'],
  ['dieta', '🥗'],
  ['compras', '🛒'],
  ['musica', '🎵'],
  ['guitarra', '🎸'],
  ['dibujar', '🎨'],
  ['pintar', '🎨'],
  ['foto', '📷'],
  ['perro', '🐶'],
  ['mascota', '🐶'],
  ['ahorrar', '💰'],
  ['finanzas', '💰'],
  ['dinero', '💰'],
  ['gratitud', '🙏'],
  ['meta', '🎯'],
];

// Fallback emoji per category name, used when no keyword in the habit/routine name matches.
export const CATEGORY_DEFAULT_EMOJI: Record<string, string> = {
  Universidad: '🎓',
  Trabajo: '💼',
  Salud: '🧘',
  Personal: '🏠',
  Hogar: '🏡',
  Proyectos: '📁',
};

export const DEFAULT_EMOJI = '⭐';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Suggests an emoji for a new habit/routine: first by keyword match against the name,
 * then by the parent category's default, then a generic fallback. Purely a starting
 * point — the picker always lets the user override it.
 */
export function suggestEmoji(name: string, categoryName?: string | null): string {
  const normalized = normalize(name);
  for (const [keyword, emoji] of EMOJI_KEYWORDS) {
    if (normalized.includes(keyword)) return emoji;
  }
  if (categoryName && CATEGORY_DEFAULT_EMOJI[categoryName]) {
    return CATEGORY_DEFAULT_EMOJI[categoryName];
  }
  return DEFAULT_EMOJI;
}

// A string is treated as an Ionicons glyph name (legacy icon data from before the emoji
// system) when it looks like one of those identifiers — lowercase words and hyphens only.
// Emoji strings always contain non-ASCII code points, so they never match this.
const IONICONS_NAME_PATTERN = /^[a-z0-9-]+$/;

export function isIoniconsName(icon: string): boolean {
  return IONICONS_NAME_PATTERN.test(icon);
}
