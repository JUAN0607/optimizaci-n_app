import { getDb, newId, nowIso } from '@/db/client';
import type { Activity, ActivityStatus, ReminderConfig, RecurrenceRule } from '@/types/entities';

interface ActivityRow {
  id: string;
  title: string;
  notes: string | null;
  type: string;
  category_id: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  priority: string | null;
  status: string;
  is_recurring: number;
  recurrence_rule: string | null;
  reminder: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

function fromRow(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    type: row.type as Activity['type'],
    categoryId: row.category_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    priority: row.priority as Activity['priority'],
    status: row.status as ActivityStatus,
    isRecurring: row.is_recurring === 1,
    recurrenceRule: row.recurrence_rule ? (JSON.parse(row.recurrence_rule) as RecurrenceRule) : null,
    reminder: row.reminder ? (JSON.parse(row.reminder) as ReminderConfig) : null,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

export type ActivityInput = Omit<Activity, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'completedAt' | 'isRecurring'> & {
  isRecurring?: boolean;
};

export function listActivitiesForDate(date: string): Activity[] {
  const db = getDb();
  const rows = db.getAllSync<ActivityRow>(
    'SELECT * FROM activity WHERE date = ? ORDER BY (start_time IS NULL), start_time ASC',
    [date],
  );
  return rows.map(fromRow);
}

export function listActivitiesInRange(startDate: string, endDate: string): Activity[] {
  const db = getDb();
  const rows = db.getAllSync<ActivityRow>(
    'SELECT * FROM activity WHERE date >= ? AND date <= ? ORDER BY date ASC, (start_time IS NULL), start_time ASC',
    [startDate, endDate],
  );
  return rows.map(fromRow);
}

export function getActivity(id: string): Activity | null {
  const row = getDb().getFirstSync<ActivityRow>('SELECT * FROM activity WHERE id = ?', [id]);
  return row ? fromRow(row) : null;
}

export function createActivity(input: ActivityInput): Activity {
  const db = getDb();
  const timestamp = nowIso();
  const activity: Activity = {
    ...input,
    id: newId(),
    status: 'PENDING',
    isRecurring: input.isRecurring ?? false,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
  };
  db.runSync(
    `INSERT INTO activity
      (id, title, notes, type, category_id, date, start_time, end_time, duration, priority, status,
       is_recurring, recurrence_rule, reminder, location, created_at, updated_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      activity.id,
      activity.title,
      activity.notes,
      activity.type,
      activity.categoryId,
      activity.date,
      activity.startTime,
      activity.endTime,
      activity.duration,
      activity.priority,
      activity.status,
      activity.isRecurring ? 1 : 0,
      activity.recurrenceRule ? JSON.stringify(activity.recurrenceRule) : null,
      activity.reminder ? JSON.stringify(activity.reminder) : null,
      activity.location,
      activity.createdAt,
      activity.updatedAt,
      activity.completedAt,
    ],
  );
  return activity;
}

export function updateActivity(id: string, input: Partial<ActivityInput>): void {
  const db = getDb();
  const existing = getActivity(id);
  if (!existing) return;
  const merged: Activity = { ...existing, ...input, updatedAt: nowIso() };
  db.runSync(
    `UPDATE activity SET title = ?, notes = ?, type = ?, category_id = ?, date = ?, start_time = ?, end_time = ?,
       duration = ?, priority = ?, is_recurring = ?, recurrence_rule = ?, reminder = ?, location = ?, updated_at = ?
     WHERE id = ?`,
    [
      merged.title,
      merged.notes,
      merged.type,
      merged.categoryId,
      merged.date,
      merged.startTime,
      merged.endTime,
      merged.duration,
      merged.priority,
      merged.isRecurring ? 1 : 0,
      merged.recurrenceRule ? JSON.stringify(merged.recurrenceRule) : null,
      merged.reminder ? JSON.stringify(merged.reminder) : null,
      merged.location,
      merged.updatedAt,
      id,
    ],
  );
}

export function setActivityStatus(id: string, status: ActivityStatus): void {
  const db = getDb();
  const completedAt = status === 'COMPLETED' ? nowIso() : null;
  db.runSync('UPDATE activity SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?', [
    status,
    completedAt,
    nowIso(),
    id,
  ]);
}

export function rescheduleActivity(id: string, date: string, startTime: string | null, endTime: string | null): void {
  const db = getDb();
  db.runSync('UPDATE activity SET date = ?, start_time = ?, end_time = ?, updated_at = ? WHERE id = ?', [
    date,
    startTime,
    endTime,
    nowIso(),
    id,
  ]);
}

export function deleteActivity(id: string): void {
  getDb().runSync('DELETE FROM activity WHERE id = ?', [id]);
}
