// Numeric TextFields only get a numeric *keyboard* hint from RN — it doesn't block
// pasted or hardware-keyboard text, so callers still need to sanitize onChangeText.
export function sanitizeNumericInput(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('')}`;
}
