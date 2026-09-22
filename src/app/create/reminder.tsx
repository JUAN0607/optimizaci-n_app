import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { DateTimeField } from '@/components/DateTimeField';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { createActivity } from '@/db/repositories/activityRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { scheduleActivityReminder } from '@/notifications/notificationService';
import { useTheme } from '@/theme/ThemeProvider';
import { toDateKey } from '@/utils/date';

export default function CreateReminderScreen() {
  const { spacing } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const activityDate = toDateKey(date);
    const activityStartTime = time.toTimeString().slice(0, 5);
    const activity = createActivity({
      title: title.trim(),
      notes: null,
      type: 'REMINDER',
      categoryId: null,
      date: activityDate,
      startTime: activityStartTime,
      endTime: null,
      duration: null,
      priority: null,
      recurrenceRule: null,
      reminder: { enabled: true, minutesBefore: 0 },
      location: null,
    });
    scheduleActivityReminder({
      activityId: activity.id,
      title: activity.title,
      date: activityDate,
      startTime: activityStartTime,
      minutesBefore: 0,
    });
    bumpDataVersion();
    router.back();
  };

  return (
    <FormScreen title="Recordatorio" onSave={save} saveDisabled={!canSave}>
      <TextField label="¿Qué quieres recordar?" value={title} onChangeText={setTitle} placeholder="Recordatorio" autoFocus />
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <DateTimeField label="Fecha" mode="date" value={date} onChange={setDate} />
        <DateTimeField label="Hora" mode="time" value={time} onChange={setTime} />
      </View>
    </FormScreen>
  );
}
