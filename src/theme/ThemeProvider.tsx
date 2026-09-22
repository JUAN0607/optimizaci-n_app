import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { useAppStore } from '@/hooks/useAppStore';

import { darkColors, lightColors, type ThemeColors } from './colors';
import { radius, shadow, spacing } from './spacing';
import { typeScale } from './typography';

interface ThemeContextValue {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  type: typeof typeScale;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const themeMode = useAppStore((state) => state.themeMode);

  const scheme: 'light' | 'dark' =
    themeMode === 'SYSTEM' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode === 'DARK' ? 'dark' : 'light';

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      spacing,
      radius,
      shadow,
      type: typeScale,
    }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
