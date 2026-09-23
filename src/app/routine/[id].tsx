import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CompletionToggle } from '@/components/CompletionToggle';
import { ProgressBar } from '@/components/ProgressBar';
import { deleteRoutine, getRoutine, listRoutineItems } from '@/db/repositories/routineRepository';
import { listCompletedItemIds, setItemCompleted } from '@/db/repositories/routineLogRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { todayKey } from '@/utils/date';
import { hapticComplete } from '@/utils/haptics';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius, type, shadow } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const today = todayKey();

  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  const routine = useMemo(() => (id ? getRoutine(id) : null), [id, dataVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  const items = useMemo(() => (routine ? listRoutineItems(routine.id) : []), [routine, dataVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  const completedIds = useMemo(() => (routine ? listCompletedItemIds(routine.id, today) : new Set<string>()), [routine, dataVersion, today]);

  if (!routine) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, padding: spacing.xl }}>Rutina no encontrada.</Text>
      </SafeAreaView>
    );
  }

  const completedCount = items.filter((i) => completedIds.has(i.id)).length;
  const progress = items.length === 0 ? 0 : completedCount / items.length;
  const allDone = items.length > 0 && completedCount === items.length;

  const toggleItem = (itemId: string) => {
    const isCompleted = completedIds.has(itemId);
    setItemCompleted(itemId, today, !isCompleted);
    if (!isCompleted) hapticComplete();
    bumpDataVersion();
  };

  const confirmDelete = () => {
    Alert.alert('Eliminar rutina', `¿Eliminar "${routine.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteRoutine(routine.id);
          bumpDataVersion();
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Cerrar" hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <Pressable
            onPress={() => router.push({ pathname: '/create/routine', params: { id: routine.id } })}
            accessibilityLabel="Editar"
            hitSlop={8}
          >
            <Ionicons name="pencil-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={confirmDelete} accessibilityLabel="Eliminar" hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={colors.statusOverdue} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={routine.icon as never} size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.h2, { color: colors.textPrimary }]}>{routine.name}</Text>
            <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
              {completedCount} / {items.length} pasos completados
            </Text>
          </View>
        </View>

        <ProgressBar progress={progress} />

        {allDone && (
          <View
            style={[
              shadow.card,
              { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.success, borderRadius: radius.md, padding: spacing.md },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.onPrimary} />
            <Text style={[type.bodyMedium, { color: colors.onPrimary }]}>Rutina completada hoy</Text>
          </View>
        )}

        <View style={{ gap: spacing.md }}>
          {items.map((item) => {
            const done = completedIds.has(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => toggleItem(item.id)}
                style={[
                  shadow.card,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    backgroundColor: colors.surface,
                    borderRadius: radius.lg,
                    padding: spacing.lg,
                    opacity: done ? 0.7 : 1,
                  },
                ]}
              >
                <CompletionToggle completed={done} onPress={() => toggleItem(item.id)} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      type.bodyMedium,
                      { color: colors.textPrimary, textDecorationLine: done ? 'line-through' : 'none' },
                    ]}
                  >
                    {item.title}
                  </Text>
                  {(item.time || item.duration) && (
                    <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                      {[item.time, item.duration ? `${item.duration} min` : null].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
