import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { createCategory, getCategory, updateCategory } from '@/db/repositories/categoryRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { palette } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

const COLOR_OPTIONS = [
  palette.primary.espresso,
  palette.primary.caramel,
  palette.primary.amber,
  palette.secondary.forest,
  palette.secondary.teal,
  palette.secondary.gold,
];

export default function CreateCategoryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = id ? getCategory(id) : null;
  const isEditing = !!existing;

  const { colors, radius, spacing, type } = useTheme();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);

  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? COLOR_OPTIONS[0]);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    if (existing) {
      updateCategory(existing.id, { name: name.trim(), color, isActive });
    } else {
      createCategory({ name: name.trim(), icon: 'circle', color });
    }
    bumpDataVersion();
    router.back();
  };

  return (
    <FormScreen title={isEditing ? 'Editar categoría' : 'Nueva categoría'} onSave={save} saveDisabled={!canSave}>
      <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Finanzas" autoFocus={!isEditing} />

      <View style={{ gap: spacing.xs }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>COLOR</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {COLOR_OPTIONS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityLabel={`Color ${c}`}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: c,
                borderWidth: color === c ? 3 : 0,
                borderColor: colors.textPrimary,
              }}
            />
          ))}
        </View>
      </View>

      {isEditing && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            padding: spacing.md,
          }}
        >
          <Text style={[type.body, { color: colors.textPrimary }]}>Categoría activa</Text>
          <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: colors.primary }} />
        </View>
      )}
    </FormScreen>
  );
}
