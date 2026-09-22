import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateSheetStore } from '@/hooks/useCreateSheetStore';
import { useTheme } from '@/theme/ThemeProvider';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'sunny', inactive: 'sunny-outline' },
  plan: { active: 'calendar', inactive: 'calendar-outline' },
  habitos: { active: 'checkmark-done', inactive: 'checkmark-done-outline' },
  progreso: { active: 'bar-chart', inactive: 'bar-chart-outline' },
};

export function BottomNavigation({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, spacing, type, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const openCreateSheet = useCreateSheetStore((s) => s.open);

  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  type RouteItem = (typeof state.routes)[number];

  const renderTab = (route: RouteItem) => {
    const { options } = descriptors[route.key];
    const routeIndex = state.routes.findIndex((r: RouteItem) => r.key === route.key);
    const isFocused = state.index === routeIndex;
    const icons = ICONS[route.name] ?? ICONS.index;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={String(options.title ?? route.name)}
        style={styles.tab}
      >
        <Ionicons
          name={isFocused ? icons.active : icons.inactive}
          size={24}
          color={isFocused ? colors.primary : colors.textTertiary}
        />
        <Text style={[type.caption, { color: isFocused ? colors.primary : colors.textTertiary, marginTop: 2 }]}>
          {String(options.title ?? route.name)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      <View style={styles.row}>{leftRoutes.map(renderTab)}</View>

      <Pressable
        onPress={openCreateSheet}
        accessibilityRole="button"
        accessibilityLabel="Crear nuevo"
        style={[styles.fab, shadow.floating, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>

      <View style={styles.row}>{rightRoutes.map(renderTab)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 56,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginTop: -20,
  },
});
