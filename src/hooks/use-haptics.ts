// Haptic feedback utility for iOS-like interactions
// Uses the Vibration API when available

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const hapticPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 30, 20],
  error: [30, 50, 30, 50, 30],
};

export function triggerHaptic(style: HapticStyle = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(hapticPatterns[style]);
    } catch {
      // Silently fail if vibration is not supported
    }
  }
}

export function useHaptics() {
  const trigger = (style: HapticStyle = 'light') => {
    triggerHaptic(style);
  };

  return {
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
    success: () => trigger('success'),
    warning: () => trigger('warning'),
    error: () => trigger('error'),
    trigger,
  };
}
