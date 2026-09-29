/**
 * Cross-platform utilities and animation flags.
 * Web environment lacks the native animated driver module,
 * so useNativeDriver must be false on web to avoid warnings/errors.
 */
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Cross-platform useNativeDriver flag (false on web, true on native)
export const nd = Platform.OS !== 'web';
export const useNativeDriver = Platform.OS !== 'web';

/**
 * Returns clean web/native compatible shadow styles to prevent
 * "shadow* style props are deprecated. Use boxShadow" warnings on React Native Web.
 */
export const createGlow = (color, radius = 12, opacity = 0.25) => {
  return Platform.select({
    web: {
      boxShadow: `0 0 ${radius}px ${color}`,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation: Math.min(Math.round(radius * 0.75), 16),
    },
  });
};
