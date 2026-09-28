import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalsList } from '@/components/GoalsList';
import { UndoSnackbar } from '@/components/UndoSnackbar';
import { useTheme } from '@/theme/ThemeProvider';

export default function GoalsScreen() {
  const { colors, spacing, type } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Cerrar" hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.h3, { color: colors.textPrimary }]}>Metas</Text>
        <Pressable onPress={() => router.push('/create/goal')} accessibilityLabel="Nueva meta" hitSlop={8}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <GoalsList />
      </ScrollView>
      <UndoSnackbar />
    </SafeAreaView>
  );
}
