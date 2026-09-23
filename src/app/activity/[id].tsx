import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/components/CategoryBadge';
import { CompletionToggle } from '@/components/CompletionToggle';
import { DateTimeField } from '@/components/DateTimeField';
import { PriorityIndicator } from '@/components/PriorityIndicator';
import { STATUS_LABELS } from '@/constants/labels';
import { deleteActivity, getActivity, rescheduleActivity, restoreActivity, setActivityStatus } from '@/db/repositories/activityRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategoryMap } from '@/hooks/useCategories';
import { useUndoStore } from '@/hooks/useUndoStore';
import { cancelEntityNotification, scheduleActivityReminder } from '@/notifications/notificationService';
import { useTheme } from '@/theme/ThemeProvider';
import { combineDateAndTime, toDateKey } from '@/utils/date';
import { hapticComplete } from '@/utils/haptics';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius, type, shadow } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const categoryMap = useCategoryMap();
  const showUndo = useUndoStore((s) => s.show);
  const [rescheduling, setRescheduling] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- dataVersion drives refetching from SQLite
  const activity = useMemo(() => (id ? getActivity(id) : null), [id, dataVersion]);

  const [draftDate, setDraftDate] = useState(() => (activity ? combineDateAndTime(activity.date, null) : new Date()));
  const [draftTime, setDraftTime] = useState(() =>
    activity?.startTime ? combineDateAndTime(activity.date, activity.startTime) : new Date(),
  );

  if (!activity) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, padding: spacing.xl }}>Actividad no encontrada.</Text>
      </SafeAreaView>
    );
  }

  const category = activity.categoryId ? (categoryMap.get(activity.categoryId) ?? null) : null;
  const isCompleted = activity.status === 'COMPLETED';
  const editRoute =
    activity.type === 'EVENT' ? '/create/event' : activity.type === 'REMINDER' ? '/create/reminder' : '/create/task';

  const toggleComplete = () => {
    const nextStatus = isCompleted ? 'PENDING' : 'COMPLETED';
    setActivityStatus(activity.id, nextStatus);
    if (nextStatus === 'COMPLETED') {
      cancelEntityNotification('ACTIVITY', activity.id);
      hapticComplete();
    }
    bumpDataVersion();
  };

  const confirmReschedule = () => {
    const newDate = toDateKey(draftDate);
    const newStartTime = draftTime.toTimeString().slice(0, 5);
    rescheduleActivity(activity.id, newDate, newStartTime, activity.endTime);
    if (activity.reminder?.enabled) {
      scheduleActivityReminder({
        activityId: activity.id,
        title: activity.title,
        date: newDate,
        startTime: newStartTime,
        minutesBefore: activity.reminder.minutesBefore,
      });
    }
    bumpDataVersion();
    setRescheduling(false);
  };

  const confirmDelete = () => {
    Alert.alert('Eliminar actividad', `¿Eliminar "${activity.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          const snapshot = activity;
          cancelEntityNotification('ACTIVITY', snapshot.id);
          deleteActivity(snapshot.id);
          bumpDataVersion();
          router.back();
          // Deferred so the snackbar mounts after the modal's dismiss transition finishes —
          // showing it immediately raced the native modal animation and swallowed its taps.
          setTimeout(() => {
            showUndo(`"${snapshot.title}" eliminada`, () => {
              restoreActivity(snapshot);
              bumpDataVersion();
            });
          }, 400);
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
          <Pressable onPress={() => router.push({ pathname: editRoute, params: { id: activity.id } })} accessibilityLabel="Editar" hitSlop={8}>
            <Ionicons name="pencil-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={confirmDelete} accessibilityLabel="Eliminar" hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={colors.statusOverdue} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
          <Text style={[type.h1, { color: colors.textPrimary, flex: 1 }]}>{activity.title}</Text>
          <CompletionToggle completed={isCompleted} onPress={toggleComplete} size={36} />
        </View>

        {category && <CategoryBadge category={category} />}

        <View style={[styles.card, shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }]}>
          <Row label="Estado" value={STATUS_LABELS[activity.status]} colors={colors} type={type} />
          <Row
            label="Cuándo"
            value={`${activity.date}${activity.startTime ? ` · ${activity.startTime}` : ''}${activity.endTime ? ` — ${activity.endTime}` : ''}`}
            colors={colors}
            type={type}
          />
          {activity.priority && (
            <View style={{ marginTop: spacing.sm }}>
              <PriorityIndicator priority={activity.priority} />
            </View>
          )}
        </View>

        {activity.notes && (
          <View style={[styles.card, shadow.card, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }]}>
            <Text style={[type.body, { color: colors.textPrimary }]}>{activity.notes}</Text>
          </View>
        )}

        <Pressable
          onPress={() => setRescheduling((v) => !v)}
          style={[styles.actionRow, { borderRadius: radius.md }]}
          accessibilityRole="button"
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={[type.bodyMedium, { color: colors.primary }]}>Reprogramar</Text>
        </Pressable>

        {rescheduling && (
          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <DateTimeField label="Fecha" mode="date" value={draftDate} onChange={setDraftDate} />
              <DateTimeField label="Hora" mode="time" value={draftTime} onChange={setDraftTime} />
            </View>
            <Pressable
              onPress={confirmReschedule}
              style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: radius.pill }]}
            >
              <Text style={[type.bodyMedium, { color: colors.onPrimary }]}>Guardar nueva fecha</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  colors,
  type,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
}) {
  return (
    <View style={styles.row}>
      <Text style={[type.bodySmall, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  primaryButton: { paddingVertical: 14, alignItems: 'center' },
});
