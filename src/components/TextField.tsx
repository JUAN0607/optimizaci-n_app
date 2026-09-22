import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface TextFieldProps extends TextInputProps {
  label: string;
}

export function TextField({ label, style, ...props }: TextFieldProps) {
  const { colors, radius, spacing, type } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[type.label, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
      <TextInput
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          type.bodyLarge,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1 },
});
