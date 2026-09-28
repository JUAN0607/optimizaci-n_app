import { DEFAULT_CATEGORIES } from '@/constants/categories';
import type { RecurrenceRule } from '@/types/entities';
import { todayKey } from '@/utils/date';

import { listCategories, createCategory } from './repositories/categoryRepository';
import { createHabit } from './repositories/habitRepository';
import { logHabit } from './repositories/habitLogRepository';

/**
 * Runs once, on first launch (categories table is the guard: if it's already populated,
 * seeding is skipped). Only inserts the default categories and a few starter habits —
 * the calendar/task list stays empty so a new user never sees placeholder content that
 * looks like it belongs to someone else.
 */
export function seedIfEmpty() {
  const existing = listCategories(true);
  if (existing.length > 0) return;

  const byName = new Map<string, string>();
  for (const cat of DEFAULT_CATEGORIES) {
    const created = createCategory(cat);
    byName.set(cat.name, created.id);
  }

  const date = todayKey();
  const dailyRule: RecurrenceRule = { type: 'DAILY' };
  const weekdaysRule: RecurrenceRule = { type: 'SPECIFIC_DAYS', days: [1, 2, 3, 4, 5] };

  const meditar = createHabit({
    name: 'Meditar',
    icon: '🧘',
    categoryId: byName.get('Salud') ?? null,
    measurementType: 'CHECKBOX',
    target: null,
    targetUnit: null,
    recurrenceRule: dailyRule,
    reminder: null,
    notes: null,
  });
  logHabit(meditar.id, date, 'COMPLETED');

  createHabit({
    name: 'Beber agua',
    icon: '💧',
    categoryId: byName.get('Salud') ?? null,
    measurementType: 'QUANTITY',
    target: 8,
    targetUnit: 'vasos',
    recurrenceRule: dailyRule,
    reminder: null,
    notes: null,
  });

  createHabit({
    name: 'Leer 30 minutos',
    icon: '📖',
    categoryId: byName.get('Personal') ?? null,
    measurementType: 'DURATION',
    target: 30,
    targetUnit: 'min',
    recurrenceRule: weekdaysRule,
    reminder: null,
    notes: null,
  });

  createHabit({
    name: 'Correr 5 km',
    icon: '🏃',
    categoryId: byName.get('Salud') ?? null,
    measurementType: 'DISTANCE',
    target: 5,
    targetUnit: 'km',
    recurrenceRule: { type: 'X_TIMES_PER_WEEK', times: 3 },
    reminder: null,
    notes: null,
  });
}
