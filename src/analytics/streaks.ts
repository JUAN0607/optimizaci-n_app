import { addDays, differenceInCalendarDays } from 'date-fns';

import type { Habit, HabitLog } from '@/types/entities';
import { parseDateKey, toDateKey } from '@/utils/date';
import { isScheduledDay, startOfWeekKey } from '@/utils/recurrence';

export interface StreakResult {
  current: number;
  longest: number;
}

const MAX_LOOKBACK_DAYS = 3650; // ~10 years safety bound

/**
 * Streak calculation respects each habit's actual schedule: unscheduled days are skipped
 * (they neither extend nor break a streak), and only a missed *scheduled* day breaks it.
 * X_TIMES_PER_WEEK habits are evaluated per ISO week instead of per day, since they have
 * no fixed weekday of their own.
 */
export function calculateStreak(habit: Habit, logs: HabitLog[], today: Date = new Date()): StreakResult {
  const todayKey = toDateKey(today);
  const creationKey = toDateKey(new Date(habit.createdAt));

  if (habit.recurrenceRule.type === 'X_TIMES_PER_WEEK') {
    return calculateWeeklyStreak(habit.recurrenceRule.times, logs, creationKey, todayKey);
  }
  return calculateDailyStreak(habit.recurrenceRule, logs, creationKey, todayKey);
}

function calculateDailyStreak(
  rule: Habit['recurrenceRule'],
  logs: HabitLog[],
  creationKey: string,
  todayKey: string,
): StreakResult {
  const completedDates = new Set(logs.filter((l) => l.status === 'COMPLETED').map((l) => l.date));

  // --- current streak: walk backward from today ---
  let current = 0;
  let cursor = todayKey;
  let steps = 0;
  while (differenceInCalendarDays(parseDateKey(cursor), parseDateKey(creationKey)) >= 0 && steps < MAX_LOOKBACK_DAYS) {
    const scheduled = isScheduledDay(rule, cursor);
    if (scheduled) {
      if (completedDates.has(cursor)) {
        current += 1;
      } else if (cursor === todayKey) {
        // today not completed yet — still time left, don't break the streak, just don't count it
      } else {
        break;
      }
    }
    cursor = toDateKey(addDays(parseDateKey(cursor), -1));
    steps += 1;
  }

  // --- longest streak: scan forward from creation to today ---
  let longest = 0;
  let running = 0;
  let day = creationKey;
  steps = 0;
  while (differenceInCalendarDays(parseDateKey(todayKey), parseDateKey(day)) >= 0 && steps < MAX_LOOKBACK_DAYS) {
    if (isScheduledDay(rule, day)) {
      if (completedDates.has(day)) {
        running += 1;
        longest = Math.max(longest, running);
      } else if (day !== todayKey) {
        running = 0;
      }
      // if it's today and not completed yet, leave `running` as-is (still pending)
    }
    day = toDateKey(addDays(parseDateKey(day), 1));
    steps += 1;
  }

  return { current, longest: Math.max(longest, current) };
}

function calculateWeeklyStreak(target: number, logs: HabitLog[], creationKey: string, todayKey: string): StreakResult {
  const completedByWeek = new Map<string, number>();
  for (const log of logs) {
    if (log.status !== 'COMPLETED') continue;
    const week = startOfWeekKey(log.date);
    completedByWeek.set(week, (completedByWeek.get(week) ?? 0) + 1);
  }

  const currentWeek = startOfWeekKey(todayKey);
  const creationWeek = startOfWeekKey(creationKey);

  // --- current streak: walk backward week by week ---
  let current = 0;
  let cursorWeek = currentWeek;
  let weekSteps = 0;
  const maxWeeks = Math.ceil(MAX_LOOKBACK_DAYS / 7);
  while (differenceInCalendarDays(parseDateKey(cursorWeek), parseDateKey(creationWeek)) >= 0 && weekSteps < maxWeeks) {
    const count = completedByWeek.get(cursorWeek) ?? 0;
    const met = count >= target;
    if (met) {
      current += 1;
    } else if (cursorWeek !== currentWeek) {
      break;
    }
    // current week not yet met: pending, don't break, don't count — keep walking back
    cursorWeek = toDateKey(addDays(parseDateKey(cursorWeek), -7));
    weekSteps += 1;
  }

  // --- longest streak: scan forward week by week ---
  let longest = 0;
  let running = 0;
  let week = creationWeek;
  weekSteps = 0;
  while (differenceInCalendarDays(parseDateKey(currentWeek), parseDateKey(week)) >= 0 && weekSteps < maxWeeks) {
    const count = completedByWeek.get(week) ?? 0;
    const met = count >= target;
    if (met) {
      running += 1;
      longest = Math.max(longest, running);
    } else if (week !== currentWeek) {
      running = 0;
    }
    week = toDateKey(addDays(parseDateKey(week), 7));
    weekSteps += 1;
  }

  return { current, longest: Math.max(longest, current) };
}
