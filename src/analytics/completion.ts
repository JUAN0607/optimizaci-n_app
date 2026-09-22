import type { Activity } from '@/types/entities';

/**
 * completion rate = completed planned activities / planned activities × 100
 * No hidden weighting — every planned activity counts equally.
 */
export function calculateCompletionRate(activities: Activity[]): number {
  if (activities.length === 0) return 0;
  const completed = activities.filter((a) => a.status === 'COMPLETED').length;
  return Math.round((completed / activities.length) * 100);
}

function activityMinutes(activity: Activity): number {
  if (activity.duration != null) return activity.duration;
  if (activity.startTime && activity.endTime) {
    const [sh, sm] = activity.startTime.split(':').map(Number);
    const [eh, em] = activity.endTime.split(':').map(Number);
    return Math.max(0, eh * 60 + em - (sh * 60 + sm));
  }
  return 0;
}

export interface TimeMetrics {
  plannedMinutes: number;
  completedMinutes: number;
}

export function calculateTimeMetrics(activities: Activity[]): TimeMetrics {
  let plannedMinutes = 0;
  let completedMinutes = 0;
  for (const activity of activities) {
    const minutes = activityMinutes(activity);
    plannedMinutes += minutes;
    if (activity.status === 'COMPLETED') completedMinutes += minutes;
  }
  return { plannedMinutes, completedMinutes };
}

export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}h`;
}

export interface CategoryBreakdownEntry {
  categoryId: string | null;
  total: number;
  completed: number;
}

export function calculateCategoryBreakdown(activities: Activity[]): CategoryBreakdownEntry[] {
  const map = new Map<string | null, CategoryBreakdownEntry>();
  for (const activity of activities) {
    const key = activity.categoryId;
    const entry = map.get(key) ?? { categoryId: key, total: 0, completed: 0 };
    entry.total += 1;
    if (activity.status === 'COMPLETED') entry.completed += 1;
    map.set(key, entry);
  }
  return Array.from(map.values());
}
