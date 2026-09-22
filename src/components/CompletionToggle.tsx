import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface CompletionToggleProps {
  completed: boolean;
  onPress?: () => void;
  size?: number;
}

export function CompletionToggle({ completed, onPress, size = 28 }: CompletionToggleProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={completed ? 'Marcar como pendiente' : 'Marcar como completada'}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: completed ? colors.success : colors.border,
          backgroundColor: completed ? colors.success : 'transparent',
          borderWidth: completed ? 0 : 1.5,
        },
      ]}
    >
      {completed && <Text style={[styles.check, { color: colors.onPrimary, fontSize: size * 0.55 }]}>✓</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontWeight: '700',
  },
});
