import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/components/CategoryBadge';
import { EmptyState } from '@/components/EmptyState';
import { IconEmoji } from '@/components/IconEmoji';
import { ACTIVITY_TYPE_LABELS } from '@/constants/labels';
import { searchActivities } from '@/db/repositories/activityRepository';
import { searchHabits } from '@/db/repositories/habitRepository';
import { searchRoutines } from '@/db/repositories/routineRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategoryMap } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import type { Activity, Habit, Routine } from '@/types/entities';

const MIN_QUERY_LENGTH = 2;

export default function SearchScreen() {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const categoryMap = useCategoryMap();
  const dataVersion = useAppStore((s) => s.dataVersion);
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return { activities: [] as Activity[], habits: [] as Habit[], routines: [] as Routine[] };
    }
    return {
      activities: searchActivities(trimmed),
      habits: searchHabits(trimmed),
      routines: searchRoutines(trimmed),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  }, [trimmed, dataVersion]);

  const totalResults = results.activities.length + results.habits.length + results.routines.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: colors.surface,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.md,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar tareas, hábitos, rutinas..."
            placeholderTextColor={colors.textTertiary}
            style={[type.body, { flex: 1, color: colors.textPrimary }]}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => router.back()} accessibilityLabel="Cancelar" hitSlop={8}>
          <Text style={[type.bodyMedium, { color: colors.primary }]}>Cancelar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
        {trimmed.length < MIN_QUERY_LENGTH ? (
          <EmptyState title="Buscar en RITMO" message="Escribe al menos 2 letras para buscar en tareas, eventos, hábitos y rutinas." />
        ) : totalResults === 0 ? (
          <EmptyState title="Sin resultados" message={`No encontramos nada para "${trimmed}".`} />
        ) : (
          <>
            {results.activities.length > 0 && (
              <ResultSection title="Actividades">
                {results.activities.map((activity) => (
                  <Pressable
                    key={activity.id}
                    onPress={() => router.push(`/activity/${activity.id}`)}
                    style={[shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: 4 }]}
                  >
                    <Text style={[type.bodyMedium, { color: colors.textPrimary }]} numberOfLines={1}>
                      {activity.title}
                    </Text>
                    <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
                      {ACTIVITY_TYPE_LABELS[activity.type]} · {activity.date}
                    </Text>
                    {activity.categoryId && categoryMap.get(activity.categoryId) && (
                      <View style={{ marginTop: 2 }}>
                        <CategoryBadge category={categoryMap.get(activity.categoryId)!} />
                      </View>
                    )}
                  </Pressable>
                ))}
              </ResultSection>
            )}

            {results.habits.length > 0 && (
              <ResultSection title="Hábitos">
                {results.habits.map((habit) => (
                  <Pressable
                    key={habit.id}
                    onPress={() => router.push(`/habit/${habit.id}`)}
                    style={[
                      shadow.card,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        backgroundColor: colors.surface,
                        borderRadius: radius.lg,
                        padding: spacing.lg,
                      },
                    ]}
                  >
                    <IconEmoji icon={habit.icon} size={20} color={colors.primary} />
                    <Text style={[type.bodyMedium, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                      {habit.name}
                    </Text>
                  </Pressable>
                ))}
              </ResultSection>
            )}

            {results.routines.length > 0 && (
              <ResultSection title="Rutinas">
                {results.routines.map((routine) => (
                  <Pressable
                    key={routine.id}
                    onPress={() => router.push(`/routine/${routine.id}`)}
                    style={[
                      shadow.card,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        backgroundColor: colors.surface,
                        borderRadius: radius.lg,
                        padding: spacing.lg,
                      },
                    ]}
                  >
                    <IconEmoji icon={routine.icon} size={20} color={colors.primary} />
                    <Text style={[type.bodyMedium, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                      {routine.name}
                    </Text>
                  </Pressable>
                ))}
              </ResultSection>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, spacing, type } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[type.label, { color: colors.textTertiary }]}>{title.toUpperCase()}</Text>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}
