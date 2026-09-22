import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export function StreakIndicator({ streak }: { streak: number }) {
  const { colors, type } = useTheme();
  if (streak <= 0) return null;

  return (
    <View style={styles.row} accessibilityLabel={`Racha de ${streak} ${streak === 1 ? 'día' : 'días'}`}>
      <Ionicons name="flame" size={16} color={colors.accentGold} />
      <Text style={[type.bodySmall, { color: colors.accentGold }]}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
