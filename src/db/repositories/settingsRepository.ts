import { getDb } from '@/db/client';
import type { AppSettings } from '@/types/entities';

const SETTINGS_ID = 'singleton';

interface SettingsRow {
  id: string;
  theme_mode: string;
  onboarding_completed: number;
  user_name: string | null;
  notifications_enabled: number;
  daily_summary_enabled: number;
  weekly_summary_enabled: number;
}

function fromRow(row: SettingsRow): AppSettings {
  return {
    id: row.id,
    themeMode: row.theme_mode as AppSettings['themeMode'],
    onboardingCompleted: row.onboarding_completed === 1,
    userName: row.user_name,
    notificationsEnabled: row.notifications_enabled === 1,
    dailySummaryEnabled: row.daily_summary_enabled === 1,
    weeklySummaryEnabled: row.weekly_summary_enabled === 1,
  };
}

export function getSettings(): AppSettings {
  const db = getDb();
  const row = db.getFirstSync<SettingsRow>('SELECT * FROM app_settings WHERE id = ?', [SETTINGS_ID]);
  if (row) return fromRow(row);

  db.runSync('INSERT INTO app_settings (id) VALUES (?)', [SETTINGS_ID]);
  return getSettings();
}

export function updateSettings(input: Partial<Omit<AppSettings, 'id'>>): AppSettings {
  const db = getDb();
  const current = getSettings();
  const merged = { ...current, ...input };
  db.runSync(
    `UPDATE app_settings SET theme_mode = ?, onboarding_completed = ?, user_name = ?,
       notifications_enabled = ?, daily_summary_enabled = ?, weekly_summary_enabled = ? WHERE id = ?`,
    [
      merged.themeMode,
      merged.onboardingCompleted ? 1 : 0,
      merged.userName,
      merged.notificationsEnabled ? 1 : 0,
      merged.dailySummaryEnabled ? 1 : 0,
      merged.weeklySummaryEnabled ? 1 : 0,
      SETTINGS_ID,
    ],
  );
  return merged;
}
