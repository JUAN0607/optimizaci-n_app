import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { CreateActionSheet } from '@/components/CreateActionSheet';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
  const [initError, setInitError] = useState<Error | null>(null);
  if (initError) throw initError; // caught by <ErrorBoundary> below instead of failing silently

  useEffect(() => {
    // A thrown migration/query here must never leave the app stuck on the splash forever —
    // surface it through the error boundary instead by re-throwing on the next render.
    try {
      initDatabase();
      const settings = getSettings();
      setThemeMode(settings.themeMode);
      setOnboardingCompleted(settings.onboardingCompleted);
    } catch (error) {
      console.error('Failed to initialize RITMO:', error);
      // Deliberate one-time error capture so a thrown migration/query surfaces via
      // <ErrorBoundary> instead of a silent gray screen — not state derived from props/state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setHydrated(true);
    }
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

  if (!ready) {
    return (
      <ErrorBoundary>
        <AnimatedSplash />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
