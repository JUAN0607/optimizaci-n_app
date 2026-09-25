import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculateStreak } from '@/analytics/streaks';
import { EmptyState } from '@/components/EmptyState';
import { HabitCard } from '@/components/HabitCard';
import { IconEmoji } from '@/components/IconEmoji';
import { SegmentedControl } from '@/components/SegmentedControl';
import { WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { getLogForDate, listLogsForHabit, logHabit } from '@/db/repositories/habitLogRepository';
import { listRoutineItems, listRoutines } from '@/db/repositories/routineRepository';
import { listCompletedItemIds } from '@/db/repositories/routineLogRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategoryMap } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useUndoStore } from '@/hooks/useUndoStore';
import { useTheme } from '@/theme/ThemeProvider';
import { addDaysToKey, todayKey } from '@/utils/date';
import { hapticComplete } from '@/utils/haptics';
import { describeRecurrence, isScheduledDay, startOfWeekKey } from '@/utils/recurrence';
import type { Habit, HabitLog } from '@/types/entities';

function weekProgressForHabit(habit: Habit, logs: HabitLog[], weekStart: string, today: string) {
  if (habit.recurrenceRule.type === 'X_TIMES_PER_WEEK') {
    const target = habit.recurrenceRule.times;
    const doneThisWeek = logs.filter((l) => l.status === 'COMPLETED' && l.date >= weekStart && l.date <= today).length;
    return { due: target, done: Math.min(doneThisWeek, target) };
  }
  const completedDates = new Set(logs.filter((l) => l.status === 'COMPLETED').map((l) => l.date));
  let due = 0;
  let done = 0;
  let cursor = weekStart;
  while (cursor <= today) {
    if (isScheduledDay(habit.recurrenceRule, cursor)) {
      due += 1;
      if (completedDates.has(cursor)) done += 1;
    }
    cursor = addDaysToKey(cursor, 1);
  }
  return { due, done };
}

type Tab = 'habits' | 'routines';

export default function HabitosScreen() {
  const { colors, spacing, type, radius, shadow } = useTheme();
  const [tab, setTab] = useState<Tab>('habits');
  const habits = useHabits();
  const categoryMap = useCategoryMap();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const showUndo = useUndoStore((s) => s.show);
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

  const weekStats = useMemo(() => {
    if (rows.length === 0) return { bestStreak: 0, weekPercent: 0 };
    const bestStreak = Math.max(...rows.map((r) => r.streak.current));
    const weekStart = startOfWeekKey(today);
    let due = 0;
    let done = 0;
    for (const { habit, logs } of rows) {
      const progress = weekProgressForHabit(habit, logs, weekStart, today);
      due += progress.due;
      done += progress.done;
    }
    return { bestStreak, weekPercent: due === 0 ? 0 : Math.round((done / due) * 100) };
  }, [rows, today]);

  const toggleComplete = (habitId: string, alreadyCompleted: boolean, habitName: string) => {
    logHabit(habitId, today, alreadyCompleted ? 'SKIPPED' : 'COMPLETED');
    bumpDataVersion();
    if (!alreadyCompleted) {
      hapticComplete();
      showUndo(`"${habitName}" completado`, () => {
        logHabit(habitId, today, 'SKIPPED');
        bumpDataVersion();
      });
    }
  };

  const routineRows = useMemo(() => {
    if (tab !== 'routines') return [];
    return listRoutines().map((routine) => {
      const items = listRoutineItems(routine.id);
      const completedIds = listCompletedItemIds(routine.id, today);
      const scheduledToday = !routine.recurrenceRule || isScheduledDay(routine.recurrenceRule, today);
      return {
        routine,
        total: items.length,
        completed: items.filter((i) => completedIds.has(i.id)).length,
        scheduledToday,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  }, [tab, dataVersion, today]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}>
        <Text style={[type.h1, { color: colors.textPrimary, marginBottom: spacing.lg }]}>Hábitos</Text>

        {rows.length > 0 && (
          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
            <View
              style={[
                shadow.floating,
                { flex: 1, backgroundColor: colors.primaryStrong, borderRadius: radius.lg, padding: spacing.lg },
              ]}
            >
              <Ionicons name="flame" size={20} color={colors.accentGold} style={{ marginBottom: spacing.md }} />
              <Text style={[type.h1, { color: colors.onPrimaryStrong }]}>{weekStats.bestStreak}</Text>
              <Text style={[type.bodySmall, { color: colors.onPrimaryStrong, opacity: 0.8, marginTop: 2 }]}>Racha actual</Text>
            </View>
            <View style={[shadow.card, { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg }]}>
              <Ionicons name="bar-chart" size={20} color={colors.accentForest} style={{ marginBottom: spacing.md }} />
              <Text style={[type.h1, { color: colors.textPrimary }]}>{weekStats.weekPercent}%</Text>
              <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>Esta semana</Text>
            </View>
          </View>
        )}

        <SegmentedControl
          options={[
            { value: 'habits', label: 'Hábitos' },
            { value: 'routines', label: 'Rutinas' },
          ]}
          value={tab}
          onChange={setTab}
        />

        <View style={{ marginTop: spacing.xl }}>
          {tab === 'habits' ? (
            rows.length === 0 ? (
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
                    onToggleComplete={() => toggleComplete(habit.id, todayLog?.status === 'COMPLETED', habit.name)}
                  />
                ))}
              </View>
            )
          ) : routineRows.length === 0 ? (
            <EmptyState title="Todavía no tienes rutinas." message="Crea una rutina para encadenar varios pasos." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {routineRows.map(({ routine, total, completed, scheduledToday }) => (
                <Pressable
                  key={routine.id}
                  onPress={() => router.push(`/routine/${routine.id}`)}
                  style={[
                    shadow.card,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      backgroundColor: colors.surface,
                      borderRadius: radius.lg,
                      padding: spacing.lg,
                      opacity: scheduledToday ? 1 : 0.6,
                    },
                  ]}
                >
                  <IconEmoji icon={routine.icon} size={22} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>{routine.name}</Text>
                    <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                      {routine.recurrenceRule ? describeRecurrence(routine.recurrenceRule, WEEKDAY_LABELS_SHORT) : 'Todos los días'}
                      {scheduledToday ? ` · ${completed} / ${total} pasos hoy` : ' · no programada hoy'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
