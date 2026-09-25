import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/components/CategoryBadge';
import { CompletionToggle } from '@/components/CompletionToggle';
import { HabitHeatmap } from '@/components/HabitHeatmap';
import { IconEmoji } from '@/components/IconEmoji';
import { MetricCard } from '@/components/MetricCard';
import { TextField } from '@/components/TextField';
import { calculateStreak } from '@/analytics/streaks';
import { WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { deleteHabit, getHabit } from '@/db/repositories/habitRepository';
import { getLogForDate, listLogsForHabit, logHabit } from '@/db/repositories/habitLogRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategoryMap } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import { describeRecurrence, isScheduledDay, startOfWeekKey } from '@/utils/recurrence';
import { addDaysToKey, todayKey } from '@/utils/date';
import { hapticComplete } from '@/utils/haptics';

const HISTORY_WEEKS = 6;

function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}min`;
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius, type, shadow } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const categoryMap = useCategoryMap();
  const [pendingValue, setPendingValue] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  const habit = useMemo(() => (id ? getHabit(id) : null), [id, dataVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  const logs = useMemo(() => (habit ? listLogsForHabit(habit.id) : []), [habit, dataVersion]);
  const streak = useMemo(() => (habit ? calculateStreak(habit, logs) : { current: 0, longest: 0 }), [habit, logs]);
  const today = todayKey();
  const todayLog = habit ? getLogForDate(habit.id, today) : null;

  if (!habit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, padding: spacing.xl }}>Hábito no encontrado.</Text>
      </SafeAreaView>
    );
  }

  const category = habit.categoryId ? (categoryMap.get(habit.categoryId) ?? null) : null;
  const totalCompleted = logs.filter((l) => l.status === 'COMPLETED').length;
  const totalMinutes =
    habit.measurementType === 'DURATION' ? logs.filter((l) => l.status === 'COMPLETED').reduce((sum, l) => sum + (l.value ?? 0), 0) : 0;

  const completedDates = new Set(logs.filter((l) => l.status === 'COMPLETED').map((l) => l.date));
  const weekStart = startOfWeekKey(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dateKey = addDaysToKey(weekStart, i);
    const scheduled = habit.recurrenceRule.type === 'X_TIMES_PER_WEEK' || isScheduledDay(habit.recurrenceRule, dateKey);
    return {
      dateKey,
      scheduled,
      completed: completedDates.has(dateKey),
      isToday: dateKey === today,
      isFuture: dateKey > today,
    };
  });

  const weeklyHistory = Array.from({ length: HISTORY_WEEKS }, (_, i) => {
    const wStart = addDaysToKey(weekStart, -7 * (HISTORY_WEEKS - 1 - i));
    const wEnd = addDaysToKey(wStart, 6);
    if (habit.recurrenceRule.type === 'X_TIMES_PER_WEEK') {
      const done = logs.filter((l) => l.status === 'COMPLETED' && l.date >= wStart && l.date <= wEnd).length;
      return { weekStart: wStart, done: Math.min(done, habit.recurrenceRule.times), due: habit.recurrenceRule.times };
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
    return { weekStart: wStart, done, due };
  });

  const completeToday = () => {
    if (habit.measurementType === 'CHECKBOX') {
      const alreadyCompleted = todayLog?.status === 'COMPLETED';
      logHabit(habit.id, today, alreadyCompleted ? 'SKIPPED' : 'COMPLETED');
      if (!alreadyCompleted) hapticComplete();
    } else {
      const value = Number(pendingValue);
      if (!value) return;
      logHabit(habit.id, today, 'COMPLETED', value);
      setPendingValue('');
      hapticComplete();
    }
    bumpDataVersion();
  };

  const confirmDelete = () => {
    Alert.alert('Eliminar hábito', `¿Eliminar "${habit.name}"? Se perderá el historial.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteHabit(habit.id);
          bumpDataVersion();
          router.back();
        },
      },
    ]);
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Cerrar" hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <Pressable
            onPress={() => router.push({ pathname: '/create/habit', params: { id: habit.id } })}
            accessibilityLabel="Editar"
            hitSlop={8}
          >
            <Ionicons name="pencil-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={confirmDelete} accessibilityLabel="Eliminar" hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={colors.statusOverdue} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xl * 2, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
            <IconEmoji icon={habit.icon} size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.h2, { color: colors.textPrimary }]}>{habit.name}</Text>
            {category && <CategoryBadge category={category} />}
          </View>
        </View>

        <Text style={[type.body, { color: colors.textSecondary }]}>
          {describeRecurrence(habit.recurrenceRule, WEEKDAY_LABELS_SHORT)}
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <MetricCard label="Racha actual" value={String(streak.current)} accentColor={colors.accentGold} />
          <MetricCard label="Mejor racha" value={String(streak.longest)} />
          <MetricCard label="Sesiones" value={String(totalCompleted)} />
        </View>

        {habit.measurementType === 'DURATION' && (
          <View style={{ flexDirection: 'row' }}>
            <MetricCard label="Tiempo total" value={formatDuration(totalMinutes)} accentColor={category?.color} />
          </View>
        )}

        <View>
          <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sm }]}>ESTA SEMANA</Text>
          <View style={[styles.weekRow, shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md }]}>
            {weekDays.map((d, i) => {
              const dot = d.completed
                ? colors.success
                : d.isFuture || !d.scheduled
                  ? colors.surfaceAlt
                  : colors.statusOverdue;
              return (
                <View key={d.dateKey} style={styles.weekDayCell}>
                  <Text style={[type.caption, { color: colors.textTertiary }]}>{WEEKDAY_LABELS_SHORT[i]}</Text>
                  <View
                    style={[
                      styles.weekDot,
                      {
                        backgroundColor: d.completed ? dot : 'transparent',
                        borderColor: dot,
                        borderWidth: d.completed ? 0 : d.scheduled && !d.isFuture ? 1.5 : 1,
                        opacity: d.isToday ? 1 : d.scheduled ? 0.85 : 0.4,
                      },
                    ]}
                  >
                    {d.completed && <Ionicons name="checkmark" size={13} color={colors.onPrimary} />}
                  </View>
                  {d.isToday && <View style={[styles.todayMark, { backgroundColor: colors.primary }]} />}
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }]}>
          <Text style={[type.bodyMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Hoy</Text>
          {habit.measurementType === 'CHECKBOX' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <CompletionToggle completed={todayLog?.status === 'COMPLETED'} onPress={completeToday} size={32} />
              <Text style={[type.body, { color: colors.textSecondary }]}>
                {todayLog?.status === 'COMPLETED' ? 'Completado' : 'Marcar como hecho'}
              </Text>
            </View>
          ) : todayLog ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <CompletionToggle completed onPress={completeToday} size={28} />
              <Text style={[type.body, { color: colors.textSecondary }]}>
                Registrado: {todayLog.value} {habit.targetUnit ?? ''} · Meta: {habit.target ?? ''} {habit.targetUnit ?? ''}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <TextField
                  label=""
                  value={pendingValue}
                  onChangeText={setPendingValue}
                  keyboardType="numeric"
                  placeholder={`Meta: ${habit.target ?? ''} ${habit.targetUnit ?? ''}`}
                />
              </View>
              <Pressable
                onPress={completeToday}
                style={[styles.registerButton, { backgroundColor: colors.primary, borderRadius: radius.md }]}
              >
                <Text style={[type.bodyMedium, { color: colors.onPrimary }]}>Registrar</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View>
          <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sm }]}>CONSISTENCIA</Text>
          <HabitHeatmap habit={habit} logs={logs} color={category?.color ?? colors.success} />
        </View>

        <View>
          <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sm }]}>HISTORIAL SEMANAL</Text>
          <View style={{ gap: spacing.xs }}>
            {weeklyHistory.map(({ weekStart, done, due }) => {
              const weekEnd = addDaysToKey(weekStart, 6);
              const start = new Date(weekStart);
              const end = new Date(weekEnd);
              return (
                <View
                  key={weekStart}
                  style={[
                    styles.historyRow,
                    { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
                  ]}
                >
                  <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
                    {start.getDate()} — {end.getDate()} {end.toLocaleDateString('es-CO', { month: 'short' })}
                  </Text>
                  <Text style={[type.bodySmall, { color: due > 0 && done === due ? colors.success : colors.textPrimary }]}>
                    {done}/{due}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => router.push(`/habit/stats/${habit.id}`)}
          style={[styles.statsButton, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md }]}
        >
          <Ionicons name="stats-chart-outline" size={18} color={colors.primary} />
          <Text style={[type.bodyMedium, { color: colors.primary }]}>Ver todas las estadísticas</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: {},
  registerButton: { paddingHorizontal: 16, paddingVertical: 12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDayCell: { alignItems: 'center', gap: 6 },
  weekDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  todayMark: { width: 4, height: 4, borderRadius: 2 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
