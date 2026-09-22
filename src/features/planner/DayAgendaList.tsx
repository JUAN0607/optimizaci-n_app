import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { ActivityCard } from '@/components/ActivityCard';
import { EmptyState } from '@/components/EmptyState';
import { setActivityStatus } from '@/db/repositories/activityRepository';
import { useActivitiesForDate } from '@/hooks/useActivities';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategoryMap } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';

export function DayAgendaList({ dateKey }: { dateKey: string }) {
  const { spacing } = useTheme();
  const activities = useActivitiesForDate(dateKey);
  const categoryMap = useCategoryMap();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);

  const toggleComplete = (id: string, status: string) => {
    setActivityStatus(id, status === 'COMPLETED' ? 'PENDING' : 'COMPLETED');
    bumpDataVersion();
  };

  if (activities.length === 0) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <EmptyState title="Tu día está libre." message="Planifica algo nuevo o disfruta el espacio." />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 140, gap: spacing.md }}>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          category={activity.categoryId ? (categoryMap.get(activity.categoryId) ?? null) : null}
          onPress={() => router.push(`/activity/${activity.id}`)}
          onToggleComplete={() => toggleComplete(activity.id, activity.status)}
        />
      ))}
    </ScrollView>
  );
}
