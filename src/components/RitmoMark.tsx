import Svg, { Path } from 'react-native-svg';
import { useColorScheme } from 'react-native';

import { useOptionalTheme } from '@/theme/ThemeProvider';

interface RitmoMarkProps {
  size?: number;
  /** Overrides the theme-based fill (defaults to black in light mode, white in dark mode). */
  color?: string;
}

/**
 * The RITMO mark: a circle split into 4 pinwheel petals by thin gaps, with a small round
 * gap at the center. Monochrome by design — it takes its color from the current theme
 * (black on light, white on dark) unless a fixed `color` is passed, e.g. for the native
 * icon/splash context where it's always white on black.
 * Path coordinates are precomputed for a 100x100 viewBox, center (50,50), outer radius 36,
 * inner radius 5.5, 8° gaps — matches the generated app icon exactly (see scratchpad/logo2).
 *
 * Uses the optional theme hook, not useTheme(), because this also renders in the
 * pre-hydration AnimatedSplash, before ThemeProvider exists — it falls back to the OS
 * color scheme there, matching how AnimatedSplash itself picks its background at that point.
 */
export function RitmoMark({ size = 48, color }: RitmoMarkProps) {
  const theme = useOptionalTheme();
  const systemScheme = useColorScheme();
  const scheme = theme?.scheme ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const fill = color ?? (scheme === 'dark' ? '#FFFFFF' : '#000000');

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M 54.15 46.39 L 77.17 26.38 A 36 36 0 0 1 77.17 73.62 L 54.15 53.61 A 5.5 5.5 0 0 0 54.15 46.39 Z"
        fill={fill}
      />
      <Path
        d="M 53.61 54.15 L 73.62 77.17 A 36 36 0 0 1 26.38 77.17 L 46.39 54.15 A 5.5 5.5 0 0 0 53.61 54.15 Z"
        fill={fill}
      />
      <Path
        d="M 45.85 53.61 L 22.83 73.62 A 36 36 0 0 1 22.83 26.38 L 45.85 46.39 A 5.5 5.5 0 0 0 45.85 53.61 Z"
        fill={fill}
      />
      <Path
        d="M 46.39 45.85 L 26.38 22.83 A 36 36 0 0 1 73.62 22.83 L 53.61 45.85 A 5.5 5.5 0 0 0 46.39 45.85 Z"
        fill={fill}
      />
    </Svg>
  );
}
