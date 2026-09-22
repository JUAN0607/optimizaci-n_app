import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  const { colors, spacing, type } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxl }]}>
      <Text style={[type.h3, { color: colors.textPrimary, textAlign: 'center' }]}>{title}</Text>
      <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
