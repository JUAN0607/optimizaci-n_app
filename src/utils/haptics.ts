import * as Haptics from 'expo-haptics';

// Centralizes the "success" feedback moment (spec: subtle celebration on completion)
// so every completion point in the app feels consistent.
export function hapticComplete() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
