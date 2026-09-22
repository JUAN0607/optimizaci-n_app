import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculateStreak } from '@/analytics/streaks';
import { EmptyState } from '@/components/EmptyState';
import { HabitCard } from '@/components/HabitCard';
import { getLogForDate, listLogsForHabit, logHabit } from '@/db/repositories/habitLogRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategoryMap } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useTheme } from '@/theme/ThemeProvider';
import { todayKey } from '@/utils/date';
import { hapticComplete } from '@/utils/haptics';

export default function HabitosScreen() {
  const { colors, spacing, type } = useTheme();
  const habits = useHabits();
  const categoryMap = useCategoryMap();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const today = todayKey();

  const rows = useMemo(
    () =>
      habits.map((habit) => {
        const logs = listLogsForHabit(habit.id);
        const streak = calculateStreak(habit, logs);
        const todayLog = getLogForDate(habit.id, today);
        return { habit, logs, streak, todayLog };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [habits, dataVersion],
  );

  const toggleComplete = (habitId: string, alreadyCompleted: boolean) => {
    logHabit(habitId, today, alreadyCompleted ? 'SKIPPED' : 'COMPLETED');
    if (!alreadyCompleted) hapticComplete();
    bumpDataVersion();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}>
        <Text style={[type.h1, { color: colors.textPrimary, marginBottom: spacing.xl }]}>Hábitos</Text>

        {rows.length === 0 ? (
          <EmptyState title="Todavía no tienes hábitos." message="Empieza con uno pequeño." />
        ) : (
          <View style={{ gap: spacing.md }}>
            {rows.map(({ habit, streak, todayLog }) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                category={habit.categoryId ? (categoryMap.get(habit.categoryId) ?? null) : null}
                todayLog={todayLog}
                streak={streak.current}
                onPress={() => router.push(`/habit/${habit.id}`)}
                onToggleComplete={() => toggleComplete(habit.id, todayLog?.status === 'COMPLETED')}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
