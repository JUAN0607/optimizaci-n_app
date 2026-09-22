import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CategoryPicker } from '@/components/CategoryPicker';
import { FilterChip } from '@/components/FilterChip';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { MEASUREMENT_LABELS, WEEKDAY_LABELS_SHORT } from '@/constants/labels';
import { createHabit } from '@/db/repositories/habitRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { MeasurementType, RecurrenceRule } from '@/types/entities';

const ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'body-outline',
  'water-outline',
  'book-outline',
  'walk-outline',
  'barbell-outline',
  'moon-outline',
  'flame-outline',
  'heart-outline',
];

type FrequencyType = 'DAILY' | 'SPECIFIC_DAYS' | 'X_TIMES_PER_WEEK' | 'MONTHLY' | 'EVERY_X_DAYS';

const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  DAILY: 'Todos los días',
  SPECIFIC_DAYS: 'Días específicos',
  X_TIMES_PER_WEEK: 'X veces/semana',
  MONTHLY: 'Mensual',
  EVERY_X_DAYS: 'Cada X días',
};

export default function CreateHabitScreen() {
  const { colors, spacing, type } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);

  const [icon, setIcon] = useState<keyof typeof Ionicons.glyphMap>(ICONS[0]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('DAILY');
  const [specificDays, setSpecificDays] = useState<number[]>([1, 3, 5]);
  const [timesPerWeek, setTimesPerWeek] = useState('3');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [everyXDays, setEveryXDays] = useState('2');
  const [measurementType, setMeasurementType] = useState<MeasurementType>('CHECKBOX');
  const [target, setTarget] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [notes, setNotes] = useState('');

  const canSave = name.trim().length > 0;

  const buildRecurrence = (): RecurrenceRule => {
    switch (frequencyType) {
      case 'DAILY':
        return { type: 'DAILY' };
      case 'SPECIFIC_DAYS':
        return { type: 'SPECIFIC_DAYS', days: specificDays };
      case 'X_TIMES_PER_WEEK':
        return { type: 'X_TIMES_PER_WEEK', times: Math.max(1, Number(timesPerWeek) || 1) };
      case 'MONTHLY':
        return { type: 'MONTHLY', dayOfMonth: Math.min(31, Math.max(1, Number(dayOfMonth) || 1)) };
      case 'EVERY_X_DAYS':
        return { type: 'EVERY_X_DAYS', interval: Math.max(1, Number(everyXDays) || 1), anchorDate: new Date().toISOString().slice(0, 10) };
    }
  };

  const save = () => {
    if (!canSave) return;
    createHabit({
      name: name.trim(),
      icon,
      categoryId,
      measurementType,
      target: measurementType === 'CHECKBOX' ? null : Number(target) || null,
      targetUnit: measurementType === 'CHECKBOX' ? null : targetUnit.trim() || null,
      recurrenceRule: buildRecurrence(),
      reminder: null,
      notes: notes.trim() || null,
    });
    bumpDataVersion();
    router.back();
  };

  const toggleDay = (day: number) => {
    setSpecificDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  };

  return (
    <FormScreen title="Nuevo hábito" onSave={save} saveDisabled={!canSave}>
      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>ÍCONO</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {ICONS.map((iconName) => (
            <Pressable
              key={iconName}
              onPress={() => setIcon(iconName)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: icon === iconName ? colors.primary : colors.surfaceAlt,
              }}
            >
              <Ionicons name={iconName} size={20} color={icon === iconName ? colors.onPrimary : colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      </View>

      <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Meditar" autoFocus />
      <CategoryPicker value={categoryId} onChange={setCategoryId} />

      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>FRECUENCIA</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {(Object.keys(FREQUENCY_LABELS) as FrequencyType[]).map((f) => (
            <FilterChip key={f} label={FREQUENCY_LABELS[f]} selected={frequencyType === f} onPress={() => setFrequencyType(f)} />
          ))}
        </View>
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
      {frequencyType === 'X_TIMES_PER_WEEK' && (
        <TextField label="Veces por semana" value={timesPerWeek} onChangeText={setTimesPerWeek} keyboardType="number-pad" />
      )}
      {frequencyType === 'MONTHLY' && (
        <TextField label="Día del mes" value={dayOfMonth} onChangeText={setDayOfMonth} keyboardType="number-pad" />
      )}
      {frequencyType === 'EVERY_X_DAYS' && (
        <TextField label="Cada cuántos días" value={everyXDays} onChangeText={setEveryXDays} keyboardType="number-pad" />
      )}

      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>MEDICIÓN</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {(Object.keys(MEASUREMENT_LABELS) as MeasurementType[]).map((m) => (
            <FilterChip key={m} label={MEASUREMENT_LABELS[m]} selected={measurementType === m} onPress={() => setMeasurementType(m)} />
          ))}
        </View>
      </View>

      {measurementType !== 'CHECKBOX' && (
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <TextField label="Meta" value={target} onChangeText={setTarget} keyboardType="numeric" placeholder="30" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Unidad" value={targetUnit} onChangeText={setTargetUnit} placeholder="min, km, vasos..." />
          </View>
        </View>
      )}

      <TextField label="Notas" value={notes} onChangeText={setNotes} placeholder="Notas opcionales" multiline numberOfLines={3} />
    </FormScreen>
  );
}
