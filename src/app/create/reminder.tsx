import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { DateTimeField } from '@/components/DateTimeField';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { createActivity, getActivity, updateActivity } from '@/db/repositories/activityRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { scheduleActivityReminder } from '@/notifications/notificationService';
import { useTheme } from '@/theme/ThemeProvider';
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
      startTime: activityStartTime,
      endTime: null,
      duration: null,
      priority: null,
      recurrenceRule: null,
      reminder: { enabled: true, minutesBefore: 0 },
      location: null,
    };

    const activityId = existingActivity ? existingActivity.id : createActivity(payload).id;
    if (existingActivity) updateActivity(activityId, payload);

    scheduleActivityReminder({
      activityId,
      title: payload.title,
      date: activityDate,
      startTime: activityStartTime,
      minutesBefore: 0,
    });
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
    </FormScreen>
  );
}
