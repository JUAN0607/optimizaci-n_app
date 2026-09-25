import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { suggestEmoji } from '@/constants/emojis';
import { createCategory } from '@/db/repositories/categoryRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { useCategories } from '@/hooks/useCategories';
import { palette } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

import { FilterChip } from './FilterChip';
import { TextField } from './TextField';

const NEW_CATEGORY_COLORS = [
  palette.primary.espresso,
  palette.primary.caramel,
  palette.primary.amber,
  palette.secondary.forest,
  palette.secondary.teal,
  palette.secondary.gold,
];

interface CategoryPickerProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const categories = useCategories();
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion);
  const { colors, radius, spacing, type } = useTheme();
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');

  const confirmCreate = () => {
    const name = draftName.trim();
    if (!name) {
      setCreating(false);
      return;
    }
    const color = NEW_CATEGORY_COLORS[categories.length % NEW_CATEGORY_COLORS.length];
    const category = createCategory({ name, icon: suggestEmoji(name, null), color });
    bumpDataVersion();
    setDraftName('');
    setCreating(false);
    onChange(category.id);
  };

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[type.label, { color: colors.textSecondary }]}>CATEGORÍA</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            label={category.name}
            selected={value === category.id}
            onPress={() => onChange(value === category.id ? null : category.id)}
            color={category.color}
          />
        ))}
        <Pressable
          onPress={() => setCreating(true)}
          style={{
            alignSelf: 'flex-start',
            borderRadius: radius.pill,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surfaceAlt,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
          }}
        >
          <Text style={[type.bodySmall, { color: colors.textSecondary }]}>Otra...</Text>
        </Pressable>
      </ScrollView>

      {creating && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField
              label=""
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Nombre de la categoría"
              autoFocus
              onSubmitEditing={confirmCreate}
              returnKeyType="done"
            />
          </View>
          <Pressable
            onPress={confirmCreate}
            style={{ backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12 }}
          >
            <Text style={[type.bodySmall, { color: colors.onPrimary }]}>Crear</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
