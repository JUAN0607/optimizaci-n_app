import { getDb, newId, nowIso } from '@/db/client';
import type { HabitLog } from '@/types/entities';

interface HabitLogRow {
  id: string;
  habit_id: string;
  date: string;
  status: string;
  value: number | null;
  created_at: string;
}

function fromRow(row: HabitLogRow): HabitLog {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    status: row.status as HabitLog['status'],
    value: row.value,
    createdAt: row.created_at,
  };
}

export function listLogsForHabit(habitId: string): HabitLog[] {
  const db = getDb();
  return db
    .getAllSync<HabitLogRow>('SELECT * FROM habit_log WHERE habit_id = ? ORDER BY date ASC', [habitId])
    .map(fromRow);
}

export function listLogsInRange(startDate: string, endDate: string): HabitLog[] {
  const db = getDb();
  return db
    .getAllSync<HabitLogRow>('SELECT * FROM habit_log WHERE date >= ? AND date <= ? ORDER BY date ASC', [
      startDate,
      endDate,
    ])
    .map(fromRow);
}

export function getLogForDate(habitId: string, date: string): HabitLog | null {
  const row = getDb().getFirstSync<HabitLogRow>('SELECT * FROM habit_log WHERE habit_id = ? AND date = ?', [
    habitId,
    date,
  ]);
  return row ? fromRow(row) : null;
}

// Upsert: a habit has at most one log per calendar date.
export function logHabit(habitId: string, date: string, status: HabitLog['status'], value: number | null = null): HabitLog {
  const db = getDb();
  const existing = getLogForDate(habitId, date);
  if (existing) {
    db.runSync('UPDATE habit_log SET status = ?, value = ? WHERE id = ?', [status, value, existing.id]);
    return { ...existing, status, value };
  }
  const log: HabitLog = { id: newId(), habitId, date, status, value, createdAt: nowIso() };
  db.runSync('INSERT INTO habit_log (id, habit_id, date, status, value, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    log.id,
    log.habitId,
    log.date,
    log.status,
    log.value,
    log.createdAt,
  ]);
  return log;
}

export function deleteLog(habitId: string, date: string): void {
  getDb().runSync('DELETE FROM habit_log WHERE habit_id = ? AND date = ?', [habitId, date]);
}
