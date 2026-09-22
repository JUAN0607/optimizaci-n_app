import type { SQLiteDatabase } from 'expo-sqlite';

// Versioned migrations keyed by target `PRAGMA user_version`. Each migration runs once,
// in order, against a real device's existing database — never edit a past migration,
// only add new ones.
const MIGRATIONS: { version: number; up: (db: SQLiteDatabase) => void }[] = [
  {
    version: 1,
    up: (db) => {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS app_settings (
          id TEXT PRIMARY KEY NOT NULL,
          theme_mode TEXT NOT NULL DEFAULT 'SYSTEM',
          onboarding_completed INTEGER NOT NULL DEFAULT 0,
          user_name TEXT,
          notifications_enabled INTEGER NOT NULL DEFAULT 1,
          daily_summary_enabled INTEGER NOT NULL DEFAULT 1,
          weekly_summary_enabled INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS category (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS activity (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          notes TEXT,
          type TEXT NOT NULL,
          category_id TEXT REFERENCES category(id) ON DELETE SET NULL,
          date TEXT NOT NULL,
          start_time TEXT,
          end_time TEXT,
          duration INTEGER,
          priority TEXT,
          status TEXT NOT NULL DEFAULT 'PENDING',
          is_recurring INTEGER NOT NULL DEFAULT 0,
          recurrence_rule TEXT,
          reminder TEXT,
          location TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          completed_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_activity_date ON activity(date);
        CREATE INDEX IF NOT EXISTS idx_activity_status ON activity(status);

        CREATE TABLE IF NOT EXISTS habit (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          category_id TEXT REFERENCES category(id) ON DELETE SET NULL,
          measurement_type TEXT NOT NULL,
          target REAL,
          target_unit TEXT,
          recurrence_rule TEXT NOT NULL,
          reminder TEXT,
          notes TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS habit_log (
          id TEXT PRIMARY KEY NOT NULL,
          habit_id TEXT NOT NULL REFERENCES habit(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          status TEXT NOT NULL,
          value REAL,
          created_at TEXT NOT NULL,
          UNIQUE(habit_id, date)
        );
        CREATE INDEX IF NOT EXISTS idx_habit_log_habit ON habit_log(habit_id);

        CREATE TABLE IF NOT EXISTS routine (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS routine_item (
          id TEXT PRIMARY KEY NOT NULL,
          routine_id TEXT NOT NULL REFERENCES routine(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          time TEXT,
          "order" INTEGER NOT NULL,
          duration INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_routine_item_routine ON routine_item(routine_id);

        CREATE TABLE IF NOT EXISTS goal (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          target REAL NOT NULL,
          target_unit TEXT NOT NULL,
          timeframe TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notification_map (
          id TEXT PRIMARY KEY NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          notification_id TEXT NOT NULL,
          scheduled_for TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_notification_map_entity ON notification_map(entity_type, entity_id);
      `);
    },
  },
  {
    version: 2,
    up: (db) => {
      // Links a recurring activity's materialized occurrences together so editing/removing
      // the series can find its siblings without re-deriving the schedule from scratch.
      db.execSync(`ALTER TABLE activity ADD COLUMN recurrence_group_id TEXT;`);
      db.execSync(`CREATE INDEX IF NOT EXISTS idx_activity_recurrence_group ON activity(recurrence_group_id);`);
    },
  },
];

export function runMigrations(db: SQLiteDatabase) {
  const currentVersion = db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;
  const pending = MIGRATIONS.filter((m) => m.version > currentVersion).sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    db.withTransactionSync(() => {
      migration.up(db);
      db.execSync(`PRAGMA user_version = ${migration.version}`);
    });
  }
}
