import type { PlanFilters } from '@/components/PlanFilterModal';
import type { Activity } from '@/types/entities';

export function applyPlanFilters(activities: Activity[], filters: PlanFilters): Activity[] {
  return activities.filter((a) => {
    if (filters.categoryIds.length > 0 && (!a.categoryId || !filters.categoryIds.includes(a.categoryId))) return false;
    if (filters.types.length > 0 && !filters.types.includes(a.type)) return false;
    if (filters.priorities.length > 0 && (!a.priority || !filters.priorities.includes(a.priority))) return false;
    if (filters.states.length > 0) {
      const state = a.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING';
      if (!filters.states.includes(state)) return false;
    }
    return true;
  });
}
