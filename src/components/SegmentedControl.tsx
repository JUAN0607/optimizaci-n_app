import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { colors, radius, spacing, type } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 3 }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              {
                backgroundColor: selected ? colors.surface : 'transparent',
                borderRadius: radius.sm,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text style={[type.bodySmall, { color: selected ? colors.textPrimary : colors.textSecondary }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row' },
  segment: { flex: 1, alignItems: 'center' },
});
