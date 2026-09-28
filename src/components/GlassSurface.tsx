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

const RADIUS_KEYS = [
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
] as const;

interface GlassSurfaceProps extends PropsWithChildren {
  variant?: GlassVariant;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  /** Adds the thin light "edge" highlight liquid-glass surfaces catch, e.g. on a top edge. */
  edge?: boolean;
  /** Floating drop shadow, on by default — liquid glass reads as a physical layer above content. */
  shadow?: boolean;
}

/**
 * A real native blur (UIKit material on iOS, best-effort on Android/web) standing in for
 * Apple's "liquid glass" chrome — floating tab bar, sheet headers, picker cards. Reserved
 * for that kind of floating UI chrome, not regular content cards, matching how Apple
 * itself scopes the material.
 *
 * A neutral scrim sits between the blur and its content so the material always reads as
 * plain frosted white/dark glass — never tinted by whatever color happens to be behind it.
 *
 * The blur+clip lives in an inner absolute-fill layer, separate from the outer view that
 * carries layout/position and the drop shadow — a view can't clip its own shadow, so the
 * two can't be the same node when a caller also wants rounded, clipped corners.
 */
export function GlassSurface({ variant = 'regular', intensity = 100, style, edge, shadow = true, children }: GlassSurfaceProps) {
  const { scheme, shadow: themeShadow } = useTheme();
  const tint = VARIANT_TINT[variant][scheme];
  const scrimColor = scheme === 'dark' ? 'rgba(8,6,5,0.42)' : 'rgba(255,255,255,0.55)';

  const flat: ViewStyle = { ...(StyleSheet.flatten(style) ?? {}) };
  delete flat.overflow;
  const radiusStyle: ViewStyle = {};
  for (const key of RADIUS_KEYS) {
    if (flat[key] != null) radiusStyle[key] = flat[key];
  }

  return (
    <View style={[flat, shadow && themeShadow.floating]}>
      <View style={[StyleSheet.absoluteFill, radiusStyle, styles.clip]}>
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: scrimColor }]} />
        {edge && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.edge,
              { borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.75)' },
            ]}
          />
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  edge: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: 'transparent' },
});
