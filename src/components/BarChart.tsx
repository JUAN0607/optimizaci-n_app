import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

interface BarChartProps {
  data: { label: string; value: number }[]; // value in 0..1
  height?: number;
  color?: string;
}

export function BarChart({ data, height = 100, color }: BarChartProps) {
  const { colors, type } = useTheme();
  const barWidth = 100 / data.length;

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {data.map((point, i) => {
          const barHeight = Math.max(2, point.value * height);
          return (
            <Rect
              key={i}
              x={i * barWidth + barWidth * 0.2}
              y={height - barHeight}
              width={barWidth * 0.6}
              height={barHeight}
              rx={1.5}
              fill={color ?? colors.primary}
            />
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {data.map((point, i) => (
          <Text key={i} style={[type.caption, styles.label, { color: colors.textTertiary }]}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', marginTop: 4 },
  label: { flex: 1, textAlign: 'center' },
});
