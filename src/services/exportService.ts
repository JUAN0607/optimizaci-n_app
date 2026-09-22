import { getDb } from '@/db/client';

const TABLES = ['category', 'activity', 'habit', 'habit_log', 'routine', 'routine_item', 'goal', 'app_settings'] as const;

/**
 * Service boundary for data ownership: a full JSON snapshot today, CSV/import to follow
 * later without touching the repositories underneath.
 */
export function exportAllDataAsJson(): string {
  const db = getDb();
  const snapshot: Record<string, unknown[]> = {};
  for (const table of TABLES) {
    snapshot[table] = db.getAllSync(`SELECT * FROM ${table}`);
  }
  return JSON.stringify({ exportedAt: new Date().toISOString(), version: 1, tables: snapshot }, null, 2);
}
