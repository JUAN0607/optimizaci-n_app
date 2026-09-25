import { startOfMonth } from 'date-fns';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { calculateCompletionRate } from '@/analytics/completion';
import { MONTH_LABELS } from '@/constants/labels';
import { ProgressBar } from '@/components/ProgressBar';
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
      <View style={{ gap: spacing.sm }}>
        {MONTH_LABELS.map((label, month) => {
          const monthKey = toDateKey(startOfMonth(new Date(year, month, 1)));
          const rate = rateByMonth[month];
          return (
            <Pressable
              key={label}
              onPress={() => onSelectMonth(monthKey)}
              style={[
                shadow.card,
                { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs },
              ]}
            >
              <View style={styles.tileHeader}>
                <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>{label}</Text>
                <Text style={[type.bodyMedium, { color: rate > 0 ? colors.primary : colors.textTertiary }]}>{rate}%</Text>
              </View>
              <ProgressBar progress={rate / 100} color={rate > 0 ? colors.primary : colors.border} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
