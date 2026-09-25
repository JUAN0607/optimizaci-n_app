import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculateStreak } from '@/analytics/streaks';
import { BarChart } from '@/components/BarChart';
import { IconEmoji } from '@/components/IconEmoji';
import { MetricCard } from '@/components/MetricCard';
import { getHabit } from '@/db/repositories/habitRepository';
import { listLogsForHabit } from '@/db/repositories/habitLogRepository';
import { useCategoryMap } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import { addDaysToKey, todayKey } from '@/utils/date';
import { isScheduledDay, startOfWeekKey } from '@/utils/recurrence';

const WEEKS = 12;
const MONTHS = 6;

export default function HabitStatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius, type, shadow } = useTheme();
  const categoryMap = useCategoryMap();

  const habit = id ? getHabit(id) : null;
  const logs = useMemo(() => (habit ? listLogsForHabit(habit.id) : []), [habit]);

  if (!habit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary, padding: spacing.xl }}>Hábito no encontrado.</Text>
      </SafeAreaView>
    );
  }

  const category = habit.categoryId ? (categoryMap.get(habit.categoryId) ?? null) : null;
  const streak = calculateStreak(habit, logs);
  const today = todayKey();
  const completedDates = new Set(logs.filter((l) => l.status === 'COMPLETED').map((l) => l.date));
  const currentWeekStart = startOfWeekKey(today);

  const weeklyRates = Array.from({ length: WEEKS }, (_, i) => {
    const wStart = addDaysToKey(currentWeekStart, -7 * (WEEKS - 1 - i));
    const wEnd = addDaysToKey(wStart, 6);
    if (habit.recurrenceRule.type === 'X_TIMES_PER_WEEK') {
      const done = logs.filter((l) => l.status === 'COMPLETED' && l.date >= wStart && l.date <= wEnd).length;
      return { label: `${new Date(wStart).getDate()}`, value: Math.min(1, done / habit.recurrenceRule.times) };
    }
    let due = 0;
    let done = 0;
    let cursor = wStart;
    while (cursor <= wEnd && cursor <= today) {
      if (isScheduledDay(habit.recurrenceRule, cursor)) {
        due += 1;
        if (completedDates.has(cursor)) done += 1;
      }
      cursor = addDaysToKey(cursor, 1);
    }
    return { label: `${new Date(wStart).getDate()}`, value: due === 0 ? 0 : done / due };
  });

  const now = new Date();
  const monthlyRates = Array.from({ length: MONTHS }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1);
    const monthLabel = monthDate.toLocaleDateString('es-CO', { month: 'short' });
    const monthLogs = logs.filter((l) => {
      const d = new Date(l.date);
      return l.status === 'COMPLETED' && d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
    });
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    let due = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = addDaysToKey(`${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`, d - 1);
      if (dateKey > today) break;
      if (isScheduledDay(habit.recurrenceRule, dateKey)) due += 1;
    }
    return { label: monthLabel, value: due === 0 ? 0 : Math.min(1, monthLogs.length / due) };
  });

  const totalCompleted = logs.filter((l) => l.status === 'COMPLETED').length;
  const overallRate = weeklyRates.length === 0 ? 0 : Math.round((weeklyRates.reduce((s, w) => s + w.value, 0) / weeklyRates.length) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Cerrar" hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <IconEmoji icon={habit.icon} size={22} color={colors.primary} />
        <Text style={[type.h3, { color: colors.textPrimary }]} numberOfLines={1}>
          {habit.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <MetricCard label="Cumplimiento (12 sem)" value={`${overallRate}%`} accentColor={category?.color} />
          <MetricCard label="Mejor racha" value={String(streak.longest)} accentColor={colors.accentGold} />
          <MetricCard label="Total sesiones" value={String(totalCompleted)} />
        </View>

        <View style={[shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }]}>
          <Text style={[type.bodyMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>Cumplimiento semanal</Text>
          <BarChart data={weeklyRates} color={category?.color ?? colors.primary} height={110} />
        </View>

        <View style={[shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }]}>
          <Text style={[type.bodyMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>Cumplimiento mensual</Text>
          <BarChart data={monthlyRates} color={colors.accentTeal} height={110} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
