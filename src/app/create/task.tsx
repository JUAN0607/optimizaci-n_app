import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CategoryPicker } from '@/components/CategoryPicker';
import { DateTimeField } from '@/components/DateTimeField';
import { FilterChip } from '@/components/FilterChip';
import { FormScreen } from '@/components/FormScreen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import { PRIORITY_LABELS } from '@/constants/labels';
import { createActivity } from '@/db/repositories/activityRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { scheduleActivityReminder } from '@/notifications/notificationService';
import { useTheme } from '@/theme/ThemeProvider';
import type { Priority, RecurrenceRule } from '@/types/entities';
import { toDateKey } from '@/utils/date';

const DURATIONS = [15, 30, 45, 60, 90, 120];
const REMINDER_OPTIONS = [5, 15, 30, 60];

export default function CreateTaskScreen() {
  const { colors, spacing, type } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [duration, setDuration] = useState<number | null>(30);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [repeats, setRepeats] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const recurrenceRule: RecurrenceRule | null = repeats ? { type: 'DAILY' } : null;
    const activityDate = toDateKey(date);
    const activityStartTime = startTime.toTimeString().slice(0, 5);
    const activity = createActivity({
      title: title.trim(),
      notes: notes.trim() || null,
      type: 'TASK',
      categoryId,
      date: activityDate,
      startTime: activityStartTime,
      endTime: null,
      duration,
      priority,
      recurrenceRule,
      isRecurring: repeats,
      reminder: reminderMinutes ? { enabled: true, minutesBefore: reminderMinutes } : null,
      location: null,
    });
    if (reminderMinutes) {
      scheduleActivityReminder({
        activityId: activity.id,
        title: activity.title,
        date: activityDate,
        startTime: activityStartTime,
        minutesBefore: reminderMinutes,
      });
    }
    bumpDataVersion();
    router.back();
  };

  return (
    <FormScreen title="Nueva tarea" onSave={save} saveDisabled={!canSave}>
      <TextField label="Título" value={title} onChangeText={setTitle} placeholder="¿Qué necesitas hacer?" autoFocus />
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
