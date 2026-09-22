import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, type BottomSheetBackdropProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCreateSheetStore } from '@/hooks/useCreateSheetStore';
import { useTheme } from '@/theme/ThemeProvider';

const OPTIONS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { key: 'task', label: 'Nueva tarea', icon: 'checkbox-outline', route: '/create/task' },
  { key: 'event', label: 'Nuevo evento', icon: 'calendar-outline', route: '/create/event' },
  { key: 'habit', label: 'Nuevo hábito', icon: 'repeat-outline', route: '/create/habit' },
  { key: 'routine', label: 'Nueva rutina', icon: 'list-outline', route: '/create/routine' },
  { key: 'reminder', label: 'Recordatorio', icon: 'notifications-outline', route: '/create/reminder' },
];

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />;
}

export function CreateActionSheet() {
  const sheetRef = useRef<BottomSheet>(null);
  const { isOpen, close } = useCreateSheetStore();
  const { colors, spacing, radius, type } = useTheme();

  useEffect(() => {
    if (isOpen) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [isOpen]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['42%']}
      enablePanDownToClose
      backdropComponent={Backdrop}
      onClose={close}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={[styles.content, { padding: spacing.xl }]}>
        <Text style={[type.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>Crear</Text>
        {OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => {
              close();
              router.push(option.route as never);
            }}
            style={[styles.row, { borderRadius: radius.md }]}
            accessibilityRole="button"
            accessibilityLabel={option.label}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
              <Ionicons name={option.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[type.bodyLarge, { color: colors.textPrimary }]}>{option.label}</Text>
          </Pressable>
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
