import { Ionicons } from '@expo/vector-icons';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MONTH_LABELS, WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { useActivitiesInRange } from '@/hooks/useActivities';
import { useTheme } from '@/theme/ThemeProvider';
import { parseDateKey, toDateKey, todayKey } from '@/utils/date';

interface MonthViewProps {
  dateKey: string;
  onSelectDate: (dateKey: string) => void;
}

export function MonthView({ dateKey, onSelectDate }: MonthViewProps) {
  const { colors, radius, spacing, type } = useTheme();
  const anchor = parseDateKey(dateKey);
  const today = todayKey();

  const gridStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

  const activities = useActivitiesInRange(toDateKey(gridStart), toDateKey(gridEnd));
  const summaryByDay = useMemo(() => {
    const map = new Map<string, { total: number; completed: number }>();
    for (const a of activities) {
      const entry = map.get(a.date) ?? { total: 0, completed: 0 };
      entry.total += 1;
      if (a.status === 'COMPLETED') entry.completed += 1;
      map.set(a.date, entry);
    }
    return map;
  }, [activities]);

  const goToMonth = (delta: number) => {
    onSelectDate(toDateKey(addMonths(anchor, delta)));
  };

  return (
    <View style={{ flex: 1, padding: spacing.xl }}>
      <View style={styles.nav}>
        <Pressable onPress={() => goToMonth(-1)} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.h3, { color: colors.textPrimary }]}>
          {MONTH_LABELS[anchor.getMonth()]} {anchor.getFullYear()}
        </Text>
        <Pressable onPress={() => goToMonth(1)} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.weekdayRow, { marginTop: spacing.lg }]}>
        {WEEKDAY_LABELS_SHORT.slice(1).concat(WEEKDAY_LABELS_SHORT[0]).map((label, i) => (
          <Text key={i} style={[type.caption, { color: colors.textTertiary, width: 40, textAlign: 'center' }]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const key = toDateKey(day);
          const inMonth = day.getMonth() === anchor.getMonth();
          const isToday = key === today;
          const isSelected = key === dateKey;
          const summary = summaryByDay.get(key);

          let dotColor = 'transparent';
          if (summary) {
            dotColor = summary.completed === summary.total ? colors.success : colors.primary;
          }

          return (
            <Pressable key={key} onPress={() => onSelectDate(key)} style={styles.dayCell}>
              <View
                style={[
                  styles.dayNumber,
                  {
                    borderRadius: radius.pill,
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    borderWidth: isToday && !isSelected ? 1 : 0,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    type.body,
                    { color: isSelected ? colors.onPrimary : inMonth ? colors.textPrimary : colors.textTertiary },
                  ]}
                >
                  {day.getDate()}
                </Text>
              </View>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', gap: 4, paddingVertical: 6 },
  dayNumber: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
