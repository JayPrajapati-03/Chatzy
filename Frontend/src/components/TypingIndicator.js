import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../utils/constants';
import { nd } from '../utils/platform';

/**
 * Premium animated typing indicator with pulsing dots and blurred background.
 */
const TypingIndicator = ({ typingUsers }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;
  const prevVisible = useRef(false);

  const isVisible = typingUsers && typingUsers.length > 0;

  useEffect(() => {
    if (isVisible && !prevVisible.current) {
      Animated.spring(entryAnim, { toValue: 1, tension: 70, friction: 9, useNativeDriver: nd }).start();
      prevVisible.current = true;
    } else if (!isVisible && prevVisible.current) {
      Animated.timing(entryAnim, { toValue: 0, duration: 200, useNativeDriver: nd }).start();
      prevVisible.current = false;
    }
  }, [isVisible]);

  useEffect(() => {
    const pulse = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: nd }),
          Animated.timing(dot, { toValue: 0, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: nd }),
          Animated.delay(400),
        ])
      ).start();

    pulse(dot1, 0);
    pulse(dot2, 160);
    pulse(dot3, 320);
  }, []);

  if (!isVisible) return null;

  const names = typingUsers.slice(0, 2).map((u) => u.username).join(', ');
  const label = typingUsers.length === 1
    ? `${names} is typing`
    : typingUsers.length === 2
    ? `${names} are typing`
    : 'Several people are typing';

  const mkDotStyle = (anim) => ({
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: entryAnim,
          transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        },
      ]}
    >
      {/* Dots */}
      <View style={styles.dotsRow}>
        {[mkDotStyle(dot1), mkDotStyle(dot2), mkDotStyle(dot3)].map((s, i) => (
          <Animated.View key={i} style={[styles.dot, s]} />
        ))}
      </View>
      <Text style={styles.label}>{label}…</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6,
    gap: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgFloat,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentCyan,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    fontWeight: FONTS.medium,
  },
});

export default memo(TypingIndicator);
