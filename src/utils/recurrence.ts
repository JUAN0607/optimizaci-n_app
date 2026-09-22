import { addDays, differenceInCalendarDays, getDate, getDaysInMonth } from 'date-fns';

import type { RecurrenceRule } from '@/types/entities';

import { parseDateKey, toDateKey } from './date';

/**
 * Whether `dateKey` is a day this rule requires action on.
 *
 * X_TIMES_PER_WEEK has no fixed weekday — it's satisfied by any N days within the week —
 * so every day is "eligible" for it; weekly completion is evaluated separately
 * (see analytics/streaks.ts) rather than per-day.
 */
export function isScheduledDay(rule: RecurrenceRule, dateKey: string): boolean {
  const date = parseDateKey(dateKey);

  switch (rule.type) {
    case 'DAILY':
      return true;

    case 'SPECIFIC_DAYS':
      return rule.days.includes(date.getDay());

    case 'X_TIMES_PER_WEEK':
      return true;

    case 'MONTHLY': {
      const daysInMonth = getDaysInMonth(date);
      const targetDay = Math.min(rule.dayOfMonth, daysInMonth);
      return getDate(date) === targetDay;
    }

    case 'EVERY_X_DAYS': {
      const anchor = parseDateKey(rule.anchorDate);
      const diff = differenceInCalendarDays(date, anchor);
      if (diff < 0) return false;
      return diff % rule.interval === 0;
    }

    case 'CUSTOM': {
      if (!rule.days.includes(date.getDay())) return false;
      // interval treated as "every N occurrences of these weekdays" measured in weeks
      if (rule.interval <= 1) return true;
      const epoch = parseDateKey('1970-01-01');
      const weeksSinceEpoch = Math.floor(differenceInCalendarDays(date, epoch) / 7);
      return weeksSinceEpoch % rule.interval === 0;
    }

    default:
      return false;
  }
}

export function describeRecurrence(rule: RecurrenceRule, weekdayLabelsShort: string[]): string {
  switch (rule.type) {
    case 'DAILY':
      return 'Todos los días';
    case 'SPECIFIC_DAYS':
      return rule.days
        .slice()
        .sort((a, b) => a - b)
        .map((d) => weekdayLabelsShort[d])
        .join(' · ');
    case 'X_TIMES_PER_WEEK':
      return `${rule.times} veces por semana`;
    case 'MONTHLY':
      return `Día ${rule.dayOfMonth} de cada mes`;
    case 'EVERY_X_DAYS':
      return `Cada ${rule.interval} días`;
    case 'CUSTOM':
      return 'Personalizado';
    default:
      return '';
  }
}

/** Start of the local ISO week (Monday) containing `dateKey`, as a date key. */
export function startOfWeekKey(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const day = date.getDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = addDays(date, diffToMonday);
  return toDateKey(monday);
}
