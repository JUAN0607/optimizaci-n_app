export const fontFamily = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semiBold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;

export const typeScale = {
  display: { fontFamily: fontFamily.bold, fontSize: 34, lineHeight: 40 },
  h1: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fontFamily.semiBold, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 24 },
  bodyLarge: { fontFamily: fontFamily.regular, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 21 },
  bodySmall: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: fontFamily.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
} as const;

export type TypeScaleKey = keyof typeof typeScale;
