import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { useActivitiesInRange } from '@/hooks/useActivities';
import { useCategoryMap } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import { addDaysToKey, parseDateKey, todayKey } from '@/utils/date';
import { startOfWeekKey } from '@/utils/recurrence';

import { TimeGrid } from './TimeGrid';

const HOUR_HEIGHT = 44;

interface WeekViewProps {
  dateKey: string;
  onChangeDate: (dateKey: string) => void;
  categoryFilter?: string[];
}

export function WeekView({ dateKey, onChangeDate, categoryFilter }: WeekViewProps) {
  const { colors, radius, spacing, type } = useTheme();
  const categoryMap = useCategoryMap();
  const weekStart = startOfWeekKey(dateKey);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysToKey(weekStart, i)), [weekStart]);
  const allActivities = useActivitiesInRange(days[0], days[6]);
  const activities =
    categoryFilter && categoryFilter.length > 0
      ? allActivities.filter((a) => a.categoryId && categoryFilter.includes(a.categoryId))
      : allActivities;
  const today = todayKey();

  const columns = useMemo(
    () => days.map((day) => ({ dateKey: day, activities: activities.filter((a) => a.date === day) })),
    [days, activities],
  );

  const weekEndDate = parseDateKey(days[6]);
  const weekStartDate = parseDateKey(days[0]);
  const label = `${weekStartDate.getDate()} — ${weekEndDate.getDate()} ${weekEndDate.toLocaleDateString('es-CO', { month: 'short' })}`;

  const initialOffset = Math.max(0, (new Date().getHours() - 2) * HOUR_HEIGHT);

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

      <View style={[styles.strip, { paddingLeft: 56 + spacing.md, paddingRight: spacing.md }]}>
        {days.map((day) => {
          const d = parseDateKey(day);
          const isSelected = day === dateKey;
          const isToday = day === today;
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
                <Text style={[type.bodySmall, { color: isSelected ? colors.onPrimary : colors.textPrimary }]}>
                  {d.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 160 }} contentOffset={{ x: 0, y: initialOffset }}>
        <TimeGrid columns={columns} categoryMap={categoryMap} onPressActivity={(id) => router.push(`/activity/${id}`)} hourHeight={HOUR_HEIGHT} dense />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  strip: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8 },
  dayCell: { flex: 1, alignItems: 'center', gap: 4 },
  dayNumber: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
});
