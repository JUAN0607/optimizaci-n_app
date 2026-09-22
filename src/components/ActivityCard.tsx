import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable, { type SwipeableMethods, SwipeDirection } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

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

function SwipeActionIcon({ progress, completed, color }: { progress: SharedValue<number>; completed: boolean; color: string }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 1], [0, 1]),
    transform: [{ scale: interpolate(progress.get(), [0, 1], [0.6, 1]) }],
  }));
  return (
    <Animated.View style={style}>
      <Ionicons name={completed ? 'arrow-undo' : 'checkmark'} size={24} color={color} />
    </Animated.View>
  );
}

export function ActivityCard({ activity, category, onPress, onToggleComplete }: ActivityCardProps) {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const isCompleted = activity.status === 'COMPLETED';
  const isOverdue = activity.status === 'OVERDUE';

  const timeLabel =
    activity.startTime && activity.endTime
      ? `${activity.startTime} — ${activity.endTime}`
      : (activity.startTime ?? '');

  const confirmSwipeComplete = () => {
    onToggleComplete?.();
    swipeableRef.current?.close();
  };

  const renderLeftActions = (progress: SharedValue<number>) => (
    <Pressable
      onPress={confirmSwipeComplete}
      style={[styles.swipeAction, { backgroundColor: isCompleted ? colors.textTertiary : colors.success }]}
      accessibilityRole="button"
      accessibilityLabel={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
    >
      <SwipeActionIcon progress={progress} completed={isCompleted} color={colors.onPrimary} />
    </Pressable>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      enabled={!!onToggleComplete}
      renderLeftActions={renderLeftActions}
      leftThreshold={72}
      overshootLeft={false}
      containerStyle={{ borderRadius: radius.lg }}
      onSwipeableOpen={(direction) => {
        if (direction === SwipeDirection.LEFT) confirmSwipeComplete();
      }}
    >
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
    </Swipeable>
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
  swipeAction: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 16,
  },
});
