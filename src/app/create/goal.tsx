import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { DateTimeField } from '@/components/DateTimeField';
import { FilterChip } from '@/components/FilterChip';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { createGoal } from '@/db/repositories/goalRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { Goal } from '@/types/entities';
import { toDateKey } from '@/utils/date';

const TIMEFRAME_LABELS: Record<Goal['timeframe'], string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
  CUSTOM: 'Personalizado',
};

export default function CreateGoalScreen() {
  const { colors, spacing, type } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [timeframe, setTimeframe] = useState<Goal['timeframe']>('WEEKLY');
  const [endDate, setEndDate] = useState<Date | null>(null);

  const canSave = title.trim().length > 0 && Number(target) > 0 && targetUnit.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    createGoal({
      title: title.trim(),
      target: Number(target),
      targetUnit: targetUnit.trim(),
      timeframe,
      startDate: toDateKey(new Date()),
      endDate: endDate ? toDateKey(endDate) : null,
    });
    bumpDataVersion();
    router.back();
  };

  return (
    <FormScreen title="Nueva meta" onSave={save} saveDisabled={!canSave}>
      <TextField label="Meta" value={title} onChangeText={setTitle} placeholder="Ej. Entrenar 4 veces por semana" autoFocus />

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <TextField label="Cantidad" value={target} onChangeText={setTarget} keyboardType="numeric" placeholder="4" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Unidad" value={targetUnit} onChangeText={setTargetUnit} placeholder="veces, km, horas..." />
        </View>
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>PLAZO</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(Object.keys(TIMEFRAME_LABELS) as Goal['timeframe'][]).map((tf) => (
            <FilterChip key={tf} label={TIMEFRAME_LABELS[tf]} selected={timeframe === tf} onPress={() => setTimeframe(tf)} />
          ))}
        </View>
      </View>

      {timeframe === 'CUSTOM' && (
        <DateTimeField label="Fecha límite" mode="date" value={endDate ?? new Date()} onChange={setEndDate} />
      )}
    </FormScreen>
  );
}
