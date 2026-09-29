import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { formatTime } from '../utils/formatTime';

/**
 * Tick icons for message delivery/read status.
 * Single grey tick = sent, double grey = delivered, double blue = read.
 */
const StatusTicks = ({ status }) => {
  if (status === 'read') {
    return <Text style={[styles.ticks, styles.ticksRead]}>✓✓</Text>;
  }
  if (status === 'delivered') {
    return <Text style={styles.ticks}>✓✓</Text>;
  }
  // sent
  return <Text style={styles.ticks}>✓</Text>;
};

/**
 * MessageBubble — renders a single chat message.
 * Own messages are right-aligned with a green bubble.
 * Others' messages are left-aligned with a dark bubble and show the sender name.
 *
 * @param {{ message: object, isMine: boolean }} props
 */
const MessageBubble = ({ message, isMine }) => {
  const {
    text,
    senderDisplayName,
    senderUsername,
    senderAvatarColor,
    createdAt,
    status
  } = message;

  const displayName = senderDisplayName || senderUsername || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther]}>
      {/* Avatar — only shown for other users */}
      {!isMine && (
        <View style={[styles.avatar, { backgroundColor: senderAvatarColor || COLORS.accentGreen }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}

      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        {/* Sender name — only shown for others */}
        {!isMine && (
          <Text style={[styles.senderName, { color: senderAvatarColor || COLORS.accentGreenLight }]}>
            {displayName}
          </Text>
        )}

        <Text style={styles.text}>{text}</Text>

        {/* Timestamp + read ticks */}
        <View style={styles.meta}>
          <Text style={styles.timestamp}>{formatTime(createdAt)}</Text>
          {isMine && <StatusTicks status={status} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 10,
    alignItems: 'flex-end'
  },
  rowMine: {
    justifyContent: 'flex-end'
  },
  rowOther: {
    justifyContent: 'flex-start'
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    flexShrink: 0
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2
  },
  bubbleMine: {
    backgroundColor: COLORS.bubbleMine,
    borderBottomRightRadius: 3
  },
  bubbleOther: {
    backgroundColor: COLORS.bubbleOther,
    borderBottomLeftRadius: 3
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3
  },
  text: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 21
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textTimestamp
  },
  ticks: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700'
  },
  ticksRead: {
    color: COLORS.accentBlue
  }
});

export default memo(MessageBubble);
