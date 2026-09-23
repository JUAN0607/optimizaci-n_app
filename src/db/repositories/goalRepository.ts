import { getDb, newId, nowIso } from '@/db/client';
import type { Goal } from '@/types/entities';

interface GoalRow {
  id: string;
  title: string;
  target: number;
  target_unit: string;
  timeframe: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
}

function fromRow(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    target: row.target,
    targetUnit: row.target_unit,
    timeframe: row.timeframe as Goal['timeframe'],
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status as Goal['status'],
    createdAt: row.created_at,
  };
}

export function listGoals(): Goal[] {
  return getDb().getAllSync<GoalRow>('SELECT * FROM goal ORDER BY created_at DESC').map(fromRow);
}

export function createGoal(input: Omit<Goal, 'id' | 'status' | 'createdAt'>): Goal {
  const db = getDb();
  const goal: Goal = { ...input, id: newId(), status: 'ACTIVE', createdAt: nowIso() };
  db.runSync(
    `INSERT INTO goal (id, title, target, target_unit, timeframe, start_date, end_date, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [goal.id, goal.title, goal.target, goal.targetUnit, goal.timeframe, goal.startDate, goal.endDate, goal.status, goal.createdAt],
  );
  return goal;
}

export function updateGoalStatus(id: string, status: Goal['status']): void {
  getDb().runSync('UPDATE goal SET status = ? WHERE id = ?', [status, id]);
}

export function deleteGoal(id: string): void {
  getDb().runSync('DELETE FROM goal WHERE id = ?', [id]);
}

/** Re-inserts a previously-deleted goal as-is (same id) — the undo path for delete. */
export function restoreGoal(goal: Goal): void {
  getDb().runSync(
    `INSERT INTO goal (id, title, target, target_unit, timeframe, start_date, end_date, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [goal.id, goal.title, goal.target, goal.targetUnit, goal.timeframe, goal.startDate, goal.endDate, goal.status, goal.createdAt],
  );
}
