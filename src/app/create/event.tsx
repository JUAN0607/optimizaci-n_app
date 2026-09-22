import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CategoryPicker } from '@/components/CategoryPicker';
import { DateTimeField } from '@/components/DateTimeField';
import { FilterChip } from '@/components/FilterChip';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { createActivity, getActivity, updateActivity } from '@/db/repositories/activityRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { cancelEntityNotification, scheduleActivityReminder } from '@/notifications/notificationService';
import { useTheme } from '@/theme/ThemeProvider';
import type { RecurrenceRule } from '@/types/entities';
import { combineDateAndTime, toDateKey } from '@/utils/date';

const REMINDER_OPTIONS = [5, 15, 30, 60];

export default function CreateEventScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existingActivity = id ? getActivity(id) : null;
  const isEditing = !!existingActivity;

  const { colors, spacing, type } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);

  const [title, setTitle] = useState(existingActivity?.title ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(existingActivity?.categoryId ?? null);
  const [date, setDate] = useState(() => (existingActivity ? combineDateAndTime(existingActivity.date, null) : new Date()));
  const [startTime, setStartTime] = useState(() =>
    existingActivity ? combineDateAndTime(existingActivity.date, existingActivity.startTime) : new Date(),
  );
  const [endTime, setEndTime] = useState(() =>
    existingActivity?.endTime
      ? combineDateAndTime(existingActivity.date, existingActivity.endTime)
      : new Date(Date.now() + 60 * 60 * 1000),
  );
  const [location, setLocation] = useState(existingActivity?.location ?? '');
  const [repeats, setRepeats] = useState(existingActivity?.isRecurring ?? false);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(
    existingActivity ? (existingActivity.reminder?.enabled ? existingActivity.reminder.minutesBefore : null) : 15,
  );
  const [notes, setNotes] = useState(existingActivity?.notes ?? '');

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const recurrenceRule: RecurrenceRule | null = repeats ? { type: 'DAILY' } : null;
    const activityDate = toDateKey(date);
    const activityStartTime = startTime.toTimeString().slice(0, 5);
    const payload = {
      title: title.trim(),
      notes: notes.trim() || null,
      type: 'EVENT' as const,
      categoryId,
      date: activityDate,
      startTime: activityStartTime,
      endTime: endTime.toTimeString().slice(0, 5),
      duration: null,
      priority: null,
      recurrenceRule,
      isRecurring: repeats,
      reminder: reminderMinutes ? { enabled: true, minutesBefore: reminderMinutes } : null,
      location: location.trim() || null,
    };

    const activityId = existingActivity ? existingActivity.id : createActivity(payload).id;
    if (existingActivity) updateActivity(activityId, payload);

    if (reminderMinutes) {
      scheduleActivityReminder({
        activityId,
        title: payload.title,
        date: activityDate,
        startTime: activityStartTime,
        minutesBefore: reminderMinutes,
      });
    } else if (isEditing) {
      cancelEntityNotification('ACTIVITY', activityId);
    }
    bumpDataVersion();
    router.back();
  };

  return (
    <FormScreen title={isEditing ? 'Editar evento' : 'Nuevo evento'} onSave={save} saveDisabled={!canSave}>
      <TextField
        label="Nombre"
        value={title}
        onChangeText={setTitle}
        placeholder="Nombre del evento"
        autoFocus={!isEditing}
      />
      <CategoryPicker value={categoryId} onChange={setCategoryId} />

      <DateTimeField label="Fecha" mode="date" value={date} onChange={setDate} />
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <DateTimeField label="Inicio" mode="time" value={startTime} onChange={setStartTime} />
        <DateTimeField label="Fin" mode="time" value={endTime} onChange={setEndTime} />
      </View>

      <TextField label="Ubicación" value={location} onChangeText={setLocation} placeholder="Opcional" />

      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>REPETICIÓN</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <FilterChip label="Una vez" selected={!repeats} onPress={() => setRepeats(false)} />
          <FilterChip label="Todos los días" selected={repeats} onPress={() => setRepeats(true)} />
        </View>
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>RECORDATORIO</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <FilterChip label="Sin recordatorio" selected={reminderMinutes === null} onPress={() => setReminderMinutes(null)} />
          {REMINDER_OPTIONS.map((m) => (
            <FilterChip key={m} label={`${m} min antes`} selected={reminderMinutes === m} onPress={() => setReminderMinutes(m)} />
          ))}
        </View>
      </View>

      <TextField label="Notas" value={notes} onChangeText={setNotes} placeholder="Notas opcionales" multiline numberOfLines={3} />
    </FormScreen>
  );
}
