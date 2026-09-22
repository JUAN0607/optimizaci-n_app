export type ActivityType = 'TASK' | 'EVENT' | 'REMINDER';

export type ActivityStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'OVERDUE';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type MeasurementType = 'CHECKBOX' | 'DURATION' | 'QUANTITY' | 'DISTANCE' | 'COUNT';

export type RecurrenceRule =
  | { type: 'DAILY' }
  | { type: 'SPECIFIC_DAYS'; days: number[] } // 0=Sunday..6=Saturday
  | { type: 'X_TIMES_PER_WEEK'; times: number }
  | { type: 'MONTHLY'; dayOfMonth: number }
  | { type: 'EVERY_X_DAYS'; interval: number; anchorDate: string }
  | { type: 'CUSTOM'; days: number[]; interval: number };

export interface ReminderConfig {
  enabled: boolean;
  minutesBefore: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  title: string;
  notes: string | null;
  type: ActivityType;
  categoryId: string | null;
  date: string; // YYYY-MM-DD, local
  startTime: string | null; // HH:mm
  endTime: string | null; // HH:mm
  duration: number | null; // minutes
  priority: Priority | null;
  status: ActivityStatus;
  isRecurring: boolean;
  recurrenceRule: RecurrenceRule | null;
  reminder: ReminderConfig | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  categoryId: string | null;
  measurementType: MeasurementType;
  target: number | null; // e.g. minutes, glasses, km, reps
  targetUnit: string | null;
  recurrenceRule: RecurrenceRule;
  reminder: ReminderConfig | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: 'COMPLETED' | 'SKIPPED';
  value: number | null; // duration/quantity/distance/count value
  createdAt: string;
}

export interface Routine {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

export interface RoutineItem {
  id: string;
  routineId: string;
  title: string;
  time: string | null; // HH:mm
  order: number;
  duration: number | null;
}

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

export interface Goal {
  id: string;
  title: string;
  target: number;
  targetUnit: string;
  timeframe: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  startDate: string;
  endDate: string | null;
  status: GoalStatus;
  createdAt: string;
}

export interface AppSettings {
  id: string;
  themeMode: 'SYSTEM' | 'LIGHT' | 'DARK';
  onboardingCompleted: boolean;
  userName: string | null;
  notificationsEnabled: boolean;
  dailySummaryEnabled: boolean;
  weeklySummaryEnabled: boolean;
}

export interface NotificationMapEntry {
  id: string;
  entityType: 'ACTIVITY' | 'HABIT' | 'DAILY_SUMMARY' | 'WEEKLY_SUMMARY';
  entityId: string;
  notificationId: string;
  scheduledFor: string;
}
