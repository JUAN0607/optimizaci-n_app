import { isScheduledDay, startOfWeekKey } from '@/utils/recurrence';

describe('isScheduledDay', () => {
  it('DAILY is scheduled every day', () => {
    expect(isScheduledDay({ type: 'DAILY' }, '2026-09-21')).toBe(true);
    expect(isScheduledDay({ type: 'DAILY' }, '2026-09-22')).toBe(true);
  });

  it('SPECIFIC_DAYS only matches the given weekdays (Mon/Wed/Fri)', () => {
    const rule = { type: 'SPECIFIC_DAYS' as const, days: [1, 3, 5] };
    // 2026-09-21 is a Monday, 2026-09-22 is a Tuesday, 2026-09-23 is a Wednesday
    expect(isScheduledDay(rule, '2026-09-21')).toBe(true); // Mon
    expect(isScheduledDay(rule, '2026-09-22')).toBe(false); // Tue
    expect(isScheduledDay(rule, '2026-09-23')).toBe(true); // Wed
  });

  it('X_TIMES_PER_WEEK is eligible every day (no fixed weekday)', () => {
    const rule = { type: 'X_TIMES_PER_WEEK' as const, times: 3 };
    for (const day of ['2026-09-21', '2026-09-22', '2026-09-27']) {
      expect(isScheduledDay(rule, day)).toBe(true);
    }
  });

  it('MONTHLY matches only the configured day of month, clamped to the month length', () => {
    const rule = { type: 'MONTHLY' as const, dayOfMonth: 31 };
    expect(isScheduledDay(rule, '2026-01-31')).toBe(true);
    // April has 30 days — clamps to the last day
    expect(isScheduledDay(rule, '2026-04-30')).toBe(true);
    expect(isScheduledDay(rule, '2026-04-29')).toBe(false);
  });

  it('EVERY_X_DAYS matches the anchor date and every Nth day after it', () => {
    const rule = { type: 'EVERY_X_DAYS' as const, interval: 2, anchorDate: '2026-09-01' };
    expect(isScheduledDay(rule, '2026-09-01')).toBe(true);
    expect(isScheduledDay(rule, '2026-09-02')).toBe(false);
    expect(isScheduledDay(rule, '2026-09-03')).toBe(true);
    expect(isScheduledDay(rule, '2026-08-31')).toBe(false); // before anchor
  });
});

describe('startOfWeekKey', () => {
  it('returns the Monday of the week containing the date', () => {
    expect(startOfWeekKey('2026-09-23')).toBe('2026-09-21'); // Wednesday -> Monday
    expect(startOfWeekKey('2026-09-21')).toBe('2026-09-21'); // Monday -> itself
    expect(startOfWeekKey('2026-09-20')).toBe('2026-09-14'); // Sunday -> previous Monday
  });
});
