import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { CategoryBadge } from '@/components/CategoryBadge';
import { useTheme } from '@/theme/ThemeProvider';
import type { Activity, Category } from '@/types/entities';
import { parseDateKey, todayKey } from '@/utils/date';

interface TaskListItemProps {
  activity: Activity;
  category: Category | null;
  onPress?: () => void;
  onToggleComplete?: () => void;
}

function formatTaskDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function TaskListItem({ activity, category, onPress, onToggleComplete }: TaskListItemProps) {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const isCompleted = activity.status === 'COMPLETED';
  const isOverdue = !isCompleted && !!activity.dueDate && activity.dueDate < todayKey();

  return (
    <Pressable
      onPress={onPress}
      style={[
        shadow.card,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          opacity: isCompleted ? 0.6 : 1,
        },
      ]}
    >
      <Pressable
        onPress={onToggleComplete}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: 2,
          borderColor: isCompleted ? colors.success : colors.border,
          backgroundColor: isCompleted ? colors.success : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isCompleted && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text
          style={[type.bodyMedium, { color: colors.textPrimary, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}
          numberOfLines={2}
        >
          {activity.title}
        </Text>
        <Text style={[type.bodySmall, { color: isOverdue ? colors.statusOverdue : colors.textSecondary, marginTop: 2 }]}>
          {activity.dueDate ? `Entrega: ${formatTaskDate(activity.dueDate)}` : `Para: ${formatTaskDate(activity.date)}`}
        </Text>
        {category && (
          <View style={{ marginTop: spacing.xs }}>
            <CategoryBadge category={category} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
