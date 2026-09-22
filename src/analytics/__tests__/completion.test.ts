import { calculateCategoryBreakdown, calculateCompletionRate, calculateTimeMetrics } from '@/analytics/completion';
import type { Activity } from '@/types/entities';

function makeActivity(overrides: Partial<Activity>): Activity {
  return {
    id: `a-${Math.random()}`,
    title: 'Test',
    notes: null,
    type: 'TASK',
    categoryId: null,
    date: '2026-09-22',
    startTime: null,
    endTime: null,
    duration: null,
    priority: null,
    status: 'PENDING',
    isRecurring: false,
    recurrenceRule: null,
    recurrenceGroupId: null,
    reminder: null,
    location: null,
    createdAt: '2026-09-22T00:00:00.000Z',
    updatedAt: '2026-09-22T00:00:00.000Z',
    completedAt: null,
    ...overrides,
  };
}

describe('calculateCompletionRate', () => {
  it('returns 0 for an empty list', () => {
    expect(calculateCompletionRate([])).toBe(0);
  });

  it('computes completed / planned * 100', () => {
    const activities = [
      makeActivity({ status: 'COMPLETED' }),
      makeActivity({ status: 'COMPLETED' }),
      makeActivity({ status: 'PENDING' }),
      makeActivity({ status: 'SKIPPED' }),
    ];
    expect(calculateCompletionRate(activities)).toBe(50);
  });
});

describe('calculateTimeMetrics', () => {
  it('sums planned minutes from duration or start/end time', () => {
    const activities = [
      makeActivity({ duration: 30, status: 'COMPLETED' }),
      makeActivity({ startTime: '09:00', endTime: '10:30', status: 'PENDING' }),
    ];
    const result = calculateTimeMetrics(activities);
    expect(result.plannedMinutes).toBe(30 + 90);
    expect(result.completedMinutes).toBe(30);
  });
});

describe('calculateCategoryBreakdown', () => {
  it('groups totals and completions by category', () => {
    const activities = [
      makeActivity({ categoryId: 'cat-1', status: 'COMPLETED' }),
      makeActivity({ categoryId: 'cat-1', status: 'PENDING' }),
      makeActivity({ categoryId: 'cat-2', status: 'COMPLETED' }),
    ];
    const breakdown = calculateCategoryBreakdown(activities);
    const cat1 = breakdown.find((b) => b.categoryId === 'cat-1');
    const cat2 = breakdown.find((b) => b.categoryId === 'cat-2');
    expect(cat1).toEqual({ categoryId: 'cat-1', total: 2, completed: 1 });
    expect(cat2).toEqual({ categoryId: 'cat-2', total: 1, completed: 1 });
  });
});
