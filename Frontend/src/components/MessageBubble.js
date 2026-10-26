import React, { memo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS } from '../utils/constants';
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

// ── Quick Reaction Bar (floating) ─────────────────────────────────────────────
const QUICK_EMOJIS = ['❤️', '👍', '🔥', '😂', '😮', '🚀'];

const FloatingActionBar = ({ isMine, onSelectEmoji, onReply, onClose }) => {
  return (
    <View style={[styles.floatingBar, isMine ? styles.floatingBarMine : styles.floatingBarOther]}>
      {QUICK_EMOJIS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          style={styles.emojiTouch}
          onPress={() => {
            onSelectEmoji(emoji);
            onClose();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.floatingEmojiText}>{emoji}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.floatingBarDivider} />
      <TouchableOpacity
        style={styles.replyTouch}
        onPress={() => {
          onReply();
          onClose();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.replyActionText}>↩ Reply</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Quoted Reply Preview ──────────────────────────────────────────────────────
const ReplyQuote = ({ replyTo, isMine }) => {
  if (!replyTo) return null;
  return (
    <View style={[styles.quoteBox, isMine ? styles.quoteBoxMine : styles.quoteBoxOther]}>
      <View style={styles.quoteAccentLine} />
      <View style={styles.quoteContent}>
        <Text style={styles.quoteUser}>@{replyTo.senderUsername || 'User'}</Text>
        <Text style={styles.quoteText} numberOfLines={2}>
          {replyTo.text}
        </Text>
      </View>
    </View>
  );
};

// ── Live Interactive Poll Component ───────────────────────────────────────────
const PollCard = ({ poll, messageId, currentUserId, onVotePoll, isMine }) => {
  if (!poll || !poll.options) return null;

  const totalVotes = poll.totalVotes || 0;

  return (
    <View style={styles.pollContainer}>
      <View style={styles.pollHeader}>
        <Text style={styles.pollBadge}>📊 LIVE POLL</Text>
        <Text style={styles.pollTotalVotes}>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </Text>
      </View>

      <Text style={styles.pollQuestion}>{poll.question}</Text>

      <View style={styles.pollOptionsWrap}>
        {poll.options.map((option) => {
          const voteCount = option.votes ? option.votes.length : 0;
          const percentage =
            totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const hasVotedThis =
            currentUserId &&
            option.votes &&
            option.votes.some(
              (v) => String(v) === String(currentUserId) || v._id === currentUserId
            );

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.pollOptionBtn,
                hasVotedThis && styles.pollOptionBtnSelected,
              ]}
              onPress={() => onVotePoll && onVotePoll(messageId, option.id)}
              activeOpacity={0.75}
            >
              {/* Background progress fill */}
              <View
                style={[
                  styles.pollProgressFill,
                  { width: `${percentage}%` },
                  hasVotedThis && styles.pollProgressFillSelected,
                ]}
              />

              {/* Option content */}
              <View style={styles.pollOptionContent}>
                <View style={styles.pollRadioAndText}>
                  <View
                    style={[
                      styles.pollRadio,
                      hasVotedThis && styles.pollRadioActive,
                    ]}
                  >
                    {hasVotedThis && <View style={styles.pollRadioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.pollOptionText,
                      hasVotedThis && styles.pollOptionTextSelected,
                    ]}
                  >
                    {option.text}
                  </Text>
                </View>

                <Text style={styles.pollPercentText}>{percentage}%</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.pollHelpText}>Tap an option to vote or change vote</Text>
    </View>
  );
};

// ── Reactions Cluster ─────────────────────────────────────────────────────────
const ReactionsCluster = ({ reactions, currentUserId, onToggleReaction, messageId }) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <View style={styles.reactionsRow}>
      {reactions.map((r) => {
        const hasReacted =
          currentUserId &&
          r.users &&
          r.users.some(
            (u) => String(u) === String(currentUserId) || u._id === currentUserId
          );

        return (
          <TouchableOpacity
            key={r.emoji}
            style={[
              styles.reactionChip,
              hasReacted && styles.reactionChipActive,
            ]}
            onPress={() => onToggleReaction && onToggleReaction(messageId, r.emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{r.emoji}</Text>
            <Text style={[styles.reactionCount, hasReacted && styles.reactionCountActive]}>
              {r.count}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ── Main Message Bubble ───────────────────────────────────────────────────────
const MessageBubble = ({
  message,
  isMine,
  isSenderOnline = false,
  currentUserId,
  onReply,
  onReaction,
  onVotePoll,
}) => {
  const {
    _id,
    text,
    type,
    poll,
    replyTo,
    reactions,
    senderDisplayName,
    senderUsername,
    senderAvatarColor,
    createdAt,
    status,
  } = message;

  const displayName = senderDisplayName || senderUsername || 'User';
  const entryAnim = useRef(new Animated.Value(0)).current;
  const [showActionBar, setShowActionBar] = useState(false);

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

  const handleLongPress = () => {
    setShowActionBar((prev) => !prev);
  };

  const isPoll = type === 'poll' && poll;

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

        {/* Floating Quick Action Bar */}
        {showActionBar && (
          <FloatingActionBar
            isMine={isMine}
            onSelectEmoji={(emoji) => onReaction && onReaction(_id, emoji)}
            onReply={() => onReply && onReply(message)}
            onClose={() => setShowActionBar(false)}
          />
        )}

        {/* Bubble container with long-press */}
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={280}
          style={({ pressed }) => [
            pressed && styles.bubblePressed,
            { width: '100%' },
          ]}
        >
          {isMine ? (
            <LinearGradient
              colors={['#0D3B5E', '#082C48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.bubbleMine, isPoll && styles.pollBubble]}
            >
              {/* Quoted reply if exists */}
              <ReplyQuote replyTo={replyTo} isMine={true} />

              {/* Message Content */}
              {isPoll ? (
                <PollCard
                  poll={poll}
                  messageId={_id}
                  currentUserId={currentUserId}
                  onVotePoll={onVotePoll}
                  isMine={true}
                />
              ) : (
                <Text style={styles.text}>{text}</Text>
              )}

              <View style={[styles.meta, styles.metaRight]}>
                <Text style={styles.timestamp}>{formatTime(createdAt)}</Text>
                <StatusTick status={status} />
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.bubbleOther, isPoll && styles.pollBubble]}>
              {/* Quoted reply if exists */}
              <ReplyQuote replyTo={replyTo} isMine={false} />

              {/* Message Content */}
              {isPoll ? (
                <PollCard
                  poll={poll}
                  messageId={_id}
                  currentUserId={currentUserId}
                  onVotePoll={onVotePoll}
                  isMine={false}
                />
              ) : (
                <Text style={styles.text}>{text}</Text>
              )}

              <View style={styles.meta}>
                <Text style={styles.timestamp}>{formatTime(createdAt)}</Text>
              </View>
            </View>
          )}
        </Pressable>

        {/* Reactions List */}
        <ReactionsCluster
          reactions={reactions}
          currentUserId={currentUserId}
          onToggleReaction={onReaction}
          messageId={_id}
        />
      </View>

      {/* Spacer for mine alignment */}
      {isMine && <View style={styles.avatarSpacer} />}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    position: 'relative',
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

  bubbleWrap: { maxWidth: '78%', position: 'relative' },
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
  bubblePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
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
  pollBubble: {
    minWidth: 260,
    maxWidth: 320,
    paddingBottom: 10,
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

  // ── Quoted Reply Preview ──
  quoteBox: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  quoteBoxMine: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  quoteBoxOther: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  quoteAccentLine: {
    width: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accentCyan,
    marginRight: 8,
  },
  quoteContent: {
    flex: 1,
  },
  quoteUser: {
    fontSize: 11,
    color: COLORS.accentCyan,
    fontWeight: FONTS.bold,
    marginBottom: 2,
  },
  quoteText: {
    fontSize: 12,
    color: '#A0AEC0',
    lineHeight: 16,
  },

  // ── Floating Action Bar ──
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161E2E',
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    gap: 6,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)' },
      default: {
        shadowColor: '#00D4FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
      },
    }),
  },
  floatingBarMine: {
    alignSelf: 'flex-end',
  },
  floatingBarOther: {
    alignSelf: 'flex-start',
  },
  emojiTouch: {
    padding: 3,
  },
  floatingEmojiText: {
    fontSize: 18,
  },
  floatingBarDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 2,
  },
  replyTouch: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  replyActionText: {
    fontSize: 12,
    color: COLORS.accentCyan,
    fontWeight: FONTS.bold,
  },

  // ── Reactions Cluster ──
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#182030',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  reactionChipActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: 'rgba(0, 212, 255, 0.4)',
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONTS.semibold,
  },
  reactionCountActive: {
    color: COLORS.accentCyan,
  },

  // ── Live Poll Styles ──
  pollContainer: {
    width: '100%',
    paddingVertical: 4,
  },
  pollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pollBadge: {
    fontSize: 10,
    fontWeight: FONTS.black,
    letterSpacing: 0.8,
    color: COLORS.accentCyan,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pollTotalVotes: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: FONTS.medium,
  },
  pollQuestion: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  pollOptionsWrap: {
    gap: 8,
  },
  pollOptionBtn: {
    position: 'relative',
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pollOptionBtnSelected: {
    borderColor: COLORS.accentCyan,
  },
  pollProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderRadius: 9,
  },
  pollProgressFillSelected: {
    backgroundColor: 'rgba(0, 212, 255, 0.25)',
  },
  pollOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 1,
  },
  pollRadioAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  pollRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollRadioActive: {
    borderColor: COLORS.accentCyan,
  },
  pollRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentCyan,
  },
  pollOptionText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
    flexShrink: 1,
  },
  pollOptionTextSelected: {
    fontWeight: FONTS.bold,
    color: '#FFFFFF',
  },
  pollPercentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.bold,
  },
  pollHelpText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default memo(MessageBubble);
