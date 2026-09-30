import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { DateTimeField } from '@/components/DateTimeField';
import { FormScreen } from '@/components/FormScreen';
import { RecurrencePicker } from '@/components/RecurrencePicker';
import { TextField } from '@/components/TextField';
import { createActivity, getActivity, updateActivityWithRecurrence } from '@/db/repositories/activityRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { scheduleActivityReminder, scheduleRecurringActivityReminder } from '@/notifications/notificationService';
import { useTheme } from '@/theme/ThemeProvider';
import type { RecurrenceRule } from '@/types/entities';
import { combineDateAndTime, toDateKey } from '@/utils/date';

export default function CreateReminderScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existingActivity = id ? getActivity(id) : null;
  const isEditing = !!existingActivity;

  const { spacing } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);

  const [title, setTitle] = useState(existingActivity?.title ?? '');
  const [date, setDate] = useState(() => (existingActivity ? combineDateAndTime(existingActivity.date, null) : new Date()));
  const [time, setTime] = useState(() =>
    existingActivity ? combineDateAndTime(existingActivity.date, existingActivity.startTime) : new Date(),
  );
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(existingActivity?.recurrenceRule ?? null);

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const activityDate = toDateKey(date);
    const activityStartTime = time.toTimeString().slice(0, 5);
    const payload = {
      title: title.trim(),
      notes: null,
      type: 'REMINDER' as const,
      categoryId: null,
      date: activityDate,
      dueDate: null,
      startTime: activityStartTime,
      endTime: null,
      duration: null,
      priority: null,
      recurrenceRule,
      isRecurring: !!recurrenceRule,
      reminder: { enabled: true, minutesBefore: 0 },
      location: null,
    };

    let activityId: string;
    if (existingActivity) {
      activityId = existingActivity.id;
      updateActivityWithRecurrence(activityId, payload);
    } else {
      activityId = createActivity(payload).id;
    }

    if (recurrenceRule) {
      scheduleRecurringActivityReminder({
        activityId,
        title: payload.title,
        startTime: activityStartTime,
        minutesBefore: 0,
        recurrenceRule,
      });
    } else {
      scheduleActivityReminder({
        activityId,
        title: payload.title,
        date: activityDate,
        startTime: activityStartTime,
        minutesBefore: 0,
      });
    }
    bumpDataVersion();
    router.back();
  };

  return (
    <FormScreen title={isEditing ? 'Editar recordatorio' : 'Recordatorio'} onSave={save} saveDisabled={!canSave}>
      <TextField
        label="¿Qué quieres recordar?"
        value={title}
        onChangeText={setTitle}
        placeholder="Recordatorio"
        autoFocus={!isEditing}
      />
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <DateTimeField label="Fecha" mode="date" value={date} onChange={setDate} />
        <DateTimeField label="Hora" mode="time" value={time} onChange={setTime} />
      </View>

      <RecurrencePicker value={recurrenceRule} onChange={setRecurrenceRule} />
    </FormScreen>
  );
}
