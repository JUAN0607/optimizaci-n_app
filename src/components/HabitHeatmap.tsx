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
 * Columns are flex-based (not fixed pixels) so the grid always fills the card edge to
 * edge, whatever the device width — no leftover whitespace to one side.
 */
export function HabitHeatmap({ habit, logs, color }: HabitHeatmapProps) {
  const { colors, radius, spacing, shadow, type } = useTheme();
  const logByDate = new Map(logs.map((l) => [l.date, l]));
  const today = todayKey();
  const totalDays = WEEKS * 7;

  // Build oldest-to-newest, then align so the newest day lands in the last column.
  const days = Array.from({ length: totalDays }, (_, i) => addDaysToKey(today, i - (totalDays - 1)));
  const columns: string[][] = Array.from({ length: WEEKS }, (_, w) => days.slice(w * 7, w * 7 + 7));

  const completedCount = days.filter((d) => intensityFor(d) > 0).length;

  function intensityFor(dateKey: string): number {
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
  }

  return (
    <View style={[shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }]}>
      <View style={styles.header}>
        <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>Últimas {WEEKS} semanas</Text>
        <Text style={[type.bodySmall, { color, fontWeight: '600' }]}>{completedCount} días activos</Text>
      </View>

      <View style={[styles.grid, { marginTop: spacing.md }]}>
        {columns.map((week, wi) => (
          <View key={wi} style={styles.column}>
            {week.map((dateKey) => {
              const intensity = intensityFor(dateKey);
              const backgroundColor =
                intensity < 0 ? 'transparent' : intensity === 0 ? colors.surfaceAlt : `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
              const isToday = dateKey === today;
              return (
                <View
                  key={dateKey}
                  style={[styles.cell, { backgroundColor }, isToday && { borderWidth: 2, borderColor: color }]}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={[styles.legend, { marginTop: spacing.md }]}>
        <Text style={[type.caption, { color: colors.textTertiary }]}>Menos</Text>
        <View style={styles.legendCells}>
          {[0, 0.35, 0.6, 0.8, 1].map((v) => (
            <View
              key={v}
              style={[
                styles.legendCell,
                { backgroundColor: v === 0 ? colors.surfaceAlt : `${color}${Math.round(v * 255).toString(16).padStart(2, '0')}` },
              ]}
            />
          ))}
        </View>
        <Text style={[type.caption, { color: colors.textTertiary }]}>Más</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', gap: 4 },
  column: { flex: 1, gap: 4 },
  cell: { width: '100%', aspectRatio: 1, borderRadius: 4 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  legendCells: { flexDirection: 'row', gap: 4 },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
});
