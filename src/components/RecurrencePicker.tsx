import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { useTheme } from '@/theme/ThemeProvider';
import type { RecurrenceRule } from '@/types/entities';
import { todayKey } from '@/utils/date';

import { FilterChip } from './FilterChip';
import { TextField } from './TextField';

type FrequencyType = 'NONE' | 'DAILY' | 'SPECIFIC_DAYS' | 'MONTHLY' | 'EVERY_X_DAYS';

const FREQUENCY_LABELS: Record<Exclude<FrequencyType, 'NONE'>, string> = {
  DAILY: 'Todos los días',
  SPECIFIC_DAYS: 'Días específicos',
  MONTHLY: 'Mensual',
  EVERY_X_DAYS: 'Cada X días',
};

interface RecurrencePickerProps {
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
}

function deriveInitial(value: RecurrenceRule | null) {
  const base = {
    frequencyType: 'NONE' as FrequencyType,
    specificDays: [1, 3, 5],
    dayOfMonth: '1',
    everyXDays: '2',
    everyXAnchor: todayKey(),
  };
  if (!value) return base;
  switch (value.type) {
    case 'DAILY':
      return { ...base, frequencyType: 'DAILY' as FrequencyType };
    case 'SPECIFIC_DAYS':
      return { ...base, frequencyType: 'SPECIFIC_DAYS' as FrequencyType, specificDays: value.days };
    case 'MONTHLY':
      return { ...base, frequencyType: 'MONTHLY' as FrequencyType, dayOfMonth: String(value.dayOfMonth) };
    case 'EVERY_X_DAYS':
      return {
        ...base,
        frequencyType: 'EVERY_X_DAYS' as FrequencyType,
        everyXDays: String(value.interval),
        everyXAnchor: value.anchorDate,
      };
    default:
      return base;
  }
}

/**
 * Shared frequency picker for tasks/events. Intentionally excludes X_TIMES_PER_WEEK
 * (habit-only — "3 times this week" has no fixed calendar date to materialize) and CUSTOM.
 */
export function RecurrencePicker({ value, onChange }: RecurrencePickerProps) {
  const { colors, spacing, type } = useTheme();
  const initial = deriveInitial(value);
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(initial.frequencyType);
  const [specificDays, setSpecificDays] = useState<number[]>(initial.specificDays);
  const [dayOfMonth, setDayOfMonth] = useState(initial.dayOfMonth);
  const [everyXDays, setEveryXDays] = useState(initial.everyXDays);
  const [everyXAnchor] = useState(initial.everyXAnchor);

  const emit = (freq: FrequencyType, days: number[], dom: string, everyX: string) => {
    switch (freq) {
      case 'NONE':
        onChange(null);
        return;
      case 'DAILY':
        onChange({ type: 'DAILY' });
        return;
      case 'SPECIFIC_DAYS':
        onChange({ type: 'SPECIFIC_DAYS', days });
        return;
      case 'MONTHLY':
        onChange({ type: 'MONTHLY', dayOfMonth: Math.min(31, Math.max(1, Number(dom) || 1)) });
        return;
      case 'EVERY_X_DAYS':
        onChange({ type: 'EVERY_X_DAYS', interval: Math.max(1, Number(everyX) || 1), anchorDate: everyXAnchor });
        return;
    }
  };

  const selectFrequency = (freq: FrequencyType) => {
    setFrequencyType(freq);
    emit(freq, specificDays, dayOfMonth, everyXDays);
  };

  const toggleDay = (day: number) => {
    const next = specificDays.includes(day) ? specificDays.filter((d) => d !== day) : [...specificDays, day].sort();
    setSpecificDays(next);
    emit('SPECIFIC_DAYS', next, dayOfMonth, everyXDays);
  };

  const changeDayOfMonth = (text: string) => {
    setDayOfMonth(text);
    emit('MONTHLY', specificDays, text, everyXDays);
  };

  const changeEveryXDays = (text: string) => {
    setEveryXDays(text);
    emit('EVERY_X_DAYS', specificDays, dayOfMonth, text);
  };

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[type.label, { color: colors.textSecondary }]}>REPETICIÓN</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <FilterChip label="Una vez" selected={frequencyType === 'NONE'} onPress={() => selectFrequency('NONE')} />
        {(Object.keys(FREQUENCY_LABELS) as Exclude<FrequencyType, 'NONE'>[]).map((f) => (
          <FilterChip key={f} label={FREQUENCY_LABELS[f]} selected={frequencyType === f} onPress={() => selectFrequency(f)} />
        ))}
      </View>

      {frequencyType === 'SPECIFIC_DAYS' && (
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {WEEKDAY_LABELS_SHORT.map((label, day) => (
            <Pressable
              key={day}
              onPress={() => toggleDay(day)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: specificDays.includes(day) ? colors.primary : colors.surfaceAlt,
              }}
            >
              <Text style={{ color: specificDays.includes(day) ? colors.onPrimary : colors.textSecondary, fontSize: 13 }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {frequencyType === 'MONTHLY' && (
        <TextField label="Día del mes" value={dayOfMonth} onChangeText={changeDayOfMonth} keyboardType="number-pad" />
      )}
      {frequencyType === 'EVERY_X_DAYS' && (
        <TextField label="Cada cuántos días" value={everyXDays} onChangeText={changeEveryXDays} keyboardType="number-pad" />
      )}
    </View>
  );
}
