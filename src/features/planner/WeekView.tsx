import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { useActivitiesInRange } from '@/hooks/useActivities';
import { useTheme } from '@/theme/ThemeProvider';
import { addDaysToKey, parseDateKey, todayKey } from '@/utils/date';
import { startOfWeekKey } from '@/utils/recurrence';

import { DayAgendaList } from './DayAgendaList';

interface WeekViewProps {
  dateKey: string;
  onChangeDate: (dateKey: string) => void;
}

export function WeekView({ dateKey, onChangeDate }: WeekViewProps) {
  const { colors, radius, spacing, type } = useTheme();
  const weekStart = startOfWeekKey(dateKey);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysToKey(weekStart, i)), [weekStart]);
  const activities = useActivitiesInRange(days[0], days[6]);
  const today = todayKey();

  const countByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of activities) map.set(a.date, (map.get(a.date) ?? 0) + 1);
    return map;
  }, [activities]);

  const weekEndDate = parseDateKey(days[6]);
  const weekStartDate = parseDateKey(days[0]);
  const label = `${weekStartDate.getDate()} — ${weekEndDate.getDate()} ${weekEndDate.toLocaleDateString('es-CO', { month: 'short' })}`;

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.nav, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
        <Pressable onPress={() => onChangeDate(addDaysToKey(dateKey, -7))} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>{label}</Text>
        <Pressable onPress={() => onChangeDate(addDaysToKey(dateKey, 7))} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.strip, { paddingHorizontal: spacing.lg }]}>
        {days.map((day) => {
          const d = parseDateKey(day);
          const isSelected = day === dateKey;
          const isToday = day === today;
          const count = countByDay.get(day) ?? 0;
          return (
            <Pressable key={day} onPress={() => onChangeDate(day)} style={styles.dayCell}>
              <Text style={[type.caption, { color: colors.textTertiary }]}>{WEEKDAY_LABELS_SHORT[d.getDay()]}</Text>
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
                <Text style={[type.bodyMedium, { color: isSelected ? colors.onPrimary : colors.textPrimary }]}>
                  {d.getDate()}
                </Text>
              </View>
              <View style={[styles.dot, { backgroundColor: count > 0 ? colors.primary : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>

      <DayAgendaList dateKey={dateKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  strip: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8 },
  dayCell: { alignItems: 'center', gap: 4, width: 40 },
  dayNumber: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
