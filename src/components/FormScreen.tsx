import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

interface FormScreenProps extends PropsWithChildren {
  title: string;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
}

export function FormScreen({ title, onSave, saveLabel = 'Guardar', saveDisabled, children }: FormScreenProps) {
  const { colors, spacing, type } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.h3, { color: colors.textPrimary }]}>{title}</Text>
        <Pressable
          onPress={onSave}
          disabled={saveDisabled}
          accessibilityRole="button"
          accessibilityLabel={saveLabel}
          hitSlop={8}
        >
          <Text style={[type.bodyMedium, { color: saveDisabled ? colors.textTertiary : colors.primary }]}>
            {saveLabel}
          </Text>
        </Pressable>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
