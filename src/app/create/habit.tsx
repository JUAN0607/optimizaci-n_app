import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CategoryPicker } from '@/components/CategoryPicker';
import { EmojiPicker } from '@/components/EmojiPicker';
import { FilterChip } from '@/components/FilterChip';
import { buildRecurrenceRule, deriveFrequencyState, FrequencyPicker } from '@/components/FrequencyPicker';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { MEASUREMENT_LABELS } from '@/constants/labels';
import { suggestEmoji } from '@/constants/emojis';
import { createHabit, getHabit, updateHabit } from '@/db/repositories/habitRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import type { MeasurementType } from '@/types/entities';

export default function CreateHabitScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existingHabit = id ? getHabit(id) : null;
  const isEditing = !!existingHabit;

  const { colors, radius, spacing, type } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);
  const categories = useCategories();

  const [manualIcon, setManualIcon] = useState<string | null>(isEditing ? (existingHabit?.icon ?? null) : null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [name, setName] = useState(existingHabit?.name ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(existingHabit?.categoryId ?? null);

  const categoryName = categories.find((c) => c.id === categoryId)?.name ?? null;
  const icon = manualIcon ?? suggestEmoji(name, categoryName);

  const [frequency, setFrequency] = useState(() => deriveFrequencyState(existingHabit?.recurrenceRule));
  const [measurementType, setMeasurementType] = useState<MeasurementType>(existingHabit?.measurementType ?? 'CHECKBOX');
  const [target, setTarget] = useState(existingHabit?.target != null ? String(existingHabit.target) : '');
  const [targetUnit, setTargetUnit] = useState(existingHabit?.targetUnit ?? '');
  const [notes, setNotes] = useState(existingHabit?.notes ?? '');

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const payload = {
      name: name.trim(),
      icon,
      categoryId,
      measurementType,
      target: measurementType === 'CHECKBOX' ? null : Number(target) || null,
      targetUnit: measurementType === 'CHECKBOX' ? null : targetUnit.trim() || null,
      recurrenceRule: buildRecurrenceRule(frequency),
      reminder: existingHabit?.reminder ?? null,
      notes: notes.trim() || null,
    };
    if (existingHabit) {
      updateHabit(existingHabit.id, payload);
    } else {
      createHabit(payload);
    }
    bumpDataVersion();
    router.back();
  };

  return (
    <FormScreen title={isEditing ? 'Editar hábito' : 'Nuevo hábito'} onSave={save} saveDisabled={!canSave}>
      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>ÍCONO</Text>
        <Pressable
          onPress={() => setShowEmojiPicker((v) => !v)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            alignSelf: 'flex-start',
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.md,
            padding: spacing.xs,
            paddingRight: spacing.md,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ fontSize: 22 }}>{icon}</Text>
          </View>
          <Text style={[type.bodySmall, { color: colors.primary }]}>{showEmojiPicker ? 'Cerrar' : 'Cambiar emoji'}</Text>
        </Pressable>
        {showEmojiPicker && (
          <EmojiPicker
            value={icon}
            onChange={(emoji) => {
              setManualIcon(emoji);
              setShowEmojiPicker(false);
            }}
          />
        )}
      </View>

      <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Meditar" autoFocus={!isEditing} />
      <CategoryPicker value={categoryId} onChange={setCategoryId} />

      <FrequencyPicker state={frequency} onChange={setFrequency} />

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
