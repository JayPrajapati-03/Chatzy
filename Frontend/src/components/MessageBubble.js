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
const Avatar = ({ name, color, isOnline }) => {
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <View style={styles.avatarWrap}>
      <View style={[styles.avatar, { backgroundColor: color || COLORS.accentGreen }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: isOnline ? COLORS.accentGreen : COLORS.textMuted }
        ]}
      />
    </View>
  );
};

// ── Reaction Badge ────────────────────────────────────────────────────────────
const ReactionBadge = ({ reaction }) => {
  if (!reaction) return null;
  return (
    <View style={styles.reactionBadge}>
      <Text style={styles.reactionText}>{reaction}</Text>
    </View>
  );
};

// ── Message Bubble ─────────────────────────────────────────────────────────────
const MessageBubble = ({ message, isMine, isSenderOnline = false }) => {
  const {
    text,
    senderDisplayName,
    senderUsername,
    senderAvatarColor,
    createdAt,
    status,
    reaction,
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
        <Avatar
          name={displayName}
          color={senderAvatarColor}
          isOnline={isSenderOnline}
        />
      )}

      <View style={[styles.bubbleWrap, isMine && styles.bubbleWrapMine]}>
        {/* Sender header with name + role */}
        {!isMine && (
          <View style={styles.senderHeader}>
            <Text style={[styles.senderName, { color: senderAvatarColor || COLORS.accentGreen }]}>
              {displayName}
            </Text>
            <Text style={styles.senderRole}>• Member</Text>
          </View>
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
            <View style={[styles.meta, styles.metaRight]}>
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

        {/* Reaction badge */}
        <ReactionBadge reaction={reaction} />
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
    alignItems: 'flex-start',
  },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },

  avatarWrap: {
    position: 'relative',
    marginRight: 8,
    marginTop: 18,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
    borderColor: COLORS.bgBase,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  avatarSpacer: { width: 44 },

  bubbleWrap: { maxWidth: '75%' },
  bubbleWrapMine: { alignItems: 'flex-end' },

  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    paddingLeft: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    letterSpacing: 0.3,
  },
  senderRole: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: FONTS.medium,
  },

  bubble: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 7,
    borderRadius: 18,
  },
  bubbleMine: {
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,210,255,0.3)',
    ...Platform.select({
      web: { boxShadow: '0 4px 15px rgba(0, 180, 240, 0.2)' },
      default: {
        shadowColor: '#00D4FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 4,
      },
    }),
  },
  bubbleOther: {
    backgroundColor: '#151b2a',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    ...Platform.select({
      web: { boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },

  text: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 20,
    fontWeight: FONTS.regular,
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  metaRight: {
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
    color: '#70809b',
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

  // ── Reaction Badge ──
  reactionBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b2438',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginTop: 4,
  },
  reactionText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: FONTS.semibold,
  },
});

export default memo(MessageBubble);

