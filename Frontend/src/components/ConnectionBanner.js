import React, { memo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS } from '../utils/constants';

/**
 * Premium connection banner with animated gradient border.
 */
const ConnectionBanner = ({ status, onRetry }) => {
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const visible = status !== 'connected';

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -60, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const isConnecting = status === 'connecting';

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
        !visible && styles.hidden,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <LinearGradient
        colors={isConnecting
          ? ['rgba(245,158,11,0.18)', 'rgba(245,158,11,0.08)']
          : ['rgba(239,68,68,0.22)', 'rgba(239,68,68,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.inner}
      >
        {/* Status dot */}
        <View style={[styles.dot, { backgroundColor: isConnecting ? COLORS.accentAmber : COLORS.accentRed }]} />
        <Text style={[styles.text, { color: isConnecting ? COLORS.accentAmber : '#FCA5A5' }]}>
          {isConnecting ? 'Reconnecting to server…' : 'Connection lost · messages may not send'}
        </Text>
        {!isConnecting && (
          <TouchableOpacity onPress={onRetry} style={styles.retryBtn} activeOpacity={0.75}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  hidden: { position: 'absolute', top: -999 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: FONTS.medium,
    letterSpacing: 0.3,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  retryText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: FONTS.bold,
  },
});

export default memo(ConnectionBanner);
