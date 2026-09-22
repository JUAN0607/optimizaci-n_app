import { addDays, format, parseISO } from 'date-fns';

// Centralized date helpers. Everything uses the device's local timezone (native Date),
// and dates are stored/compared as 'yyyy-MM-dd' strings to avoid time-of-day drift.

export const DATE_FORMAT = 'yyyy-MM-dd';

export function toDateKey(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(dateKey: string): Date {
  return parseISO(dateKey);
}

export function formatTime(time: string | null): string {
  if (!time) return '';
  return time;
}

export function addDaysToKey(dateKey: string, days: number): string {
  return toDateKey(addDays(parseDateKey(dateKey), days));
}

export function combineDateAndTime(dateKey: string, time: string | null): Date {
  if (!time) return parseDateKey(dateKey);
  const [hours, minutes] = time.split(':').map(Number);
  const d = parseDateKey(dateKey);
  d.setHours(hours, minutes, 0, 0);
  return d;
}
