import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculateCategoryBreakdown, calculateCompletionRate, calculateTimeMetrics, formatHours } from '@/analytics/completion';
import { calculateStreak } from '@/analytics/streaks';
import { BarChart } from '@/components/BarChart';
import { EmptyState } from '@/components/EmptyState';
import { MetricCard } from '@/components/MetricCard';
import { ProgressBar } from '@/components/ProgressBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { listLogsForHabit } from '@/db/repositories/habitLogRepository';
import { useActivitiesInRange } from '@/hooks/useActivities';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useTheme } from '@/theme/ThemeProvider';
import { toDateKey, todayKey } from '@/utils/date';

type Period = 'WEEK' | 'MONTH' | 'YEAR';

function rangeFor(period: Period, today: Date): { start: Date; end: Date } {
  if (period === 'WEEK') return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
  if (period === 'MONTH') return { start: startOfMonth(today), end: endOfMonth(today) };
  return { start: new Date(today.getFullYear(), 0, 1), end: new Date(today.getFullYear(), 11, 31) };
}

export default function ProgresoScreen() {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const [period, setPeriod] = useState<Period>('WEEK');
  const categories = useCategories();
  const habits = useHabits();

  const { start, end } = useMemo(() => rangeFor(period, new Date()), [period]);
  const startKey = toDateKey(start);
  const endKey = toDateKey(end);
  const activities = useActivitiesInRange(startKey, endKey);

  const completionRate = calculateCompletionRate(activities);
  const timeMetrics = calculateTimeMetrics(activities);
  const highPriority = activities.filter((a) => a.priority === 'HIGH');
  const highPriorityCompleted = highPriority.filter((a) => a.status === 'COMPLETED').length;
  const categoryBreakdown = calculateCategoryBreakdown(activities);

  const habitsWithStreak = useMemo(
    () => habits.map((h) => ({ habit: h, streak: calculateStreak(h, listLogsForHabit(h.id)) })),
    [habits],
  );
  const habitsMaintained = habitsWithStreak.filter((h) => h.streak.current > 0).length;

  const chartData = useMemo(() => {
    if (period !== 'WEEK') return [];
    const today = todayKey();
    return Array.from({ length: 7 }, (_, i) => {
      const day = toDateKey(addDays(start, i));
      const dayActivities = activities.filter((a) => a.date === day);
      const rate = dayActivities.length === 0 ? 0 : calculateCompletionRate(dayActivities) / 100;
      return { label: day === today ? 'Hoy' : day.slice(8), value: rate };
    });
  }, [period, start, activities]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 140, gap: spacing.xl }}>
        <Text style={[type.h1, { color: colors.textPrimary }]}>Progreso</Text>

        <SegmentedControl
          options={[
            { value: 'WEEK', label: 'Semana' },
            { value: 'MONTH', label: 'Mes' },
            { value: 'YEAR', label: 'Año' },
          ]}
          value={period}
          onChange={setPeriod}
        />

        {activities.length === 0 ? (
          <EmptyState
            title="Aún estamos construyendo tu historial."
            message="Completa algunas actividades para comenzar a ver tu progreso."
          />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <MetricCard label="Actividades" value={String(activities.length)} />
              <MetricCard label="Completadas" value={String(activities.filter((a) => a.status === 'COMPLETED').length)} accentColor={colors.success} />
              <MetricCard label="Cumplimiento" value={`${completionRate}%`} accentColor={colors.primary} />
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <MetricCard label="Tiempo planeado" value={formatHours(timeMetrics.plannedMinutes)} />
              <MetricCard label="Tiempo completado" value={formatHours(timeMetrics.completedMinutes)} />
              <MetricCard label="Prioridad alta" value={`${highPriorityCompleted}/${highPriority.length}`} />
            </View>

            {period === 'WEEK' && chartData.length > 0 && (
              <View style={[shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }]}>
                <Text style={[type.bodyMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                  Cumplimiento por día
                </Text>
                <BarChart data={chartData} />
              </View>
            )}

            <View style={{ gap: spacing.sm }}>
              <Text style={[type.label, { color: colors.textTertiary }]}>POR CATEGORÍA</Text>
              {categoryBreakdown.map((entry) => {
                const category = categories.find((c) => c.id === entry.categoryId);
                return (
                  <View key={entry.categoryId ?? 'none'} style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[type.bodySmall, { color: colors.textPrimary }]}>{category?.name ?? 'Sin categoría'}</Text>
                      <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
                        {entry.completed}/{entry.total}
                      </Text>
                    </View>
                    <ProgressBar progress={entry.total === 0 ? 0 : entry.completed / entry.total} color={category?.color} />
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View style={{ gap: spacing.sm }}>
          <Text style={[type.label, { color: colors.textTertiary }]}>HÁBITOS</Text>
          <MetricCard label="Con racha activa" value={`${habitsMaintained} / ${habits.length}`} accentColor={colors.accentGold} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
