import { BlurView, type BlurTint } from 'expo-blur';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type GlassVariant = 'thin' | 'regular' | 'thick';

const VARIANT_TINT: Record<GlassVariant, { light: BlurTint; dark: BlurTint }> = {
  thin: { light: 'systemThinMaterialLight', dark: 'systemThinMaterialDark' },
  regular: { light: 'systemMaterialLight', dark: 'systemMaterialDark' },
  thick: { light: 'systemThickMaterialLight', dark: 'systemThickMaterialDark' },
};

interface GlassSurfaceProps extends PropsWithChildren {
  variant?: GlassVariant;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  /** Adds the thin light "edge" highlight liquid-glass surfaces catch, e.g. on a top edge. */
  edge?: boolean;
}

/**
 * A real native blur (UIKit material on iOS, best-effort on Android/web) standing in for
 * Apple's "liquid glass" chrome — floating tab bar, sheet headers, picker cards. Reserved
 * for that kind of floating UI chrome, not regular content cards, matching how Apple
 * itself scopes the material.
 */
export function GlassSurface({ variant = 'regular', intensity = 80, style, edge, children }: GlassSurfaceProps) {
  const { scheme } = useTheme();
  const tint = VARIANT_TINT[variant][scheme];

  return (
    <BlurView intensity={intensity} tint={tint} style={style}>
      {edge && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.edge,
            { borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.6)' },
          ]}
        />
      )}
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  edge: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: 'transparent' },
});
