import { DEFAULT_CATEGORIES } from '@/constants/categories';
import type { RecurrenceRule } from '@/types/entities';
import { todayKey } from '@/utils/date';

import { createActivity, setActivityStatus } from './repositories/activityRepository';
import { listCategories, createCategory } from './repositories/categoryRepository';
import { createHabit } from './repositories/habitRepository';
import { logHabit } from './repositories/habitLogRepository';

/**
 * Runs once, on first launch (categories table is the guard: if it's already populated,
 * seeding is skipped). Inserts the default categories always, and a realistic sample day
 * so Hoy isn't empty before the user has planned anything themselves.
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
  const sampleActivities: {
    title: string;
    category: string;
    type: 'TASK' | 'EVENT';
    startTime: string;
    endTime: string;
    completed?: boolean;
  }[] = [
    { title: 'Cálculo Multivariado', category: 'Universidad', type: 'EVENT', startTime: '07:00', endTime: '09:00', completed: true },
    { title: 'Procesamiento de Imágenes', category: 'Universidad', type: 'EVENT', startTime: '09:00', endTime: '11:00', completed: true },
    { title: 'Almuerzo', category: 'Personal', type: 'EVENT', startTime: '12:00', endTime: '12:30', completed: true },
    { title: 'Física Moderna', category: 'Universidad', type: 'EVENT', startTime: '15:00', endTime: '17:00' },
    { title: 'Gimnasio', category: 'Salud', type: 'TASK', startTime: '18:00', endTime: '19:00' },
    { title: 'Leer', category: 'Personal', type: 'TASK', startTime: '20:00', endTime: '20:30' },
    { title: 'Proyecto personal', category: 'Proyectos', type: 'TASK', startTime: '20:30', endTime: '22:00' },
  ];

  for (const item of sampleActivities) {
    const activity = createActivity({
      title: item.title,
      notes: null,
      type: item.type,
      categoryId: byName.get(item.category) ?? null,
      date,
      startTime: item.startTime,
      endTime: item.endTime,
      duration: null,
      priority: null,
      recurrenceRule: null,
      reminder: null,
      location: null,
    });
    if (item.completed) {
      setActivityStatus(activity.id, 'COMPLETED');
    }
  }

  const dailyRule: RecurrenceRule = { type: 'DAILY' };
  const weekdaysRule: RecurrenceRule = { type: 'SPECIFIC_DAYS', days: [1, 2, 3, 4, 5] };

  const meditar = createHabit({
    name: 'Meditar',
    icon: 'lotus',
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
    icon: 'droplet',
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
    icon: 'book',
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
    icon: 'run',
    categoryId: byName.get('Salud') ?? null,
    measurementType: 'DISTANCE',
    target: 5,
    targetUnit: 'km',
    recurrenceRule: { type: 'X_TIMES_PER_WEEK', times: 3 },
    reminder: null,
    notes: null,
  });
}
