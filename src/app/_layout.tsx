import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { CreateActionSheet } from '@/components/CreateActionSheet';
import { UndoSnackbar } from '@/components/UndoSnackbar';
import { initDatabase } from '@/db';
import { getSettings } from '@/db/repositories/settingsRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
  const setHydrated = useAppStore((s) => s.setHydrated);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    initDatabase();
    const settings = getSettings();
    setThemeMode(settings.themeMode);
    setOnboardingCompleted(settings.onboardingCompleted);
    setHydrated(true);
  }, [setThemeMode, setOnboardingCompleted, setHydrated]);

  const ready = hydrated;
  const appOpacity = useSharedValue(0);

  useEffect(() => {
    // Our own animated splash is already covering the screen by this point, so the native
    // one can come down immediately instead of staying frozen until data finishes loading.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (ready) appOpacity.value = withTiming(1, { duration: 250 });
  }, [ready, appOpacity]);

  const appStyle = useAnimatedStyle(() => ({ opacity: appOpacity.value }));

  if (!ready) return <AnimatedSplash />;

  return (
    <Animated.View style={[{ flex: 1 }, appStyle]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
                <Stack.Screen name="goals" options={{ presentation: 'modal' }} />
                <Stack.Screen name="activity/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="habit/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="habit/stats/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="routine/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="search" options={{ presentation: 'modal' }} />
                <Stack.Screen name="create/task" options={{ presentation: 'modal' }} />
                <Stack.Screen name="create/event" options={{ presentation: 'modal' }} />
                <Stack.Screen name="create/habit" options={{ presentation: 'modal' }} />
                <Stack.Screen name="create/routine" options={{ presentation: 'modal' }} />
                <Stack.Screen name="create/reminder" options={{ presentation: 'modal' }} />
                <Stack.Screen name="create/category" options={{ presentation: 'modal' }} />
                <Stack.Screen name="create/goal" options={{ presentation: 'modal' }} />
              </Stack>
              <CreateActionSheet />
              <UndoSnackbar />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Animated.View>
  );
}
