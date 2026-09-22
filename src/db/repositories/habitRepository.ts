import { getDb, newId, nowIso } from '@/db/client';
import type { Habit, ReminderConfig, RecurrenceRule } from '@/types/entities';

interface HabitRow {
  id: string;
  name: string;
  icon: string;
  category_id: string | null;
  measurement_type: string;
  target: number | null;
  target_unit: string | null;
  recurrence_rule: string;
  reminder: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
}

function fromRow(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    categoryId: row.category_id,
    measurementType: row.measurement_type as Habit['measurementType'],
    target: row.target,
    targetUnit: row.target_unit,
    recurrenceRule: JSON.parse(row.recurrence_rule) as RecurrenceRule,
    reminder: row.reminder ? (JSON.parse(row.reminder) as ReminderConfig) : null,
    notes: row.notes,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

export type HabitInput = Omit<Habit, 'id' | 'createdAt' | 'isActive'>;

export function listHabits(includeInactive = false): Habit[] {
  const db = getDb();
  const rows = includeInactive
    ? db.getAllSync<HabitRow>('SELECT * FROM habit ORDER BY created_at ASC')
    : db.getAllSync<HabitRow>('SELECT * FROM habit WHERE is_active = 1 ORDER BY created_at ASC');
  return rows.map(fromRow);
}

export function getHabit(id: string): Habit | null {
  const row = getDb().getFirstSync<HabitRow>('SELECT * FROM habit WHERE id = ?', [id]);
  return row ? fromRow(row) : null;
}

export function createHabit(input: HabitInput): Habit {
  const db = getDb();
  const habit: Habit = { ...input, id: newId(), isActive: true, createdAt: nowIso() };
  db.runSync(
    `INSERT INTO habit
      (id, name, icon, category_id, measurement_type, target, target_unit, recurrence_rule, reminder, notes, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      habit.id,
      habit.name,
      habit.icon,
      habit.categoryId,
      habit.measurementType,
      habit.target,
      habit.targetUnit,
      JSON.stringify(habit.recurrenceRule),
      habit.reminder ? JSON.stringify(habit.reminder) : null,
      habit.notes,
      1,
      habit.createdAt,
    ],
  );
  return habit;
}

export function updateHabit(id: string, input: Partial<HabitInput & { isActive: boolean }>): void {
  const db = getDb();
  const existing = getHabit(id);
  if (!existing) return;
  const merged = { ...existing, ...input };
  db.runSync(
    `UPDATE habit SET name = ?, icon = ?, category_id = ?, measurement_type = ?, target = ?, target_unit = ?,
       recurrence_rule = ?, reminder = ?, notes = ?, is_active = ? WHERE id = ?`,
    [
      merged.name,
      merged.icon,
      merged.categoryId,
      merged.measurementType,
      merged.target,
      merged.targetUnit,
      JSON.stringify(merged.recurrenceRule),
      merged.reminder ? JSON.stringify(merged.reminder) : null,
      merged.notes,
      merged.isActive ? 1 : 0,
      id,
    ],
  );
}

export function deleteHabit(id: string): void {
  getDb().runSync('DELETE FROM habit WHERE id = ?', [id]);
}
