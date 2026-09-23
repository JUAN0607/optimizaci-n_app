import { getDb, newId, nowIso } from '@/db/client';
import type { Routine, RoutineItem } from '@/types/entities';

interface RoutineRow {
  id: string;
  name: string;
  icon: string;
  is_active: number;
  created_at: string;
}

interface RoutineItemRow {
  id: string;
  routine_id: string;
  title: string;
  time: string | null;
  order: number;
  duration: number | null;
}

function routineFromRow(row: RoutineRow): Routine {
  return { id: row.id, name: row.name, icon: row.icon, isActive: row.is_active === 1, createdAt: row.created_at };
}

function itemFromRow(row: RoutineItemRow): RoutineItem {
  return {
    id: row.id,
    routineId: row.routine_id,
    title: row.title,
    time: row.time,
    order: row.order,
    duration: row.duration,
  };
}

export function listRoutines(): Routine[] {
  return getDb()
    .getAllSync<RoutineRow>('SELECT * FROM routine WHERE is_active = 1 ORDER BY created_at ASC')
    .map(routineFromRow);
}

export function searchRoutines(query: string, limit = 30): Routine[] {
  const db = getDb();
  const like = `%${query}%`;
  return db
    .getAllSync<RoutineRow>('SELECT * FROM routine WHERE is_active = 1 AND name LIKE ? ORDER BY created_at ASC LIMIT ?', [
      like,
      limit,
    ])
    .map(routineFromRow);
}

export function getRoutine(id: string): Routine | null {
  const row = getDb().getFirstSync<RoutineRow>('SELECT * FROM routine WHERE id = ?', [id]);
  return row ? routineFromRow(row) : null;
}

export function listRoutineItems(routineId: string): RoutineItem[] {
  return getDb()
    .getAllSync<RoutineItemRow>('SELECT * FROM routine_item WHERE routine_id = ? ORDER BY "order" ASC', [routineId])
    .map(itemFromRow);
}

export function createRoutine(input: { name: string; icon: string; items: Omit<RoutineItem, 'id' | 'routineId'>[] }): Routine {
  const db = getDb();
  const routine: Routine = { id: newId(), name: input.name, icon: input.icon, isActive: true, createdAt: nowIso() };
  db.withTransactionSync(() => {
    db.runSync('INSERT INTO routine (id, name, icon, is_active, created_at) VALUES (?, ?, ?, ?, ?)', [
      routine.id,
      routine.name,
      routine.icon,
      1,
      routine.createdAt,
    ]);
    input.items.forEach((item) => {
      db.runSync(
        'INSERT INTO routine_item (id, routine_id, title, time, "order", duration) VALUES (?, ?, ?, ?, ?, ?)',
        [newId(), routine.id, item.title, item.time, item.order, item.duration],
      );
    });
  });
  return routine;
}

export function updateRoutine(id: string, input: { name: string; icon?: string }): void {
  const db = getDb();
  const existing = getRoutine(id);
  if (!existing) return;
  db.runSync('UPDATE routine SET name = ?, icon = ? WHERE id = ?', [input.name, input.icon ?? existing.icon, id]);
}

export function replaceRoutineItems(routineId: string, items: Omit<RoutineItem, 'id' | 'routineId'>[]): void {
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM routine_item WHERE routine_id = ?', [routineId]);
    items.forEach((item) => {
      db.runSync(
        'INSERT INTO routine_item (id, routine_id, title, time, "order", duration) VALUES (?, ?, ?, ?, ?, ?)',
        [newId(), routineId, item.title, item.time, item.order, item.duration],
      );
    });
  });
}

export function deleteRoutine(id: string): void {
  getDb().runSync('DELETE FROM routine WHERE id = ?', [id]);
}
