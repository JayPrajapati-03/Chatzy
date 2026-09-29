import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * TypingIndicator — animated "... is typing" bar.
 * Renders a WhatsApp-style three-dot bouncing animation.
 * Only shown when `typingUsers` array is non-empty.
 *
 * @param {{ typingUsers: Array<{username: string}> }} props
 */
const TypingIndicator = ({ typingUsers }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const animRef = useRef(null);

  useEffect(() => {
    if (typingUsers.length === 0) return;

    const bounce = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 200, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.delay(400)
        ])
      );

    animRef.current = Animated.parallel([
      bounce(dot1, 0),
      bounce(dot2, 150),
      bounce(dot3, 300)
    ]);
    animRef.current.start();

    return () => {
      animRef.current?.stop();
      [dot1, dot2, dot3].forEach((d) => d.setValue(0));
    };
  }, [typingUsers.length]);

  if (typingUsers.length === 0) return null;

  const names =
    typingUsers.length === 1
      ? typingUsers[0].username
      : typingUsers.length === 2
      ? `${typingUsers[0].username} & ${typingUsers[1].username}`
      : 'Several people';

  const label = `${names} ${typingUsers.length === 1 ? 'is' : 'are'} typing`;

  return (
    <View style={styles.container}>
      {/* Animated dots bubble */}
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8
  },
  bubble: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: COLORS.bubbleOther,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center'
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.textSecondary
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    flexShrink: 1
  }
});

export default memo(TypingIndicator);
