import { StyleSheet, Text, View } from 'react-native';

import { isIoniconsName } from '@/constants/emojis';
import { useTheme } from '@/theme/ThemeProvider';
import type { Category } from '@/types/entities';

interface CategoryBadgeProps {
  category: Category | null;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const { colors, radius, spacing, type } = useTheme();
  if (!category) return null;

  const showEmoji = !isIoniconsName(category.icon);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${category.color}1F`,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
        },
      ]}
    >
      {showEmoji ? <Text style={{ fontSize: 11 }}>{category.icon}</Text> : <View style={[styles.dot, { backgroundColor: category.color }]} />}
      <Text style={[type.caption, { color: colors.textSecondary }]} numberOfLines={1}>
        {category.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
