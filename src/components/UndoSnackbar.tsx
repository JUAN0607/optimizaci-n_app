import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUndoStore } from '@/hooks/useUndoStore';
import { useTheme } from '@/theme/ThemeProvider';

const AUTO_DISMISS_MS = 4000;

export function UndoSnackbar() {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const message = useUndoStore((s) => s.message);
  const onUndo = useUndoStore((s) => s.onUndo);
  const hide = useUndoStore((s) => s.hide);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!message) return;
    timerRef.current = setTimeout(hide, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, hide]);

  if (!message) return null;

  return (
    <Pressable
      onPress={() => {
        onUndo?.();
        hide();
      }}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      style={[
        styles.container,
        shadow.floating,
        { bottom: insets.bottom + 88, backgroundColor: colors.primaryStrong, borderRadius: radius.md, padding: spacing.md },
      ]}
    >
      <Text style={[type.body, { color: colors.onPrimaryStrong, flex: 1 }]} numberOfLines={2}>
        {message}
      </Text>
      <Text style={[type.bodyMedium, { color: colors.accentGold }]}>Deshacer</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
