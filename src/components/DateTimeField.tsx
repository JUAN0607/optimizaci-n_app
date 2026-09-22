import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface DateTimeFieldProps {
  label: string;
  value: Date;
  mode: 'date' | 'time';
  onChange: (date: Date) => void;
}

export function DateTimeField({ label, value, mode, onChange }: DateTimeFieldProps) {
  const { colors, radius, spacing, type } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const displayValue =
    mode === 'date'
      ? value.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
      : value.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={{ gap: spacing.xs, flex: 1 }}>
      <Text style={[type.label, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderRadius: radius.md, borderColor: colors.border, padding: spacing.md },
        ]}
      >
        <Text style={[type.bodyLarge, { color: colors.textPrimary }]}>{displayValue}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) onChange(selected);
          }}
        />
      )}
      {showPicker && Platform.OS === 'ios' && (
        <Pressable onPress={() => setShowPicker(false)} style={styles.doneRow}>
          <Text style={[type.bodySmall, { color: colors.primary }]}>Listo</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1 },
  doneRow: { alignItems: 'flex-end' },
});
