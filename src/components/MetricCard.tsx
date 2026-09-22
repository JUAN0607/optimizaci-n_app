import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  accentColor?: string;
}

export function MetricCard({ label, value, sublabel, accentColor }: MetricCardProps) {
  const { colors, radius, spacing, type, shadow } = useTheme();

  return (
    <View
      style={[
        styles.card,
        shadow.card,
        { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
      ]}
    >
      <Text style={[type.h1, { color: accentColor ?? colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[type.caption, { color: colors.textSecondary }]}>{label}</Text>
      {sublabel && <Text style={[type.caption, { color: colors.textTertiary, marginTop: 2 }]}>{sublabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
