import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { Activity, Category } from '@/types/entities';

import { CategoryBadge } from './CategoryBadge';
import { CompletionToggle } from './CompletionToggle';

interface ActivityCardProps {
  activity: Activity;
  category: Category | null;
  onPress?: () => void;
  onToggleComplete?: () => void;
}

export function ActivityCard({ activity, category, onPress, onToggleComplete }: ActivityCardProps) {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const isCompleted = activity.status === 'COMPLETED';
  const isOverdue = activity.status === 'OVERDUE';

  const timeLabel =
    activity.startTime && activity.endTime
      ? `${activity.startTime} — ${activity.endTime}`
      : (activity.startTime ?? '');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${activity.title}, ${timeLabel}, ${isCompleted ? 'completada' : 'pendiente'}`}
      style={({ pressed }) => [
        styles.card,
        shadow.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          opacity: pressed ? 0.9 : isCompleted ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: category?.color ?? colors.border }]} />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text
            style={[
              type.bodyMedium,
              { color: colors.textPrimary, textDecorationLine: isCompleted ? 'line-through' : 'none', flex: 1 },
            ]}
            numberOfLines={2}
          >
            {activity.title}
          </Text>
          <CompletionToggle completed={isCompleted} onPress={onToggleComplete} />
        </View>

        {!!timeLabel && (
          <Text style={[type.bodySmall, { color: isOverdue ? colors.statusOverdue : colors.textSecondary }]}>
            {isOverdue ? `Atrasada · ${timeLabel}` : timeLabel}
          </Text>
        )}

        {category && (
          <View style={{ marginTop: spacing.xs }}>
            <CategoryBadge category={category} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
  },
  accent: {
    width: 4,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
