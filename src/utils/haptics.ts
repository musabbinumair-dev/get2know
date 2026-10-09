/**
 * Haptic feedback utility
 * Respected everywhere based on user's haptics setting in localStorage / profile
 */

export function isHapticsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const setting = localStorage.getItem('gty_haptics_enabled');
    if (setting !== null) {
      return setting === 'true';
    }
  } catch {}
  return true;
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gty_haptics_enabled', enabled ? 'true' : 'false');
  }
}

export const triggerHaptic = (duration: number = 15): void => {
  if (!isHapticsEnabled()) return;
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration errors on unsupported platforms/permissions
    }
  }
};
