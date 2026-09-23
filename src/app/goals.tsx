import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { UndoSnackbar } from '@/components/UndoSnackbar';
import { deleteGoal, listGoals, restoreGoal, updateGoalStatus } from '@/db/repositories/goalRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useUndoStore } from '@/hooks/useUndoStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { Goal } from '@/types/entities';

const TIMEFRAME_LABELS: Record<Goal['timeframe'], string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
  CUSTOM: 'Personalizado',
};

const STATUS_LABELS: Record<Goal['status'], string> = {
  ACTIVE: 'Activa',
  COMPLETED: 'Completada',
  ABANDONED: 'Abandonada',
};

export default function GoalsScreen() {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const dataVersion = useAppStore((s) => s.dataVersion);
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);
  const showUndo = useUndoStore((s) => s.show);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  const goals = useMemo(() => listGoals(), [dataVersion]);

  const confirmDelete = (goal: Goal) => {
    Alert.alert('Eliminar meta', `¿Eliminar "${goal.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteGoal(goal.id);
          bumpDataVersion();
          // Deferred so the snackbar mounts after the confirmation Alert's own dismiss
          // animation finishes — showing it immediately raced that native modal and
          // swallowed its taps (same issue fixed for activity delete).
          setTimeout(() => {
            showUndo(`"${goal.title}" eliminada`, () => {
              restoreGoal(goal);
              bumpDataVersion();
            });
          }, 400);
        },
      },
    ]);
  };

  const cycleStatus = (goal: Goal) => {
    const next: Goal['status'] = goal.status === 'ACTIVE' ? 'COMPLETED' : goal.status === 'COMPLETED' ? 'ABANDONED' : 'ACTIVE';
    updateGoalStatus(goal.id, next);
    bumpDataVersion();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Cerrar" hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.h3, { color: colors.textPrimary }]}>Metas</Text>
        <Pressable onPress={() => router.push('/create/goal')} accessibilityLabel="Nueva meta" hitSlop={8}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        {goals.length === 0 ? (
          <EmptyState title="Todavía no tienes metas." message="Define un objetivo, como 'entrenar 4 veces por semana'." />
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={[shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={[type.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>{goal.title}</Text>
                <Pressable onPress={() => confirmDelete(goal)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
                </Pressable>
              </View>
              <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
                {goal.target} {goal.targetUnit} · {TIMEFRAME_LABELS[goal.timeframe]}
              </Text>
              <Pressable
                onPress={() => cycleStatus(goal)}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: spacing.xs,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 6,
                  borderRadius: radius.pill,
                  backgroundColor:
                    goal.status === 'COMPLETED' ? colors.success : goal.status === 'ABANDONED' ? colors.surfaceAlt : `${colors.primary}22`,
                }}
              >
                <Text
                  style={[
                    type.caption,
                    { color: goal.status === 'COMPLETED' ? colors.onPrimary : goal.status === 'ABANDONED' ? colors.textSecondary : colors.primary },
                  ]}
                >
                  {STATUS_LABELS[goal.status]}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
      <UndoSnackbar />
    </SafeAreaView>
  );
}
