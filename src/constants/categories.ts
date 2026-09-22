import { categoryColors } from '@/theme/colors';

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
}

// Seeded once on first launch. Users can add their own afterwards.
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Universidad', icon: 'graduation-cap', color: categoryColors.Universidad },
  { name: 'Trabajo', icon: 'briefcase', color: categoryColors.Trabajo },
  { name: 'Salud', icon: 'heart-pulse', color: categoryColors.Salud },
  { name: 'Personal', icon: 'user', color: categoryColors.Personal },
  { name: 'Hogar', icon: 'home', color: categoryColors.Hogar },
  { name: 'Proyectos', icon: 'rocket', color: categoryColors.Proyectos },
];
