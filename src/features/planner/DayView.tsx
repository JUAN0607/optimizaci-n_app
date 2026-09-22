import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MONTH_LABELS, WEEKDAY_LABELS_LONG } from '@/constants/labels';
import { useTheme } from '@/theme/ThemeProvider';
import { addDaysToKey, parseDateKey, todayKey } from '@/utils/date';

import { DayAgendaList } from './DayAgendaList';

interface DayViewProps {
  dateKey: string;
  onChangeDate: (dateKey: string) => void;
}

export function DayView({ dateKey, onChangeDate }: DayViewProps) {
  const { colors, spacing, type } = useTheme();

  const date = parseDateKey(dateKey);
  const isToday = dateKey === todayKey();
  const label = `${WEEKDAY_LABELS_LONG[date.getDay()]}, ${date.getDate()} de ${MONTH_LABELS[date.getMonth()]}`;

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.nav, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
        <Pressable onPress={() => onChangeDate(addDaysToKey(dateKey, -1))} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>{label}</Text>
          {isToday && <Text style={[type.caption, { color: colors.primary }]}>HOY</Text>}
        </View>
        <Pressable onPress={() => onChangeDate(addDaysToKey(dateKey, 1))} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <DayAgendaList dateKey={dateKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
