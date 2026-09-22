import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CategoryPicker } from '@/components/CategoryPicker';
import { DateTimeField } from '@/components/DateTimeField';
import { FilterChip } from '@/components/FilterChip';
import { FormScreen } from '@/components/FormScreen';
import { RecurrencePicker } from '@/components/RecurrencePicker';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import { PRIORITY_LABELS } from '@/constants/labels';
import { createActivity, getActivity, updateActivityWithRecurrence } from '@/db/repositories/activityRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { cancelEntityNotification, scheduleActivityReminder, scheduleRecurringActivityReminder } from '@/notifications/notificationService';
import { useTheme } from '@/theme/ThemeProvider';
import type { Priority, RecurrenceRule } from '@/types/entities';
import { combineDateAndTime, toDateKey } from '@/utils/date';

const DURATIONS = [15, 30, 45, 60, 90, 120];
const REMINDER_OPTIONS = [5, 15, 30, 60];

export default function CreateTaskScreen() {
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
  const [duration, setDuration] = useState<number | null>(existingActivity?.duration ?? 30);
  const [priority, setPriority] = useState<Priority>(existingActivity?.priority ?? 'MEDIUM');
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(existingActivity?.recurrenceRule ?? null);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(
    existingActivity?.reminder?.enabled ? existingActivity.reminder.minutesBefore : null,
  );
  const [notes, setNotes] = useState(existingActivity?.notes ?? '');

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const activityDate = toDateKey(date);
    const activityStartTime = startTime.toTimeString().slice(0, 5);
    const payload = {
      title: title.trim(),
      notes: notes.trim() || null,
      type: 'TASK' as const,
      categoryId,
      date: activityDate,
      startTime: activityStartTime,
      endTime: null,
      duration,
      priority,
      recurrenceRule,
      isRecurring: !!recurrenceRule,
      reminder: reminderMinutes ? { enabled: true, minutesBefore: reminderMinutes } : null,
      location: null,
    };

    let activityId: string;
    if (existingActivity) {
      activityId = existingActivity.id;
      updateActivityWithRecurrence(activityId, payload);
    } else {
      activityId = createActivity(payload).id;
    }

    if (reminderMinutes && recurrenceRule) {
      scheduleRecurringActivityReminder({
        activityId,
        title: payload.title,
        startTime: activityStartTime,
        minutesBefore: reminderMinutes,
        recurrenceRule,
      });
    } else if (reminderMinutes) {
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
    <FormScreen title={isEditing ? 'Editar tarea' : 'Nueva tarea'} onSave={save} saveDisabled={!canSave}>
      <TextField
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="¿Qué necesitas hacer?"
        autoFocus={!isEditing}
      />
      <CategoryPicker value={categoryId} onChange={setCategoryId} />

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <DateTimeField label="Fecha" mode="date" value={date} onChange={setDate} />
        <DateTimeField label="Hora" mode="time" value={startTime} onChange={setStartTime} />
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>DURACIÓN</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {DURATIONS.map((d) => (
            <FilterChip key={d} label={`${d} min`} selected={duration === d} onPress={() => setDuration(d)} />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>PRIORIDAD</Text>
        <SegmentedControl
          options={(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
          value={priority}
          onChange={setPriority}
        />
      </View>

      <RecurrencePicker value={recurrenceRule} onChange={setRecurrenceRule} />

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
