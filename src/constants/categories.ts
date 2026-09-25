import { categoryColors } from '@/theme/colors';

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
}

// Seeded once on first launch. Users can add their own afterwards.
// Icons here were previously Ionicons names that didn't match any real glyph (CategoryBadge
// never actually rendered them until the emoji system existed) — now real emoji, matching
// CATEGORY_DEFAULT_EMOJI in constants/emojis.ts.
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Universidad', icon: '🎓', color: categoryColors.Universidad },
  { name: 'Trabajo', icon: '💼', color: categoryColors.Trabajo },
  { name: 'Salud', icon: '🧘', color: categoryColors.Salud },
  { name: 'Personal', icon: '🏠', color: categoryColors.Personal },
  { name: 'Hogar', icon: '🏡', color: categoryColors.Hogar },
  { name: 'Proyectos', icon: '📁', color: categoryColors.Proyectos },
];
