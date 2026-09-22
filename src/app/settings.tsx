import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/components/CategoryBadge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import { getSettings, updateSettings } from '@/db/repositories/settingsRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategories } from '@/hooks/useCategories';
import { cancelEntityNotification, scheduleDailySummary, scheduleWeeklySummary } from '@/notifications/notificationService';
import { exportAllDataAsJson } from '@/services/exportService';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppSettings } from '@/types/entities';

export default function SettingsScreen() {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const themeMode = useAppStore((s) => s.themeMode);
  const categories = useCategories();
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [name, setName] = useState(settings.userName ?? '');

  const patch = (input: Partial<Omit<AppSettings, 'id'>>) => {
    const next = updateSettings(input);
    setSettings(next);
  };

  const onExport = async () => {
    const json = exportAllDataAsJson();
    await Share.share({ message: json, title: 'RITMO — respaldo de datos' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
        <Text style={[type.h3, { color: colors.textPrimary }]}>Ajustes</Text>
        <Pressable onPress={() => router.back()} accessibilityLabel="Cerrar" hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}>
        <Section title="Perfil" colors={colors} type={type}>
          <TextField
            label="Nombre"
            value={name}
            onChangeText={setName}
            onBlur={() => patch({ userName: name.trim() || null })}
            placeholder="Tu nombre"
          />
        </Section>

        <Section title="Apariencia" colors={colors} type={type}>
          <SegmentedControl
            options={[
              { value: 'SYSTEM', label: 'Sistema' },
              { value: 'LIGHT', label: 'Claro' },
              { value: 'DARK', label: 'Oscuro' },
            ]}
            value={themeMode}
            onChange={(mode) => {
              setThemeMode(mode);
              patch({ themeMode: mode });
            }}
          />
        </Section>

        <Section title="Categorías" colors={colors} type={type}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {categories.map((c) => (
              <CategoryBadge key={c.id} category={c} />
            ))}
          </View>
        </Section>

        <Section title="Notificaciones" colors={colors} type={type}>
          <ToggleRow
            label="Notificaciones activas"
            value={settings.notificationsEnabled}
            onChange={(v) => patch({ notificationsEnabled: v })}
            colors={colors}
            type={type}
          />
          <ToggleRow
            label="Resumen diario"
            value={settings.dailySummaryEnabled}
            onChange={(v) => {
              patch({ dailySummaryEnabled: v });
              if (v) scheduleDailySummary();
              else cancelEntityNotification('DAILY_SUMMARY', 'singleton');
            }}
            colors={colors}
            type={type}
          />
          <ToggleRow
            label="Resumen semanal"
            value={settings.weeklySummaryEnabled}
            onChange={(v) => {
              patch({ weeklySummaryEnabled: v });
              if (v) scheduleWeeklySummary();
              else cancelEntityNotification('WEEKLY_SUMMARY', 'singleton');
            }}
            colors={colors}
            type={type}
          />
        </Section>

        <Section title="Datos" colors={colors} type={type}>
          <Pressable
            onPress={onExport}
            style={[styles.row, shadow.card, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md }]}
          >
            <Ionicons name="share-outline" size={18} color={colors.primary} />
            <Text style={[type.bodyMedium, { color: colors.primary }]}>Exportar datos (JSON)</Text>
          </Pressable>
          <Text style={[type.bodySmall, { color: colors.textTertiary, marginTop: spacing.xs }]}>
            Tus datos viven únicamente en este iPhone. RITMO no usa ningún servidor.
          </Text>
        </Section>

        <Section title="Acerca de" colors={colors} type={type}>
          <Text style={[type.body, { color: colors.textSecondary }]}>RITMO v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          <Text style={[type.bodySmall, { color: colors.textTertiary, marginTop: 2 }]}>
            Tu sistema operativo personal para el tiempo.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
  colors,
  type,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[type.label, { color: colors.textTertiary }]}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  colors,
  type,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={[type.body, { color: colors.textPrimary }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
});
