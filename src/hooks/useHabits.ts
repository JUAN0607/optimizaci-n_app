import { useMemo } from 'react';

import { listHabits } from '@/db/repositories/habitRepository';
import { listLogsForHabit } from '@/db/repositories/habitLogRepository';
import { useAppStore } from '@/hooks/useAppStore';
import type { Habit, HabitLog } from '@/types/entities';

export function useHabits(): Habit[] {
  const dataVersion = useAppStore((s) => s.dataVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  return useMemo(() => listHabits(), [dataVersion]);
}

export function useHabitLogs(habitId: string): HabitLog[] {
  const dataVersion = useAppStore((s) => s.dataVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  return useMemo(() => listLogsForHabit(habitId), [habitId, dataVersion]);
}
