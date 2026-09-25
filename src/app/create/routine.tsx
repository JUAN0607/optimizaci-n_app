import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { EmojiPicker } from '@/components/EmojiPicker';
import { buildRecurrenceRule, deriveFrequencyState, FrequencyPicker } from '@/components/FrequencyPicker';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { suggestEmoji } from '@/constants/emojis';
import { createRoutine, getRoutine, listRoutineItems, replaceRoutineItems, updateRoutine } from '@/db/repositories/routineRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';

interface DraftItem {
  title: string;
  time: string;
}

export default function CreateRoutineScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existingRoutine = id ? getRoutine(id) : null;
  const isEditing = !!existingRoutine;
  const existingItems = existingRoutine ? listRoutineItems(existingRoutine.id) : [];

  const { colors, radius, spacing, type } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);

  const [name, setName] = useState(existingRoutine?.name ?? '');
  const [manualIcon, setManualIcon] = useState<string | null>(existingRoutine?.icon ?? null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const icon = manualIcon ?? suggestEmoji(name, null);
  const [frequency, setFrequency] = useState(() => deriveFrequencyState(existingRoutine?.recurrenceRule));
  const [items, setItems] = useState<DraftItem[]>(
    existingItems.length > 0 ? existingItems.map((i) => ({ title: i.title, time: i.time ?? '' })) : [{ title: '', time: '' }],
  );

  const canSave = name.trim().length > 0 && items.some((i) => i.title.trim().length > 0);

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const move = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = () => {
    if (!canSave) return;
    const validItems = items.filter((i) => i.title.trim().length > 0);
    const payloadItems = validItems.map((item, index) => ({
      title: item.title.trim(),
      time: item.time.trim() || null,
      order: index,
      duration: null,
    }));
    const recurrenceRule = frequency.frequencyType === 'DAILY' ? null : buildRecurrenceRule(frequency);
    if (existingRoutine) {
      updateRoutine(existingRoutine.id, { name: name.trim(), icon, recurrenceRule });
      replaceRoutineItems(existingRoutine.id, payloadItems);
    } else {
      createRoutine({ name: name.trim(), icon, recurrenceRule, items: payloadItems });
    }
    bumpDataVersion();
    router.back();
  };

  return (
    <FormScreen title={isEditing ? 'Editar rutina' : 'Nueva rutina'} onSave={save} saveDisabled={!canSave}>
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

      <TextField
        label="Nombre de la rutina"
        value={name}
        onChangeText={setName}
        placeholder="Ej. Rutina de la mañana"
        autoFocus={!isEditing}
      />

      <FrequencyPicker state={frequency} onChange={setFrequency} />

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>PASOS</Text>
        {items.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              padding: spacing.sm,
            }}
          >
            <View style={{ width: 84 }}>
              <TextField label="" value={item.time} onChangeText={(v) => updateItem(index, { time: v })} placeholder="06:00" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="" value={item.title} onChangeText={(v) => updateItem(index, { title: v })} placeholder={`Paso ${index + 1}`} />
            </View>
            <View style={{ gap: 4 }}>
              <Pressable onPress={() => move(index, -1)} hitSlop={6}>
                <Ionicons name="chevron-up" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={() => move(index, 1)} hitSlop={6}>
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Pressable
              onPress={() => setItems((prev) => prev.filter((_, i) => i !== index))}
              hitSlop={6}
              accessibilityLabel="Eliminar paso"
            >
              <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => setItems((prev) => [...prev, { title: '', time: '' }])}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.sm }}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={[type.bodyMedium, { color: colors.primary }]}>Agregar paso</Text>
        </Pressable>
      </View>
    </FormScreen>
  );
}
