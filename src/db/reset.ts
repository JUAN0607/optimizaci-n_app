import * as Notifications from 'expo-notifications';

import { DEFAULT_CATEGORIES } from '@/constants/categories';

import { getDb } from './client';
import { createCategory } from './repositories/categoryRepository';

/**
 * Full data wipe for the Settings "danger zone." Clears every user-data table and cancels
 * all local notifications, then re-seeds just the default categories (not the sample day)
 * so pickers throughout the app aren't left pointing at nothing.
 */
export async function resetAllData(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});

  const db = getDb();
  db.withTransactionSync(() => {
    for (const table of ['notification_map', 'habit_log', 'habit', 'routine_item', 'routine', 'goal', 'activity', 'category']) {
      db.execSync(`DELETE FROM ${table}`);
    }
  });

  for (const category of DEFAULT_CATEGORIES) {
    createCategory(category);
  }
}
