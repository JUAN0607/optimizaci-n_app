import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';

import { isIoniconsName } from '@/constants/emojis';

interface IconEmojiProps {
  icon: string;
  size?: number;
  color?: string;
}

/**
 * Renders a habit/routine/category `icon` field. Old data stored Ionicons glyph names
 * (e.g. "flower-outline"); new data stores an emoji character. Both render correctly
 * from the same field without a migration.
 */
export function IconEmoji({ icon, size = 20, color }: IconEmojiProps) {
  if (isIoniconsName(icon)) {
    return <Ionicons name={icon as never} size={size} color={color} />;
  }
  return <Text style={{ fontSize: size, lineHeight: size * 1.2 }}>{icon}</Text>;
}
