import * as Notifications from 'expo-notifications';

import { getDb, newId } from '@/db/client';
import { getSettings } from '@/db/repositories/settingsRepository';
import type { NotificationMapEntry, RecurrenceRule } from '@/types/entities';
import { combineDateAndTime } from '@/utils/date';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface MapRow {
  id: string;
  entity_type: string;
  entity_id: string;
  notification_id: string;
  scheduled_for: string;
}

function getMappings(entityType: NotificationMapEntry['entityType'], entityId: string): MapRow[] {
  const db = getDb();
  return db.getAllSync<MapRow>('SELECT * FROM notification_map WHERE entity_type = ? AND entity_id = ?', [
    entityType,
    entityId,
  ]);
}

function saveMapping(entityType: NotificationMapEntry['entityType'], entityId: string, notificationId: string, scheduledFor: string) {
  const db = getDb();
  db.runSync(
    'INSERT INTO notification_map (id, entity_type, entity_id, notification_id, scheduled_for) VALUES (?, ?, ?, ?, ?)',
    [newId(), entityType, entityId, notificationId, scheduledFor],
  );
}

/**
 * Cancels every previously scheduled notification for this entity (a recurring activity can
 * hold several — e.g. one WEEKLY trigger per selected weekday). Call before scheduling new
 * ones so edits/deletes never leave a stale or duplicate reminder behind.
 */
export async function cancelEntityNotification(entityType: NotificationMapEntry['entityType'], entityId: string) {
  const existing = getMappings(entityType, entityId);
  for (const row of existing) {
    await Notifications.cancelScheduledNotificationAsync(row.notification_id).catch(() => {});
  }
  if (existing.length > 0) {
    getDb().runSync('DELETE FROM notification_map WHERE entity_type = ? AND entity_id = ?', [entityType, entityId]);
  }
}

/**
 * Schedules up to two one-off notifications for an activity: the "before" reminder the user
 * configured (if `minutesBefore` > 0) AND, always, one right when it actually starts — a
 * before-only reminder is easy to miss if you're not free yet, so both fire independently.
 */
export async function scheduleActivityReminder(params: {
  activityId: string;
  title: string;
  date: string;
  startTime: string | null;
  minutesBefore: number;
}) {
  await cancelEntityNotification('ACTIVITY', params.activityId);
  if (!params.startTime || !getSettings().notificationsEnabled) return;

  const startDate = combineDateAndTime(params.date, params.startTime);

  if (params.minutesBefore > 0) {
    const beforeDate = new Date(startDate);
    beforeDate.setMinutes(beforeDate.getMinutes() - params.minutesBefore);
    if (beforeDate.getTime() > Date.now()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: 'RITMO', body: `En ${params.minutesBefore} minutos: ${params.title}` },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: beforeDate },
      });
      saveMapping('ACTIVITY', params.activityId, id, beforeDate.toISOString());
    }
  }

  if (startDate.getTime() > Date.now()) {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: 'RITMO', body: `Es hora de: ${params.title}` },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: startDate },
    });
    saveMapping('ACTIVITY', params.activityId, id, startDate.toISOString());
  }
}

// Deadline reminders fire the morning of the due date (a due date has no time-of-day of its
// own, unlike the execution date/time), so the user is reminded regardless of when they'd
// planned to actually do the work.
const DUE_REMINDER_HOUR = 9;

export async function scheduleActivityDueReminder(params: { activityId: string; title: string; dueDate: string }) {
  await cancelEntityNotification('ACTIVITY_DUE', params.activityId);
  if (!getSettings().notificationsEnabled) return;

  const fireDate = combineDateAndTime(params.dueDate, null);
  fireDate.setHours(DUE_REMINDER_HOUR, 0, 0, 0);
  if (fireDate.getTime() <= Date.now()) return; // don't schedule reminders in the past

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title: 'RITMO', body: `Hoy debes entregar: ${params.title}` },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
  });

  saveMapping('ACTIVITY_DUE', params.activityId, notificationId, fireDate.toISOString());
}

function wrapClockTime(startHour: number, startMinute: number, offsetMinutes: number): { hour: number; minute: number } {
  const wrapped = (((startHour * 60 + startMinute - offsetMinutes) % 1440) + 1440) % 1440;
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60 };
}

/**
 * Reminders for a recurring activity use native repeating triggers (DAILY/WEEKLY/MONTHLY/
 * TIME_INTERVAL) instead of one DATE-based notification per materialized occurrence — iOS
 * caps an app at 64 pending local notifications, and a daily task alone could materialize
 * ~365 rows. SPECIFIC_DAYS is the only case needing more than one trigger (one WEEKLY per
 * selected weekday), which still stays comfortably under that limit.
 *
 * Like scheduleActivityReminder, this schedules both the "before" reminder (if configured)
 * and one right at the occurrence's own start time, so both fire on every recurrence.
 */
export async function scheduleRecurringActivityReminder(params: {
  activityId: string;
  title: string;
  startTime: string; // HH:mm of the occurrence
  minutesBefore: number;
  recurrenceRule: RecurrenceRule;
}) {
  await cancelEntityNotification('ACTIVITY', params.activityId);
  if (!getSettings().notificationsEnabled) return;

  const [startHour, startMinute] = params.startTime.split(':').map(Number);
  const rule = params.recurrenceRule;

  if (rule.type === 'EVERY_X_DAYS') {
    // TIME_INTERVAL triggers count seconds from "now", with no wall-clock hour/minute — there's
    // no reliable way to anchor a second "at start" trigger relative to it, so this case keeps
    // its single existing trigger.
    const body = params.minutesBefore > 0 ? `En ${params.minutesBefore} minutos: ${params.title}` : `Es hora de: ${params.title}`;
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: 'RITMO', body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: rule.interval * 86400, repeats: true },
    });
    saveMapping('ACTIVITY', params.activityId, id, `every${rule.interval}days`);
    return;
  }

  const triggers: { offsetMinutes: number; body: string; tag: string }[] = [
    ...(params.minutesBefore > 0
      ? [{ offsetMinutes: params.minutesBefore, body: `En ${params.minutesBefore} minutos: ${params.title}`, tag: 'before' }]
      : []),
    { offsetMinutes: 0, body: `Es hora de: ${params.title}`, tag: 'start' },
  ];

  for (const { offsetMinutes, body, tag } of triggers) {
    const { hour, minute } = wrapClockTime(startHour, startMinute, offsetMinutes);

    if (rule.type === 'DAILY') {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: 'RITMO', body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
      });
      saveMapping('ACTIVITY', params.activityId, id, `daily@${hour}:${minute}:${tag}`);
    } else if (rule.type === 'SPECIFIC_DAYS') {
      for (const day of rule.days) {
        const weekday = day + 1; // our days: 0=Sun..6=Sat; expo-notifications weekday: 1=Sun..7=Sat
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: 'RITMO', body },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute },
        });
        saveMapping('ACTIVITY', params.activityId, id, `weekly@${weekday}:${tag}`);
      }
    } else if (rule.type === 'MONTHLY') {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: 'RITMO', body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: rule.dayOfMonth, hour, minute },
      });
      saveMapping('ACTIVITY', params.activityId, id, `monthly@${rule.dayOfMonth}:${tag}`);
    }
  }
}

export async function scheduleHabitReminder(params: { habitId: string; name: string; time: string }) {
  await cancelEntityNotification('HABIT', params.habitId);
  if (!getSettings().notificationsEnabled) return;

  const [hour, minute] = params.time.split(':').map(Number);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title: 'RITMO', body: `Tu hábito "${params.name}" está pendiente.` },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });

  saveMapping('HABIT', params.habitId, notificationId, params.time);
}

export async function scheduleDailySummary(time = '08:00') {
  await cancelEntityNotification('DAILY_SUMMARY', 'singleton');
  if (!getSettings().notificationsEnabled) return;
  const [hour, minute] = time.split(':').map(Number);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title: 'RITMO', body: 'Resumen de hoy' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
  saveMapping('DAILY_SUMMARY', 'singleton', notificationId, time);
}

export async function scheduleWeeklySummary(weekday = 2 /* Monday, expo-notifications: 1=Sun..7=Sat */, time = '08:00') {
  await cancelEntityNotification('WEEKLY_SUMMARY', 'singleton');
  if (!getSettings().notificationsEnabled) return;
  const [hour, minute] = time.split(':').map(Number);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title: 'RITMO', body: 'Tu semana' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute },
  });
  saveMapping('WEEKLY_SUMMARY', 'singleton', notificationId, time);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
