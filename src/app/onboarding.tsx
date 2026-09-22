import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { updateSettings } from '@/db/repositories/settingsRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { requestNotificationPermissions, scheduleDailySummary } from '@/notifications/notificationService';
import { useTheme } from '@/theme/ThemeProvider';

const SUGGESTED_HABITS = ['Meditar', 'Beber agua', 'Leer 30 minutos', 'Correr 5 km'];

type Step = { title: string; body: string };

const STEPS: Step[] = [
  { title: 'Bienvenido a RITMO', body: 'Tu sistema operativo personal para el tiempo: planea, ejecuta y mide tu consistencia.' },
  { title: 'Planifica con intención', body: 'RITMO sigue un ciclo simple: Planear → Ejecutar → Revisar → Medir → Mejorar.' },
  { title: 'Categorías', body: 'Empezamos con seis categorías. Podrás editarlas o crear las tuyas desde Ajustes.' },
  { title: 'Hábitos iniciales', body: 'Agregamos algunos hábitos sugeridos para que empieces a construir consistencia.' },
  { title: 'Notificaciones', body: 'Activa los recordatorios locales para no perder de vista tus tareas y hábitos.' },
  { title: 'Todo listo', body: 'RITMO está configurado. Todos tus datos viven en tu iPhone.' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { colors, spacing, radius, type } = useTheme();
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const finish = () => {
    updateSettings({ onboardingCompleted: true });
    setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  const requestNotifications = async () => {
    try {
      const granted = await requestNotificationPermissions();
      if (granted) await scheduleDailySummary();
    } catch {
      // permission denial is a valid user choice, nothing to recover from here
    }
    setStep((s) => s + 1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === step ? colors.primary : colors.border, width: i === step ? 20 : 6 },
            ]}
          />
        ))}
      </View>

      <View style={[styles.content, { padding: spacing.xxl }]}>
        <Text style={[type.h1, { color: colors.textPrimary, textAlign: 'center' }]}>{current.title}</Text>
        <Text style={[type.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
          {current.body}
        </Text>

        {step === 2 && (
          <View style={[styles.chipWrap, { marginTop: spacing.xl }]}>
            {DEFAULT_CATEGORIES.map((c) => (
              <View
                key={c.name}
                style={[styles.chip, { backgroundColor: `${c.color}1F`, borderRadius: radius.pill }]}
              >
                <View style={[styles.chipDot, { backgroundColor: c.color }]} />
                <Text style={[type.bodySmall, { color: colors.textPrimary }]}>{c.name}</Text>
              </View>
            ))}
          </View>
        )}

        {step === 3 && (
          <View style={{ marginTop: spacing.xl, gap: spacing.sm, width: '100%' }}>
            {SUGGESTED_HABITS.map((h) => (
              <View
                key={h}
                style={[
                  styles.habitRow,
                  { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
                ]}
              >
                <Text style={[type.body, { color: colors.textPrimary }]}>{h}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={[styles.footer, { padding: spacing.xxl }]}>
        {step === 4 ? (
          <Pressable
            onPress={requestNotifications}
            style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: radius.pill }]}
          >
            <Text style={[type.bodyMedium, { color: colors.onPrimary }]}>Activar notificaciones</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={isLast ? finish : () => setStep((s) => s + 1)}
            style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: radius.pill }]}
            accessibilityRole="button"
          >
            <Text style={[type.bodyMedium, { color: colors.onPrimary }]}>{isLast ? 'Comenzar' : 'Continuar'}</Text>
          </Pressable>
        )}

        {!isLast && (
          <Pressable onPress={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))} style={styles.skipButton}>
            <Text style={[type.bodySmall, { color: colors.textTertiary }]}>
              {step === 4 ? 'Ahora no' : 'Omitir'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 24 },
  dot: { height: 6, borderRadius: 3 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  habitRow: { flexDirection: 'row', alignItems: 'center' },
  footer: { gap: 12 },
  primaryButton: { paddingVertical: 16, alignItems: 'center' },
  skipButton: { alignItems: 'center', paddingVertical: 8 },
});
