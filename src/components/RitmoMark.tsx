import Svg, { Path } from 'react-native-svg';

import { brandMark } from '@/theme/colors';

/**
 * The RITMO ring mark: three rounded quarter-arcs (amber, gold, teal) with a gap where a
 * fourth would be. Path coordinates are precomputed for a 100x100 viewBox, center (50,50),
 * radius 36, stroke 16 — matches the generated app icon exactly (see scratchpad/logo).
 */
export function RitmoMark({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M 14.14 46.86 A 36 36 0 0 1 46.86 14.14" stroke={brandMark.amber} strokeWidth={16} strokeLinecap="round" fill="none" />
      <Path d="M 53.14 14.14 A 36 36 0 0 1 85.86 46.86" stroke={brandMark.gold} strokeWidth={16} strokeLinecap="round" fill="none" />
      <Path d="M 85.86 53.14 A 36 36 0 0 1 53.14 85.86" stroke={brandMark.teal} strokeWidth={16} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
