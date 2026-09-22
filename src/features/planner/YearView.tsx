import { startOfMonth } from 'date-fns';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { calculateCompletionRate } from '@/analytics/completion';
import { MONTH_LABELS } from '@/constants/labels';
import { useActivitiesInRange } from '@/hooks/useActivities';
import { useTheme } from '@/theme/ThemeProvider';
import { parseDateKey, toDateKey } from '@/utils/date';

interface YearViewProps {
  dateKey: string;
  onSelectMonth: (dateKey: string) => void;
}

export function YearView({ dateKey, onSelectMonth }: YearViewProps) {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const year = parseDateKey(dateKey).getFullYear();

  const yearStart = toDateKey(new Date(year, 0, 1));
  const yearEnd = toDateKey(new Date(year, 11, 31));
  const activities = useActivitiesInRange(yearStart, yearEnd);

  const rateByMonth = useMemo(() => {
    const rates: number[] = [];
    for (let month = 0; month < 12; month++) {
      const monthActivities = activities.filter((a) => parseDateKey(a.date).getMonth() === month);
      rates.push(calculateCompletionRate(monthActivities));
    }
    return rates;
  }, [activities]);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 140 }}>
      <Text style={[type.h2, { color: colors.textPrimary, marginBottom: spacing.lg }]}>{year}</Text>
      <View style={styles.grid}>
        {MONTH_LABELS.map((label, month) => {
          const monthKey = toDateKey(startOfMonth(new Date(year, month, 1)));
          const rate = rateByMonth[month];
          return (
            <Pressable
              key={label}
              onPress={() => onSelectMonth(monthKey)}
              style={[
                styles.tile,
                shadow.card,
                { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
              ]}
            >
              <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>{label}</Text>
              <Text style={[type.h3, { color: rate > 0 ? colors.primary : colors.textTertiary, marginTop: 4 }]}>
                {rate}%
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '30%' },
});
