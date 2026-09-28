import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useId } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useActivePickerStore } from '@/hooks/useActivePickerStore';
import { useTheme } from '@/theme/ThemeProvider';

interface DateTimeFieldProps {
  label: string;
  value: Date;
  mode: 'date' | 'time';
  onChange: (date: Date) => void;
}

export function DateTimeField({ label, value, mode, onChange }: DateTimeFieldProps) {
  const { colors, radius, spacing, type } = useTheme();
  const id = useId();
  const activeId = useActivePickerStore((s) => s.activeId);
  const open = useActivePickerStore((s) => s.open);
  const close = useActivePickerStore((s) => s.close);
  const isOpen = activeId === id;

  // Release this field's claim on the shared picker if it unmounts while open (e.g. the
  // user navigates away mid-selection), so a stray id can never block every other field.
  useEffect(() => () => close(id), [id, close]);

  const displayValue =
    mode === 'date'
      ? value.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
      : value.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={{ gap: spacing.xs, flex: 1 }}>
      <Text style={[type.label, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
      <Pressable
        onPress={() => open(id)}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderRadius: radius.md, borderColor: colors.border, padding: spacing.md },
        ]}
      >
        <Text style={[type.bodyLarge, { color: colors.textPrimary }]}>{displayValue}</Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => close(id)}>
          <Pressable style={styles.backdrop} onPress={() => close(id)}>
            <View style={[styles.sheet, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md }]}>
              <DateTimePicker
                value={value}
                mode={mode}
                display="spinner"
                onChange={(_, selected) => {
                  if (selected) onChange(selected);
                }}
              />
              <Pressable
                onPress={() => close(id)}
                style={[styles.doneButton, { backgroundColor: colors.primary, borderRadius: radius.pill, marginTop: spacing.sm }]}
              >
                <Text style={[type.bodyMedium, { color: colors.onPrimary }]}>Listo</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      ) : (
        isOpen && (
          <DateTimePicker
            value={value}
            mode={mode}
            display="default"
            onChange={(_, selected) => {
              close(id);
              if (selected) onChange(selected);
            }}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { width: '85%', maxWidth: 340 },
  doneButton: { alignItems: 'center', paddingVertical: 12 },
});
