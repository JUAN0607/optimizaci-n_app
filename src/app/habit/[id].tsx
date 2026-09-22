import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/components/CategoryBadge';
import { CompletionToggle } from '@/components/CompletionToggle';
import { MetricCard } from '@/components/MetricCard';
import { TextField } from '@/components/TextField';
import { calculateStreak } from '@/analytics/streaks';
import { WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { deleteHabit, getHabit } from '@/db/repositories/habitRepository';
import { getLogForDate, listLogsForHabit, logHabit } from '@/db/repositories/habitLogRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategoryMap } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import { describeRecurrence, isScheduledDay } from '@/utils/recurrence';
import { addDaysToKey, todayKey } from '@/utils/date';
import { hapticComplete } from '@/utils/haptics';

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

  const last28 = Array.from({ length: 28 }, (_, i) => addDaysToKey(today, -(27 - i)));
  const logByDate = new Map(logs.map((l) => [l.date, l]));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Cerrar" hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={confirmDelete} accessibilityLabel="Eliminar" hitSlop={8}>
          <Ionicons name="trash-outline" size={22} color={colors.statusOverdue} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={habit.icon as never} size={24} color={colors.primary} />
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
          <MetricCard label="Total" value={String(totalCompleted)} />
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
          <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sm }]}>ÚLTIMOS 28 DÍAS</Text>
          <View style={styles.grid}>
            {last28.map((dateKey) => {
              const log = logByDate.get(dateKey);
              const scheduled = isScheduledDay(habit.recurrenceRule, dateKey);
              const bg = log?.status === 'COMPLETED' ? colors.success : scheduled ? colors.surfaceAlt : 'transparent';
              return <View key={dateKey} style={[styles.dot, { backgroundColor: bg }]} />;
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: {},
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dot: { width: 18, height: 18, borderRadius: 4 },
  registerButton: { paddingHorizontal: 16, paddingVertical: 12 },
});
