import { getDb, newId, nowIso } from '@/db/client';
import type { Activity, ActivityStatus, ReminderConfig, RecurrenceRule } from '@/types/entities';
import { addDaysToKey, todayKey } from '@/utils/date';
import { isScheduledDay } from '@/utils/recurrence';

// How far ahead a recurring task/event is materialized into real, individually completable/
// editable rows. A year comfortably covers Plan's Year view without generating an unbounded
// number of rows (SQLite handles low thousands of rows trivially for a single-user app).
const RECURRENCE_HORIZON_DAYS = 365;

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
  recurrence_group_id: string | null;
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
    recurrenceGroupId: row.recurrence_group_id,
    reminder: row.reminder ? (JSON.parse(row.reminder) as ReminderConfig) : null,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

export type ActivityInput = Omit<
  Activity,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'completedAt' | 'isRecurring' | 'recurrenceGroupId'
> & {
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

function insertActivityRow(activity: Activity): void {
  getDb().runSync(
    `INSERT INTO activity
      (id, title, notes, type, category_id, date, start_time, end_time, duration, priority, status,
       is_recurring, recurrence_rule, recurrence_group_id, reminder, location, created_at, updated_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      activity.recurrenceGroupId,
      activity.reminder ? JSON.stringify(activity.reminder) : null,
      activity.location,
      activity.createdAt,
      activity.updatedAt,
      activity.completedAt,
    ],
  );
}

/**
 * Generates one real row per future date matching `base`'s recurrence rule, from the day
 * after `fromDateExclusive` out to the horizon. Each occurrence is an independent row —
 * completing, rescheduling, or deleting one never touches the others — which is also how
 * calendar apps model recurring event exceptions under the hood.
 */
function materializeFutureOccurrences(base: Activity, groupId: string, fromDateExclusive: string, skipDate?: string): void {
  if (!base.recurrenceRule) return;
  const timestamp = nowIso();
  let cursor = fromDateExclusive;
  for (let i = 0; i < RECURRENCE_HORIZON_DAYS; i++) {
    cursor = addDaysToKey(cursor, 1);
    if (cursor === skipDate) continue;
    if (!isScheduledDay(base.recurrenceRule, cursor)) continue;
    insertActivityRow({
      ...base,
      id: newId(),
      date: cursor,
      status: 'PENDING',
      recurrenceGroupId: groupId,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
    });
  }
}

function deleteFuturePendingSiblings(groupId: string, excludeId: string): void {
  getDb().runSync(
    `DELETE FROM activity WHERE recurrence_group_id = ? AND id != ? AND status = 'PENDING' AND date > ?`,
    [groupId, excludeId, todayKey()],
  );
}

export function createActivity(input: ActivityInput): Activity {
  const timestamp = nowIso();
  const activity: Activity = {
    ...input,
    id: newId(),
    status: 'PENDING',
    isRecurring: input.isRecurring ?? false,
    recurrenceGroupId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
  };
  insertActivityRow(activity);

  if (activity.isRecurring && activity.recurrenceRule) {
    const groupId = activity.id;
    getDb().runSync('UPDATE activity SET recurrence_group_id = ? WHERE id = ?', [groupId, activity.id]);
    activity.recurrenceGroupId = groupId;
    materializeFutureOccurrences(activity, groupId, activity.date);
  }

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

/**
 * Edit-flow update: applies the edit to this occurrence, then regenerates the *future,
 * still-pending* occurrences of its series (from today forward) under the new rule/fields.
 * Past and completed occurrences are never touched, so history stays intact — "leer 3 días
 * a la semana" starting from an edit doesn't rewrite what already happened.
 */
export function updateActivityWithRecurrence(id: string, input: ActivityInput): void {
  const existing = getActivity(id);
  if (!existing) return;
  updateActivity(id, input);

  const wantsRecurring = !!(input.isRecurring && input.recurrenceRule);
  const existingGroupId = existing.recurrenceGroupId;

  if (!wantsRecurring) {
    if (existingGroupId) {
      deleteFuturePendingSiblings(existingGroupId, id);
      getDb().runSync('UPDATE activity SET recurrence_group_id = NULL WHERE id = ?', [id]);
    }
    return;
  }

  const groupId = existingGroupId ?? id;
  if (!existingGroupId) {
    getDb().runSync('UPDATE activity SET recurrence_group_id = ? WHERE id = ?', [groupId, id]);
  }
  deleteFuturePendingSiblings(groupId, id);

  const updated = getActivity(id);
  if (updated) {
    materializeFutureOccurrences(updated, groupId, todayKey(), updated.date);
  }
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
