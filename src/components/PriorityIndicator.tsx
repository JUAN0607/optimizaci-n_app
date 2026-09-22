import { StyleSheet, Text, View } from 'react-native';

import { PRIORITY_LABELS } from '@/constants/labels';
import { useTheme } from '@/theme/ThemeProvider';
import type { Priority } from '@/types/entities';

const PRIORITY_BARS: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

export function PriorityIndicator({ priority }: { priority: Priority }) {
  const { colors, type } = useTheme();
  const color =
    priority === 'HIGH' ? colors.priorityHigh : priority === 'MEDIUM' ? colors.priorityMedium : colors.priorityLow;

  return (
    <View style={styles.row} accessibilityLabel={`Prioridad ${PRIORITY_LABELS[priority]}`}>
      <View style={styles.bars}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { height: 4 + i * 3, backgroundColor: i < PRIORITY_BARS[priority] ? color : `${color}33` },
            ]}
          />
        ))}
      </View>
      <Text style={[type.caption, { color: colors.textSecondary }]}>{PRIORITY_LABELS[priority]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 3, borderRadius: 1.5 },
});
