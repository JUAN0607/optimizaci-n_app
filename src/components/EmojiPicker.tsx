import { Pressable, ScrollView, Text, View } from 'react-native';

import { EMOJI_GROUPS } from '@/constants/emojis';
import { useTheme } from '@/theme/ThemeProvider';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const { colors, radius, spacing, type } = useTheme();

  return (
    <ScrollView style={{ maxHeight: 220 }} contentContainerStyle={{ gap: spacing.md }}>
      {EMOJI_GROUPS.map((group) => (
        <View key={group.label} style={{ gap: spacing.xs }}>
          <Text style={[type.caption, { color: colors.textTertiary }]}>{group.label.toUpperCase()}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {group.emojis.map((emoji) => {
              const selected = emoji === value;
              return (
                <Pressable
                  key={emoji}
                  onPress={() => onChange(emoji)}
                  accessibilityLabel={`Emoji ${emoji}`}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radius.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selected ? colors.primary : colors.surfaceAlt,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{emoji}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
