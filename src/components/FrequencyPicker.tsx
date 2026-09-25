import { Pressable, Text, View } from 'react-native';

import { WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { useTheme } from '@/theme/ThemeProvider';
import type { RecurrenceRule } from '@/types/entities';
import { todayKey } from '@/utils/date';

import { FilterChip } from './FilterChip';
import { TextField } from './TextField';

export type FrequencyType = 'DAILY' | 'SPECIFIC_DAYS' | 'X_TIMES_PER_WEEK' | 'MONTHLY' | 'EVERY_X_DAYS';

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  DAILY: 'Todos los días',
  SPECIFIC_DAYS: 'Días específicos',
  X_TIMES_PER_WEEK: 'X veces/semana',
  MONTHLY: 'Mensual',
  EVERY_X_DAYS: 'Cada X días',
};

export interface FrequencyState {
  frequencyType: FrequencyType;
  specificDays: number[];
  timesPerWeek: string;
  dayOfMonth: string;
  everyXDays: string;
  everyXAnchor: string;
}

export function deriveFrequencyState(rule: RecurrenceRule | null | undefined): FrequencyState {
  const base: FrequencyState = {
    frequencyType: 'DAILY',
    specificDays: [1, 3, 5],
    timesPerWeek: '3',
    dayOfMonth: '1',
    everyXDays: '2',
    everyXAnchor: todayKey(),
  };
  if (!rule) return base;
  switch (rule.type) {
    case 'SPECIFIC_DAYS':
      return { ...base, frequencyType: 'SPECIFIC_DAYS', specificDays: rule.days };
    case 'X_TIMES_PER_WEEK':
      return { ...base, frequencyType: 'X_TIMES_PER_WEEK', timesPerWeek: String(rule.times) };
    case 'MONTHLY':
      return { ...base, frequencyType: 'MONTHLY', dayOfMonth: String(rule.dayOfMonth) };
    case 'EVERY_X_DAYS':
      return { ...base, frequencyType: 'EVERY_X_DAYS', everyXDays: String(rule.interval), everyXAnchor: rule.anchorDate };
    default:
      return base;
  }
}

export function buildRecurrenceRule(state: FrequencyState): RecurrenceRule {
  switch (state.frequencyType) {
    case 'DAILY':
      return { type: 'DAILY' };
    case 'SPECIFIC_DAYS':
      return { type: 'SPECIFIC_DAYS', days: state.specificDays };
    case 'X_TIMES_PER_WEEK':
      return { type: 'X_TIMES_PER_WEEK', times: Math.max(1, Number(state.timesPerWeek) || 1) };
    case 'MONTHLY':
      return { type: 'MONTHLY', dayOfMonth: Math.min(31, Math.max(1, Number(state.dayOfMonth) || 1)) };
    case 'EVERY_X_DAYS':
      return { type: 'EVERY_X_DAYS', interval: Math.max(1, Number(state.everyXDays) || 1), anchorDate: state.everyXAnchor };
  }
}

interface FrequencyPickerProps {
  state: FrequencyState;
  onChange: (state: FrequencyState) => void;
}

export function FrequencyPicker({ state, onChange }: FrequencyPickerProps) {
  const { colors, spacing, type } = useTheme();
  const patch = (partial: Partial<FrequencyState>) => onChange({ ...state, ...partial });

  const toggleDay = (day: number) => {
    const specificDays = state.specificDays.includes(day)
      ? state.specificDays.filter((d) => d !== day)
      : [...state.specificDays, day].sort();
    patch({ specificDays });
  };

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>FRECUENCIA</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {(Object.keys(FREQUENCY_LABELS) as FrequencyType[]).map((f) => (
            <FilterChip
              key={f}
              label={FREQUENCY_LABELS[f]}
              selected={state.frequencyType === f}
              onPress={() => patch({ frequencyType: f })}
            />
          ))}
        </View>
      </View>

      {state.frequencyType === 'SPECIFIC_DAYS' && (
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
                backgroundColor: state.specificDays.includes(day) ? colors.primary : colors.surfaceAlt,
              }}
            >
              <Text style={{ color: state.specificDays.includes(day) ? colors.onPrimary : colors.textSecondary, fontSize: 13 }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {state.frequencyType === 'X_TIMES_PER_WEEK' && (
        <TextField
          label="Veces por semana"
          value={state.timesPerWeek}
          onChangeText={(v) => patch({ timesPerWeek: v })}
          keyboardType="number-pad"
        />
      )}
      {state.frequencyType === 'MONTHLY' && (
        <TextField label="Día del mes" value={state.dayOfMonth} onChangeText={(v) => patch({ dayOfMonth: v })} keyboardType="number-pad" />
      )}
      {state.frequencyType === 'EVERY_X_DAYS' && (
        <TextField
          label="Cada cuántos días"
          value={state.everyXDays}
          onChangeText={(v) => patch({ everyXDays: v })}
          keyboardType="number-pad"
        />
      )}
    </View>
  );
}
