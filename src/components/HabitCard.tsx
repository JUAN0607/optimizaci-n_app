import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { useTheme } from '@/theme/ThemeProvider';
import type { Category, Habit, HabitLog } from '@/types/entities';
import { describeRecurrence } from '@/utils/recurrence';

import { CompletionToggle } from './CompletionToggle';
import { IconEmoji } from './IconEmoji';
import { StreakIndicator } from './StreakIndicator';

interface HabitCardProps {
  habit: Habit;
  category: Category | null;
  todayLog: HabitLog | null;
  streak: number;
  onPress: () => void;
  onToggleComplete: () => void;
}

export function HabitCard({ habit, category, todayLog, streak, onPress, onToggleComplete }: HabitCardProps) {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const isCompleted = todayLog?.status === 'COMPLETED';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadow.card,
        { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: category ? `${category.color}1F` : colors.surfaceAlt, borderRadius: radius.md }]}>
        <IconEmoji icon={habit.icon} size={20} color={category?.color ?? colors.primary} />
      </View>

      <View style={styles.body}>
        <Text style={[type.bodyMedium, { color: colors.textPrimary }]} numberOfLines={1}>
          {habit.name}
        </Text>
        <Text style={[type.bodySmall, { color: colors.textSecondary }]} numberOfLines={1}>
          {describeRecurrence(habit.recurrenceRule, WEEKDAY_LABELS_SHORT)}
        </Text>
        <StreakIndicator streak={streak} />
      </View>

      {habit.measurementType === 'CHECKBOX' ? (
        <CompletionToggle completed={isCompleted} onPress={onToggleComplete} />
      ) : (
        <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
          {todayLog ? `${todayLog.value}` : `/${habit.target ?? ''}`} {habit.targetUnit}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
});
