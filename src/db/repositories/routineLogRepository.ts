import { getDb, newId, nowIso } from '@/db/client';

/** Item ids completed for a routine on a given date. */
export function listCompletedItemIds(routineId: string, date: string): Set<string> {
  const rows = getDb().getAllSync<{ routine_item_id: string }>(
    `SELECT ril.routine_item_id FROM routine_item_log ril
       JOIN routine_item ri ON ri.id = ril.routine_item_id
      WHERE ri.routine_id = ? AND ril.date = ?`,
    [routineId, date],
  );
  return new Set(rows.map((r) => r.routine_item_id));
}

export function setItemCompleted(routineItemId: string, date: string, completed: boolean): void {
  const db = getDb();
  if (completed) {
    db.runSync(
      `INSERT INTO routine_item_log (id, routine_item_id, date, completed_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(routine_item_id, date) DO UPDATE SET completed_at = excluded.completed_at`,
      [newId(), routineItemId, date, nowIso()],
    );
  } else {
    db.runSync('DELETE FROM routine_item_log WHERE routine_item_id = ? AND date = ?', [routineItemId, date]);
  }
}
