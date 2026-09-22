import { calculateStreak } from '@/analytics/streaks';
import type { Habit, HabitLog } from '@/types/entities';

// Local-noon avoids any UTC-rounding surprises when Date <-> ISOString round-trips.
function localNoonIso(y: number, m: number, d: number): string {
  return new Date(y, m, d, 12).toISOString();
}

function makeHabit(overrides: Partial<Habit>): Habit {
  return {
    id: 'h1',
    name: 'Test habit',
    icon: 'body-outline',
    categoryId: null,
    measurementType: 'CHECKBOX',
    target: null,
    targetUnit: null,
    recurrenceRule: { type: 'DAILY' },
    reminder: null,
    notes: null,
    isActive: true,
    createdAt: localNoonIso(2026, 8, 1),
    ...overrides,
  };
}

function makeLog(date: string, status: HabitLog['status'] = 'COMPLETED'): HabitLog {
  return { id: `log-${date}`, habitId: 'h1', date, status, value: null, createdAt: date };
}

describe('calculateStreak — daily habits', () => {
  it('counts consecutive completed days up to today', () => {
    const habit = makeHabit({ recurrenceRule: { type: 'DAILY' }, createdAt: localNoonIso(2026, 8, 18) });
    const logs = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25'].map((d) => makeLog(d));
    const today = new Date(2026, 8, 25, 12); // Friday
    const result = calculateStreak(habit, logs, today);
    expect(result.current).toBe(5);
    expect(result.longest).toBe(5);
  });

  it('does not break the streak just because today is not completed yet', () => {
    const habit = makeHabit({ createdAt: localNoonIso(2026, 8, 20) });
    const logs = ['2026-09-23', '2026-09-24'].map((d) => makeLog(d));
    const today = new Date(2026, 8, 25, 12); // today has no log yet
    const result = calculateStreak(habit, logs, today);
    expect(result.current).toBe(2);
  });

  it('breaks the streak at a missed scheduled day', () => {
    const habit = makeHabit({ createdAt: localNoonIso(2026, 8, 18) });
    const logs = ['2026-09-21', '2026-09-22', '2026-09-24', '2026-09-25'].map((d) => makeLog(d)); // 9-23 missing
    const today = new Date(2026, 8, 25, 12);
    const result = calculateStreak(habit, logs, today);
    expect(result.current).toBe(2); // 24, 25
    expect(result.longest).toBe(2); // 21, 22
  });
});

describe('calculateStreak — SPECIFIC_DAYS (Mon/Wed/Fri)', () => {
  const rule = { type: 'SPECIFIC_DAYS' as const, days: [1, 3, 5] };

  it('missing an unscheduled Tuesday does not break the streak', () => {
    const habit = makeHabit({ recurrenceRule: rule, createdAt: localNoonIso(2026, 8, 19) }); // Saturday before
    // Mon 21, Wed 23, Fri 25 completed — Tue/Thu/weekend have no logs (unscheduled, irrelevant)
    const logs = ['2026-09-21', '2026-09-23', '2026-09-25'].map((d) => makeLog(d));
    const today = new Date(2026, 8, 25, 12); // Friday
    const result = calculateStreak(habit, logs, today);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it('missing a scheduled Wednesday breaks the streak at that point', () => {
    const habit = makeHabit({ recurrenceRule: rule, createdAt: localNoonIso(2026, 8, 19) });
    const logs = [makeLog('2026-09-21'), makeLog('2026-09-25')]; // Wed 23 missing
    const today = new Date(2026, 8, 26, 12); // Saturday, so Wed 23 counts as a fully-elapsed miss
    const result = calculateStreak(habit, logs, today);
    expect(result.current).toBe(1); // only Friday counts, walk stops at the Wednesday miss
  });
});

describe('calculateStreak — X_TIMES_PER_WEEK', () => {
  const rule = { type: 'X_TIMES_PER_WEEK' as const, times: 2 };

  it('a still-in-progress current week does not break a prior met week', () => {
    const habit = makeHabit({ recurrenceRule: rule, createdAt: localNoonIso(2026, 8, 14) }); // Monday
    // Week of 9-14: two completions (meets target of 2)
    // Week of 9-21 (current, today = Wed 9-23): only one completion so far
    const logs = [makeLog('2026-09-15'), makeLog('2026-09-16'), makeLog('2026-09-22')];
    const today = new Date(2026, 8, 23, 12); // Wednesday, week not over
    const result = calculateStreak(habit, logs, today);
    expect(result.current).toBe(1); // previous week maintained, current week still pending
    expect(result.longest).toBe(1);
  });

  it('a fully elapsed week that missed the target breaks the streak', () => {
    const habit = makeHabit({ recurrenceRule: rule, createdAt: localNoonIso(2026, 8, 7) });
    // Week of 9-7: 2 completions (met). Week of 9-14: only 1 (missed, and week is over).
    const logs = [makeLog('2026-09-08'), makeLog('2026-09-09'), makeLog('2026-09-15')];
    const today = new Date(2026, 8, 23, 12); // well past week of 9-14
    const result = calculateStreak(habit, logs, today);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(1);
  });
});
