import React, { memo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, FONTS } from '../utils/constants';
import { nd } from '../utils/platform';
import { formatTime } from '../utils/formatTime';

// ── Tick Icons ────────────────────────────────────────────────────────────────
const StatusTick = ({ status }) => {
  if (status === 'read')
    return <Text style={[styles.tick, styles.tickRead]}>✓✓</Text>;
  if (status === 'delivered')
    return <Text style={[styles.tick, styles.tickDelivered]}>✓✓</Text>;
  return <Text style={styles.tick}>✓</Text>;
};

// ── Avatar Circle ─────────────────────────────────────────────────────────────
const Avatar = ({ name, color }) => {
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <View style={[styles.avatar, { backgroundColor: color || COLORS.accentCyan }]}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
};

// ── Message Bubble ─────────────────────────────────────────────────────────────
const MessageBubble = ({ message, isMine }) => {
  const {
    text,
    senderDisplayName,
    senderUsername,
    senderAvatarColor,
    createdAt,
    status,
  } = message;

  const displayName = senderDisplayName || senderUsername || 'User';
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue: 1,
      tension: 80,
      friction: 9,
      useNativeDriver: nd,
    }).start();
  }, []);

  const translateX = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isMine ? 30 : -30, 0],
  });

  return (
    <Animated.View
      style={[
        styles.row,
        isMine ? styles.rowMine : styles.rowOther,
        { opacity: entryAnim, transform: [{ translateX }] },
      ]}
    >
      {/* Other's avatar */}
      {!isMine && (
        <Avatar name={displayName} color={senderAvatarColor} />
      )}

      <View style={styles.bubbleWrap}>
        {/* Sender name */}
        {!isMine && (
          <Text style={[styles.senderName, { color: senderAvatarColor || COLORS.accentCyan }]}>
            {displayName}
          </Text>
        )}

        {/* Bubble */}
        {isMine ? (
          <LinearGradient
            colors={['#0D3B5E', '#082C48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleMine]}
          >
            <Text style={styles.text}>{text}</Text>
            <View style={styles.meta}>
              <Text style={styles.timestamp}>{formatTime(createdAt)}</Text>
              <StatusTick status={status} />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleOther]}>
            <Text style={styles.text}>{text}</Text>
            <View style={styles.meta}>
              <Text style={styles.timestamp}>{formatTime(createdAt)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Spacer for mine alignment */}
      {isMine && <View style={styles.avatarSpacer} />}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 3,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  avatarSpacer: { width: 40 },

  bubbleWrap: { maxWidth: '75%' },
  senderName: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    marginBottom: 4,
    paddingLeft: 4,
    letterSpacing: 0.4,
  },

  bubble: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 7,
    borderRadius: RADIUS.lg,
  },
  bubbleMine: {
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.12)',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0, 212, 255, 0.15)' },
      default: {
        shadowColor: '#00D4FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  bubbleOther: {
    backgroundColor: COLORS.bgFloat,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },

  text: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontWeight: FONTS.regular,
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
    gap: 5,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONTS.medium,
  },
  tick: {
    fontSize: 11,
    color: '#8696A0',
    fontWeight: FONTS.bold,
    letterSpacing: -1.5,
    marginLeft: 3,
  },
  tickDelivered: { color: '#8696A0' },
  tickRead: { color: '#53BDEB' },
});

export default memo(MessageBubble);
