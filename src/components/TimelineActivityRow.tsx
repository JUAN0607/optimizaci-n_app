import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable, { type SwipeableMethods, SwipeDirection } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import type { Activity, Category } from '@/types/entities';

import { CategoryBadge } from './CategoryBadge';

interface TimelineActivityRowProps {
  activity: Activity;
  category: Category | null;
  isLast: boolean;
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
      <Ionicons name={completed ? 'arrow-undo' : 'checkmark'} size={22} color={color} />
    </Animated.View>
  );
}

export function TimelineActivityRow({ activity, category, isLast, onPress, onToggleComplete }: TimelineActivityRowProps) {
  const { colors, radius, spacing, type } = useTheme();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const isCompleted = activity.status === 'COMPLETED';
  const isOverdue = activity.status === 'OVERDUE';
  const dotColor = category?.color ?? colors.primary;

  const timeLabel = activity.startTime ?? '';

  const confirmSwipeComplete = () => {
    onToggleComplete?.();
    swipeableRef.current?.close();
  };

  const renderLeftActions = (progress: SharedValue<number>) => (
    <Pressable
      onPress={confirmSwipeComplete}
      style={[styles.swipeAction, { backgroundColor: isCompleted ? colors.textTertiary : colors.success, borderRadius: radius.md }]}
      accessibilityRole="button"
      accessibilityLabel={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
    >
      <SwipeActionIcon progress={progress} completed={isCompleted} color={colors.onPrimary} />
    </Pressable>
  );

  return (
    <View style={styles.row}>
      <Text style={[type.bodySmall, styles.time, { color: colors.textSecondary }]}>{timeLabel}</Text>

      <View style={styles.spine}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: isCompleted ? dotColor : colors.background,
              borderColor: dotColor,
            },
          ]}
        />
        {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
      </View>

      <View style={[styles.content, { paddingBottom: isLast ? 0 : spacing.lg }]}>
        <Swipeable
          ref={swipeableRef}
          enabled={!!onToggleComplete}
          renderLeftActions={renderLeftActions}
          leftThreshold={64}
          overshootLeft={false}
          onSwipeableOpen={(direction) => {
            if (direction === SwipeDirection.LEFT) confirmSwipeComplete();
          }}
        >
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${activity.title}, ${isCompleted ? 'completada' : 'pendiente'}`}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : isCompleted ? 0.6 : 1 }]}
          >
            <Text
              style={[type.bodyMedium, { color: colors.textPrimary, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}
              numberOfLines={2}
            >
              {activity.title}
            </Text>
            {!!activity.endTime && activity.startTime && (
              <Text style={[type.bodySmall, { color: isOverdue ? colors.statusOverdue : colors.textSecondary, marginTop: 2 }]}>
                {activity.startTime} — {activity.endTime}
              </Text>
            )}
            {category && (
              <View style={{ marginTop: spacing.xs }}>
                <CategoryBadge category={category} />
              </View>
            )}
          </Pressable>
        </Swipeable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  time: {
    width: 50,
    textAlign: 'right',
    marginRight: 12,
    paddingTop: 2,
  },
  spine: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  swipeAction: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
});
