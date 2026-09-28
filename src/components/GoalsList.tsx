import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
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

/** Goal cards + empty state, with no ScrollView/header of its own — embeddable inside any
 * scrollable screen (the standalone Metas screen, or the Metas segment of the tracking tab). */
export function GoalsList() {
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

  if (goals.length === 0) {
    return <EmptyState title="Todavía no tienes metas." message="Define un objetivo, como 'entrenar 4 veces por semana'." />;
  }

  return (
    <View style={{ gap: spacing.md }}>
      {goals.map((goal) => (
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
      ))}
    </View>
  );
}
