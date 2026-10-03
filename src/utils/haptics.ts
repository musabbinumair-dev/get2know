export const triggerHaptic = (duration: number = 15): void => {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration errors on unsupported platforms/permissions
    }
  }
};
