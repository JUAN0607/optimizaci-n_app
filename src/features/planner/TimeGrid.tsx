import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { Activity, Category } from '@/types/entities';
import { timeToMinutes, todayKey } from '@/utils/date';

const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 a.m.';
  if (hour === 12) return '12 p.m.';
  return hour < 12 ? `${hour} a.m.` : `${hour - 12} p.m.`;
}

function minutesNow(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export interface TimeGridColumn {
  dateKey: string;
  activities: Activity[];
}

interface TimeGridProps {
  columns: TimeGridColumn[];
  categoryMap: Map<string, Category>;
  onPressActivity: (id: string) => void;
  hourHeight?: number;
  dense?: boolean;
  labelGutter?: number;
}

/**
 * Shared hour-grid renderer for Plan's Día (1 wide column) and Semana (7 narrow columns)
 * views — a single day's timeline is just this grid's one-column case, so the two views
 * stay visually consistent instead of being built from unrelated components.
 */
export function TimeGrid({ columns, categoryMap, onPressActivity, hourHeight = 64, dense = false, labelGutter = 56 }: TimeGridProps) {
  const { colors, radius, spacing, type } = useTheme();
  const totalHeight = hourHeight * HOURS.length;
  const today = todayKey();

  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: labelGutter }}>
        {HOURS.map((hour) => (
          <View key={hour} style={{ height: hourHeight }}>
            <Text style={[type.caption, { color: colors.textTertiary, marginTop: -6 }]}>{formatHourLabel(hour)}</Text>
          </View>
        ))}
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {columns.map((column) => {
          const isToday = column.dateKey === today;
          const timed = column.activities.filter((a) => a.startTime);

          return (
            <View key={column.dateKey} style={{ flex: 1, height: totalHeight, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border }}>
              {HOURS.map((hour) => (
                <View
                  key={hour}
                  style={{ height: hourHeight, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}
                />
              ))}

              {timed.map((activity) => {
                const startMin = timeToMinutes(activity.startTime as string);
                const endMin = activity.endTime
                  ? timeToMinutes(activity.endTime)
                  : startMin + (activity.duration ?? 30);
                const top = (startMin / 60) * hourHeight;
                const height = Math.max(dense ? 6 : 24, ((endMin - startMin) / 60) * hourHeight);
                const category = activity.categoryId ? categoryMap.get(activity.categoryId) : null;
                const color = category?.color ?? colors.primary;
                const isCompleted = activity.status === 'COMPLETED';

                return (
                  <Pressable
                    key={activity.id}
                    onPress={() => onPressActivity(activity.id)}
                    style={{
                      position: 'absolute',
                      top,
                      left: dense ? 1 : spacing.xs,
                      right: dense ? 1 : spacing.xs,
                      height,
                      backgroundColor: isCompleted ? `${color}55` : `${color}CC`,
                      borderRadius: dense ? 3 : radius.sm,
                      paddingHorizontal: dense ? 0 : 6,
                      paddingVertical: dense ? 0 : 2,
                      overflow: 'hidden',
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={activity.title}
                  >
                    {!dense && (
                      <>
                        <Text
                          numberOfLines={height > 34 ? 2 : 1}
                          style={[
                            type.caption,
                            { color: colors.onPrimary, fontFamily: type.bodyMedium.fontFamily, textDecorationLine: isCompleted ? 'line-through' : 'none' },
                          ]}
                        >
                          {activity.title}
                        </Text>
                        {height > 34 && (
                          <Text style={[type.caption, { color: colors.onPrimary, opacity: 0.85 }]}>{activity.startTime}</Text>
                        )}
                      </>
                    )}
                  </Pressable>
                );
              })}

              {isToday && (
                <View style={[styles.nowLine, { top: (minutesNow() / 60) * hourHeight, backgroundColor: colors.statusOverdue }]}>
                  <View style={[styles.nowDot, { backgroundColor: colors.statusOverdue }]} />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export { HOURS, START_HOUR, END_HOUR };

const styles = StyleSheet.create({
  nowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
  },
  nowDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    position: 'absolute',
    left: -3.5,
    top: -3,
  },
});
