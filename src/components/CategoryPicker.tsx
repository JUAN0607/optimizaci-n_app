import { ScrollView, Text, View } from 'react-native';

import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';

import { FilterChip } from './FilterChip';

interface CategoryPickerProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const categories = useCategories();
  const { colors, spacing, type } = useTheme();

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
      </ScrollView>
    </View>
  );
}
