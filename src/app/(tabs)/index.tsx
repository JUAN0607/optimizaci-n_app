import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityCard } from '@/components/ActivityCard';
import { EmptyState } from '@/components/EmptyState';
import { MetricCard } from '@/components/MetricCard';
import { ProgressBar } from '@/components/ProgressBar';
import { setActivityStatus } from '@/db/repositories/activityRepository';
import { useActivitiesForDate } from '@/hooks/useActivities';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategoryMap } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import { MONTH_LABELS, WEEKDAY_LABELS_LONG } from '@/constants/labels';
import { todayKey } from '@/utils/date';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatTodayLabel(): string {
  const now = new Date();
  return `${WEEKDAY_LABELS_LONG[now.getDay()]}, ${now.getDate()} de ${MONTH_LABELS[now.getMonth()]}`;
}

function minutesNow(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function toMinutes(time: string | null): number | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export default function HoyScreen() {
  const { colors, spacing, radius, type, shadow } = useTheme();
  const date = todayKey();
  const activities = useActivitiesForDate(date);
  const categoryMap = useCategoryMap();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  const { completed, total, pending, current } = useMemo(() => {
    const completedCount = activities.filter((a) => a.status === 'COMPLETED').length;
    const now = minutesNow();
    const currentActivity = activities.find((a) => {
      const start = toMinutes(a.startTime);
      const end = toMinutes(a.endTime);
      return start != null && end != null && now >= start && now < end && a.status !== 'COMPLETED';
    });
    return {
      completed: completedCount,
      total: activities.length,
      pending: activities.length - completedCount,
      current: currentActivity,
    };
  }, [activities]);

  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const toggleComplete = (id: string, status: string) => {
    setActivityStatus(id, status === 'COMPLETED' ? 'PENDING' : 'COMPLETED');
    bumpDataVersion();
  };

  // Expo Router resolves "/" (this screen) on cold launch regardless of Stack's
  // initialRouteName, so the onboarding gate has to live here rather than in the layout.
  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}>
        <View style={styles.header}>
          <View>
            <Text style={[type.h2, { color: colors.textPrimary }]}>{greeting()}, Juan</Text>
            <Text style={[type.body, { color: colors.textSecondary, marginTop: 2 }]}>{formatTodayLabel()}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Ajustes"
            style={[styles.avatarButton, { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill }]}
          >
            <Ionicons name="person-outline" size={20} color={colors.primaryStrong} />
          </Pressable>
        </View>

        <View style={[styles.summaryCard, shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl }]}>
          <View style={styles.summaryRow}>
            <Text style={[type.h1, { color: colors.textPrimary }]}>
              {completed} / {total}
            </Text>
            <Text style={[type.h3, { color: colors.primary }]}>{completionRate}%</Text>
          </View>
          <ProgressBar progress={total === 0 ? 0 : completed / total} />
          <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {pending} pendiente{pending === 1 ? '' : 's'}
          </Text>
        </View>

        {current && (
          <View style={{ marginTop: spacing.xl }}>
            <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sm }]}>AHORA</Text>
            <View
              style={[
                styles.currentCard,
                shadow.floating,
                { backgroundColor: colors.primaryStrong, borderRadius: radius.lg, padding: spacing.lg },
              ]}
            >
              <Text style={[type.h3, { color: colors.onPrimaryStrong }]}>{current.title}</Text>
              <Text style={[type.body, { color: colors.onPrimaryStrong, opacity: 0.85, marginTop: 2 }]}>
                {current.startTime} — {current.endTime}
              </Text>
              {current.categoryId && categoryMap.get(current.categoryId) && (
                <Text style={[type.bodySmall, { color: colors.onPrimaryStrong, opacity: 0.7, marginTop: 4 }]}>
                  {categoryMap.get(current.categoryId)?.name}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={{ marginTop: spacing.xl }}>
          <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sm }]}>TU DÍA</Text>

          {activities.length === 0 ? (
            <EmptyState title="Tu día está libre." message="Planifica algo nuevo o disfruta el espacio." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  category={activity.categoryId ? (categoryMap.get(activity.categoryId) ?? null) : null}
                  onPress={() => router.push(`/activity/${activity.id}`)}
                  onToggleComplete={() => toggleComplete(activity.id, activity.status)}
                />
              ))}
            </View>
          )}
        </View>

        <MetricRow completed={completed} total={total} colors={colors} spacing={spacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricRow({
  completed,
  total,
  colors,
  spacing,
}: {
  completed: number;
  total: number;
  colors: ReturnType<typeof useTheme>['colors'];
  spacing: ReturnType<typeof useTheme>['spacing'];
}) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
      <MetricCard label="Completadas" value={String(completed)} accentColor={colors.success} />
      <MetricCard label="Total hoy" value={String(total)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  avatarButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { gap: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  currentCard: {},
});
