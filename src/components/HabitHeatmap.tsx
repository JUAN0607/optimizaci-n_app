import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { Habit, HabitLog } from '@/types/entities';
import { addDaysToKey, todayKey } from '@/utils/date';
import { isScheduledDay } from '@/utils/recurrence';

const WEEKS = 12;

interface HabitHeatmapProps {
  habit: Habit;
  logs: HabitLog[];
  color: string;
}

/**
 * A GitHub-style rolling heatmap: 12 weeks × 7 weekdays, oldest to newest, left to right.
 * Color intensity reflects how much of the day's target was met (not just done/not-done)
 * for measured habits, so "drank 4 of 8 glasses" reads differently from "drank 8 of 8."
 */
export function HabitHeatmap({ habit, logs, color }: HabitHeatmapProps) {
  const { colors, spacing, type } = useTheme();
  const logByDate = new Map(logs.map((l) => [l.date, l]));
  const today = todayKey();
  const totalDays = WEEKS * 7;

  // Build oldest-to-newest, then align so the newest day lands in the last column.
  const days = Array.from({ length: totalDays }, (_, i) => addDaysToKey(today, i - (totalDays - 1)));
  const columns: string[][] = Array.from({ length: WEEKS }, (_, w) => days.slice(w * 7, w * 7 + 7));

  const intensityFor = (dateKey: string): number => {
    if (dateKey > today) return -1; // future — render nothing
    const scheduled = isScheduledDay(habit.recurrenceRule, dateKey);
    const log = logByDate.get(dateKey);
    if (log?.status === 'COMPLETED') {
      if (habit.measurementType === 'CHECKBOX' || !habit.target) return 1;
      const ratio = (log.value ?? 0) / habit.target;
      return Math.max(0.35, Math.min(1, ratio));
    }
    if (!scheduled) return -1; // unscheduled — render as empty, not "missed"
    return 0; // scheduled but missed
  };

  return (
    <View>
      <View style={styles.grid}>
        {columns.map((week, wi) => (
          <View key={wi} style={styles.column}>
            {week.map((dateKey) => {
              const intensity = intensityFor(dateKey);
              const backgroundColor =
                intensity < 0 ? 'transparent' : intensity === 0 ? colors.surfaceAlt : `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
              return <View key={dateKey} style={[styles.cell, { backgroundColor }]} />;
            })}
          </View>
        ))}
      </View>
      <View style={[styles.legend, { marginTop: spacing.sm }]}>
        <Text style={[type.caption, { color: colors.textTertiary }]}>Menos</Text>
        {[0, 0.35, 0.6, 0.8, 1].map((v) => (
          <View
            key={v}
            style={[
              styles.legendCell,
              { backgroundColor: v === 0 ? colors.surfaceAlt : `${color}${Math.round(v * 255).toString(16).padStart(2, '0')}` },
            ]}
          />
        ))}
        <Text style={[type.caption, { color: colors.textTertiary }]}>Más</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 3 },
  column: { gap: 3 },
  cell: { width: 14, height: 14, borderRadius: 3 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
});
