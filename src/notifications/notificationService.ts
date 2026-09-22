import * as Notifications from 'expo-notifications';

import { getDb, newId } from '@/db/client';
import { getSettings } from '@/db/repositories/settingsRepository';
import type { NotificationMapEntry } from '@/types/entities';
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

function getMapping(entityType: NotificationMapEntry['entityType'], entityId: string): MapRow | null {
  const db = getDb();
  return db.getFirstSync<MapRow>('SELECT * FROM notification_map WHERE entity_type = ? AND entity_id = ?', [
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
 * Cancels any previously scheduled notification for this entity. Call before scheduling a
 * new one so edits/deletes never leave a stale or duplicate reminder behind.
 */
export async function cancelEntityNotification(entityType: NotificationMapEntry['entityType'], entityId: string) {
  const existing = getMapping(entityType, entityId);
  if (!existing) return;
  await Notifications.cancelScheduledNotificationAsync(existing.notification_id).catch(() => {});
  getDb().runSync('DELETE FROM notification_map WHERE id = ?', [existing.id]);
}

export async function scheduleActivityReminder(params: {
  activityId: string;
  title: string;
  date: string;
  startTime: string | null;
  minutesBefore: number;
}) {
  await cancelEntityNotification('ACTIVITY', params.activityId);
  if (!params.startTime || !getSettings().notificationsEnabled) return;

  const fireDate = combineDateAndTime(params.date, params.startTime);
  fireDate.setMinutes(fireDate.getMinutes() - params.minutesBefore);
  if (fireDate.getTime() <= Date.now()) return; // don't schedule reminders in the past

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'RITMO',
      body: params.minutesBefore > 0 ? `En ${params.minutesBefore} minutos: ${params.title}` : `Es hora de: ${params.title}`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
  });

  saveMapping('ACTIVITY', params.activityId, notificationId, fireDate.toISOString());
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
