import { Ionicons } from '@expo/vector-icons';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MONTH_LABELS, WEEKDAY_LABELS_LONG, WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { useActivitiesInRange } from '@/hooks/useActivities';
import { useTheme } from '@/theme/ThemeProvider';
import { parseDateKey, timeToMinutes, toDateKey, todayKey } from '@/utils/date';
import type { Activity } from '@/types/entities';

function activityMinutes(activity: Activity): number {
  if (activity.duration != null) return activity.duration;
  if (activity.startTime && activity.endTime) {
    return Math.max(0, timeToMinutes(activity.endTime) - timeToMinutes(activity.startTime));
  }
  return 0;
}

function formatHours(minutes: number): string {
  if (minutes === 0) return '0h';
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

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
    const map = new Map<string, { total: number; completed: number; minutes: number }>();
    for (const a of activities) {
      const entry = map.get(a.date) ?? { total: 0, completed: 0, minutes: 0 };
      entry.total += 1;
      entry.minutes += activityMinutes(a);
      if (a.status === 'COMPLETED') entry.completed += 1;
      map.set(a.date, entry);
    }
    return map;
  }, [activities]);

  const scheduledDays = useMemo(
    () =>
      days
        .filter((day) => day.getMonth() === anchor.getMonth())
        .map((day) => ({ day, key: toDateKey(day), summary: summaryByDay.get(toDateKey(day)) }))
        .filter((entry) => !!entry.summary),
    [days, anchor, summaryByDay],
  );

  const goToMonth = (delta: number) => {
    onSelectDate(toDateKey(addMonths(anchor, delta)));
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl, paddingBottom: 140 }}>
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

      <View style={{ marginTop: spacing.xl }}>
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sm }]}>DÍAS AGENDADOS</Text>
        {scheduledDays.length === 0 ? (
          <EmptyState title="Sin actividades este mes." message="Los días que planifiques aparecerán aquí." />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {scheduledDays.map(({ day, key, summary }) => (
              <Pressable
                key={key}
                onPress={() => onSelectDate(key)}
                style={[
                  styles.dayTarget,
                  { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>
                    {WEEKDAY_LABELS_LONG[day.getDay()]} {day.getDate()}
                  </Text>
                  <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    {summary!.total} actividad{summary!.total === 1 ? '' : 'es'} · {formatHours(summary!.minutes)} planeadas
                  </Text>
                </View>
                <Text style={[type.bodySmall, { color: summary!.completed === summary!.total ? colors.success : colors.primary }]}>
                  {summary!.completed}/{summary!.total}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', gap: 4, paddingVertical: 6 },
  dayNumber: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2 },
  dayTarget: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
