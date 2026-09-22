import { useMemo } from 'react';

import { listActivitiesForDate, listActivitiesInRange } from '@/db/repositories/activityRepository';
import { useAppStore } from '@/hooks/useAppStore';
import type { Activity } from '@/types/entities';

export function useActivitiesForDate(dateKey: string): Activity[] {
  const dataVersion = useAppStore((s) => s.dataVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  return useMemo(() => listActivitiesForDate(dateKey), [dateKey, dataVersion]);
}

export function useActivitiesInRange(startDate: string, endDate: string): Activity[] {
  const dataVersion = useAppStore((s) => s.dataVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  return useMemo(() => listActivitiesInRange(startDate, endDate), [startDate, endDate, dataVersion]);
}
