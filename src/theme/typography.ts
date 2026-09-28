// 'System' resolves to San Francisco (SF Pro) automatically on iOS — the same typeface
// every native app uses — via the OS itself, with no font files to bundle or license.
export const fontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
} as const;

const weight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

export const typeScale = {
  display: { fontFamily: fontFamily.bold, fontWeight: weight.bold, fontSize: 34, lineHeight: 40 },
  h1: { fontFamily: fontFamily.bold, fontWeight: weight.bold, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fontFamily.semiBold, fontWeight: weight.semiBold, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fontFamily.semiBold, fontWeight: weight.semiBold, fontSize: 18, lineHeight: 24 },
  bodyLarge: { fontFamily: fontFamily.regular, fontWeight: weight.regular, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamily.regular, fontWeight: weight.regular, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: fontFamily.medium, fontWeight: weight.medium, fontSize: 15, lineHeight: 21 },
  bodySmall: { fontFamily: fontFamily.regular, fontWeight: weight.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamily.medium, fontWeight: weight.medium, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: fontFamily.semiBold, fontWeight: weight.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
} as const;

export type TypeScaleKey = keyof typeof typeScale;
