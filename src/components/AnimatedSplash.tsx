import { useEffect } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { RitmoMark } from '@/components/RitmoMark';
import { palette } from '@/theme/colors';

/**
 * Shown in place of the native splash screen while fonts/DB are still loading (see
 * src/app/_layout.tsx). The native splash is hidden as soon as this mounts, so the ring
 * keeps spinning through the entire wait instead of the screen going blank.
 */
export function AnimatedSplash() {
  const scheme = useColorScheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 300 });
    rotation.value = withRepeat(withTiming(360, { duration: 1200, easing: Easing.linear }), -1);
  }, [opacity, rotation, scale]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const bg = scheme === 'dark' ? palette.void.base : palette.ivory;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container, { backgroundColor: bg }]}>
      <Animated.View style={markStyle}>
        <RitmoMark size={96} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
