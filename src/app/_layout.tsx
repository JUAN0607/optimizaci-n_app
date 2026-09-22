import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CreateActionSheet } from '@/components/CreateActionSheet';
import { initDatabase } from '@/db';
import { getSettings } from '@/db/repositories/settingsRepository';
import { useAppStore } from '@/hooks/useAppStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
  const setHydrated = useAppStore((s) => s.setHydrated);
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  useEffect(() => {
    initDatabase();
    const settings = getSettings();
    setThemeMode(settings.themeMode);
    setOnboardingCompleted(settings.onboardingCompleted);
    setHydrated(true);
  }, [setThemeMode, setOnboardingCompleted, setHydrated]);

  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <Stack
              screenOptions={{ headerShown: false }}
              initialRouteName={onboardingCompleted ? '(tabs)' : 'onboarding'}
            >
              <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
              <Stack.Screen name="activity/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="habit/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="create/task" options={{ presentation: 'modal' }} />
              <Stack.Screen name="create/event" options={{ presentation: 'modal' }} />
              <Stack.Screen name="create/habit" options={{ presentation: 'modal' }} />
              <Stack.Screen name="create/routine" options={{ presentation: 'modal' }} />
              <Stack.Screen name="create/reminder" options={{ presentation: 'modal' }} />
            </Stack>
            <CreateActionSheet />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
