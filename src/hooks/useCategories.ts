import { useMemo } from 'react';

import { listCategories } from '@/db/repositories/categoryRepository';
import { useAppStore } from '@/hooks/useAppStore';
import type { Category } from '@/types/entities';

export function useCategories(): Category[] {
  const dataVersion = useAppStore((s) => s.dataVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  return useMemo(() => listCategories(), [dataVersion]);
}

export function useCategoryMap(): Map<string, Category> {
  const categories = useCategories();
  return useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
}
