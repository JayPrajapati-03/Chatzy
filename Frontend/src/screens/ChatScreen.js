import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import useSocket from '../socket/useSocket';
import { getMessages, sendMessage } from '../api/messageApi';
import { connectSocket } from '../socket/socket';

import MessageBubble from '../components/MessageBubble';
import MessageInput  from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import OnlineUsersBar  from '../components/OnlineUsersBar';
import ConnectionBanner from '../components/ConnectionBanner';
import ActiveMembersModal from '../components/ActiveMembersModal';

import { COLORS, GRADIENTS, DEFAULT_ROOM, HISTORY_LIMIT, FONTS, RADIUS, SHADOW } from '../utils/constants';
import { formatDateLabel, isDifferentDay } from '../utils/formatTime';
import { nd } from '../utils/platform';

// ── Date Separator ────────────────────────────────────────────────────────────
const DateSep = ({ label }) => (
  <View style={sepStyles.wrap}>
    <View style={sepStyles.line} />
    <View style={sepStyles.pill}>
      <Text style={sepStyles.text}>{label}</Text>
    </View>
    <View style={sepStyles.line} />
  </View>
);

// ── Globe Icon (Web SVG + Native emoji fallback) ─────────────────────────────
const GlobeIcon = ({ size = 16, color = COLORS.accentCyan }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
  return <Text style={{ fontSize: size }}>🌐</Text>;
};

// ── Message Icon (Web SVG + Native emoji fallback) ───────────────────────────
const MessageIcon = ({ size = 20, color = COLORS.accentCyan }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return <Text style={{ fontSize: size * 0.9 }}>💬</Text>;
};

const sepStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderGlass,
  },
  pill: {
    backgroundColor: COLORS.bgFloat,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  text: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: FONTS.semibold,
    letterSpacing: 0.8,
  },
});

// ── Connection Status Dot ─────────────────────────────────────────────────────
const StatusDot = ({ status }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (status === 'connected') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.6, duration: 1000, useNativeDriver: nd }),
          Animated.timing(pulse, { toValue: 1,   duration: 1000, useNativeDriver: nd }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [status]);

  const color =
    status === 'connected'   ? COLORS.accentGreen  :
    status === 'connecting'  ? COLORS.accentAmber  :
                               COLORS.accentRed;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 14, height: 14 }}>
      {status === 'connected' && (
        <Animated.View
          style={{
            position: 'absolute',
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: color,
            opacity: 0.35,
            transform: [{ scale: pulse }],
          }}
        />
      )}
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
};

// ── Main ChatScreen ───────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { user, logout } = useAuth();

  const [messages,       setMessages]       = useState([]);
  const [typingUsers,    setTypingUsers]    = useState([]);
  const [onlineUsers,    setOnlineUsers]    = useState([]);
  const [connStatus,     setConnStatus]     = useState('connecting');
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const msgIdSet   = useRef(new Set());
  const flatListRef = useRef(null);
  const headerAnim  = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: nd }).start();
  }, []);

  // Load history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getMessages({ room: DEFAULT_ROOM, limit: HISTORY_LIMIT });
        const fresh = history.filter((m) => {
          if (msgIdSet.current.has(m._id)) return false;
          msgIdSet.current.add(m._id);
          return true;
        });
        setMessages(fresh);
      } catch (err) {
        console.warn('Failed to load history:', err.message);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  const scrollToEnd = useCallback((animated = true) => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated }), 100);
  }, []);

  useEffect(() => {
    if (!historyLoading && messages.length > 0) scrollToEnd(false);
  }, [historyLoading]);

  // Track whether app is in foreground (active) for read receipts
  const appStateRef = useRef(AppState.currentState);
  const emittersRef = useRef({});
  const readMsgIdsRef = useRef(new Set());
  const deliveredMsgIdsRef = useRef(new Set());
  const markedReadSet = useRef(new Set());

  // Socket handlers
  const handleNewMessage = useCallback(
    (msg) => {
      if (!msg?._id) return;
      if (msgIdSet.current.has(msg._id)) return;
      msgIdSet.current.add(msg._id);

      const isFromMe = msg.senderId === user?._id || msg.senderUsername === user?.username;

      setMessages((prev) => {
        // Prevent duplicate if already in state
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;

        // If from me, check if optimistic temp message is present and replace it
        if (isFromMe) {
          const tempIndex = prev.findIndex(
            (m) => m._id && String(m._id).startsWith('temp_') && m.text === msg.text
          );
          if (tempIndex !== -1) {
            const next = [...prev];
            next[tempIndex] = msg;
            return next;
          }
        }
        return [...prev, msg];
      });

      scrollToEnd();
      setTypingUsers((prev) => prev.filter((u) => u.username !== msg.senderUsername));

      // WhatsApp logic: if I am the RECEIVER (not the sender)
      if (!isFromMe) {
        // ✓✓ grey — message arrived on my device
        emittersRef.current.emitMsgDelivered?.(msg._id);

        // ✓✓ cyan/blue — I am actively viewing the chat right now
        if (appStateRef.current === 'active') {
          markedReadSet.current.add(String(msg._id));
          emittersRef.current.emitMsgRead?.(msg._id);
        }
      }
    },
    [scrollToEnd, user]
  );

  const handleTypingStart = useCallback(({ username, userId }) => {
    if (username === user?.username) return;
    setTypingUsers((prev) => {
      if (prev.find((u) => u.username === username)) return prev;
      return [...prev, { username, userId }];
    });
  }, [user]);

  const handleTypingStop = useCallback(({ username }) => {
    setTypingUsers((prev) => prev.filter((u) => u.username !== username));
  }, []);

  const handleUsersOnline = useCallback((list) => {
    setOnlineUsers(Array.isArray(list) ? list : []);
  }, []);

  const handleConnect = useCallback(() => setConnStatus('connected'), []);
  const handleDisconnect = useCallback(() => setConnStatus('disconnected'), []);

  const handleMsgDelivered = useCallback(({ messageId, status }) => {
    deliveredMsgIdsRef.current.add(String(messageId));
    setMessages((prev) =>
      prev.map((m) =>
        String(m._id) === String(messageId) && m.status !== 'read'
          ? { ...m, status: status || 'delivered' }
          : m
      )
    );
  }, []);

  const handleMsgRead = useCallback(({ messageId }) => {
    readMsgIdsRef.current.add(String(messageId));
    setMessages((prev) =>
      prev.map((m) =>
        String(m._id) === String(messageId)
          ? { ...m, status: 'read' }
          : m
      )
    );
  }, []);

  const { emitTypingStart, emitTypingStop, emitMsgDelivered, emitMsgRead } = useSocket({
    user,
    onMessage:      handleNewMessage,
    onTypingStart:  handleTypingStart,
    onTypingStop:   handleTypingStop,
    onUsersOnline:  handleUsersOnline,
    onConnect:      handleConnect,
    onDisconnect:   handleDisconnect,
    onMsgDelivered: handleMsgDelivered,
    onMsgRead:      handleMsgRead,
  });

  // Keep emitters accessible inside callbacks via ref
  useEffect(() => {
    emittersRef.current = { emitMsgDelivered, emitMsgRead };
  }, [emitMsgDelivered, emitMsgRead]);

  // Mark all unread messages from others as read when screen is active or comes to foreground
  useEffect(() => {
    const markUnreadAsRead = () => {
      if (!user || appStateRef.current !== 'active' || historyLoading) return;
      messages.forEach((m) => {
        const isFromMe = m.senderId === user._id || m.senderUsername === user.username;
        const isTemp = typeof m._id === 'string' && m._id.startsWith('temp_');
        if (!isFromMe && !isTemp && m.status !== 'read' && !markedReadSet.current.has(String(m._id))) {
          markedReadSet.current.add(String(m._id));
          emittersRef.current.emitMsgRead?.(m._id);
        }
      });
    };

    markUnreadAsRead();

    const sub = AppState.addEventListener('change', (next) => {
      appStateRef.current = next;
      if (next === 'active') {
        markUnreadAsRead();
      }
    });

    return () => sub.remove();
  }, [messages, user, historyLoading]);

  const handleRetry = useCallback(() => {
    setConnStatus('connecting');
    connectSocket();
  }, []);

  // Send
  const handleSend = useCallback(
    async (text) => {
      if (!user) return;
      const tempId = `temp_${Date.now()}`;
      const optimistic = {
        _id: tempId,
        senderId: user._id,
        senderUsername: user.username,
        senderDisplayName: user.displayName,
        senderAvatarColor: user.avatarColor,
        text,
        room: DEFAULT_ROOM,
        status: 'sent',
        createdAt: new Date().toISOString(),
      };
      msgIdSet.current.add(tempId);
      setMessages((prev) => [...prev, optimistic]);
      scrollToEnd();
      try {
        const saved = await sendMessage({
          senderId: user._id,
          senderUsername: user.username,
          senderDisplayName: user.displayName,
          senderAvatarColor: user.avatarColor,
          text,
          room: DEFAULT_ROOM,
        });
        msgIdSet.current.delete(tempId);
        msgIdSet.current.add(saved._id);

        const currentStatus = readMsgIdsRef.current.has(String(saved._id))
          ? 'read'
          : deliveredMsgIdsRef.current.has(String(saved._id))
          ? 'delivered'
          : saved.status;

        setMessages((prev) => {
          const hasSaved = prev.some((m) => String(m._id) === String(saved._id));
          if (hasSaved) {
            return prev
              .filter((m) => m._id !== tempId)
              .map((m) =>
                String(m._id) === String(saved._id)
                  ? { ...m, status: m.status === 'read' ? 'read' : currentStatus }
                  : m
              );
          }
          return prev.map((m) =>
            m._id === tempId ? { ...saved, status: currentStatus } : m
          );
        });
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        msgIdSet.current.delete(tempId);
        Alert.alert(
          'Failed to Send',
          err.message || 'Check your connection and try again.',
          [{ text: 'OK' }, { text: 'Retry', onPress: () => handleSend(text) }]
        );
      }
    },
    [user, scrollToEnd]
  );

  // List data with date separators
  const listData = useMemo(() => {
    const result = [];
    messages.forEach((msg, i) => {
      const prev = messages[i - 1];
      if (!prev || isDifferentDay(prev.createdAt, msg.createdAt)) {
        result.push({ type: 'DATE_SEPARATOR', id: `sep_${msg.createdAt}`, label: formatDateLabel(msg.createdAt) });
      }
      result.push({ type: 'MESSAGE', id: msg._id, data: msg });
    });
    return result;
  }, [messages]);

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === 'DATE_SEPARATOR') return <DateSep label={item.label} />;
      const isMine = item.data.senderId === user?._id || item.data.senderUsername === user?.username;
      const isSenderOnline = !isMine && onlineUsers.some(
        (u) => u.userId === item.data.senderId || u.username === item.data.senderUsername
      );
      return (
        <MessageBubble
          message={item.data}
          isMine={isMine}
          isSenderOnline={isSenderOnline}
        />
      );
    },
    [user, onlineUsers]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  // Header
  const onlineCount = onlineUsers.length;
  const statusLabel =
    connStatus === 'connected'  ? `${onlineCount} member${onlineCount !== 1 ? 's' : ''} online` :
    connStatus === 'connecting' ? 'Connecting…' :
                                  'Offline';

  const userInitial = (user?.displayName || user?.username || '?').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSurface} />

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#0D1117', '#161B27']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        {/* Room info */}
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[COLORS.accentCyan, COLORS.accentViolet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.roomAvatarRing}
          >
            <View style={styles.roomAvatarInner}>
              <MessageIcon size={20} color={COLORS.accentCyan} />
            </View>
          </LinearGradient>

          <View>
            <View style={styles.titleRow}>
              <Text style={styles.roomName}>Chatzy Global</Text>
              <GlobeIcon size={16} color={COLORS.accentCyan} />
            </View>
            <TouchableOpacity
              style={styles.statusRow}
              activeOpacity={0.7}
              onPress={() => setShowMembersModal(true)}
            >
              <StatusDot status={connStatus} />
              <Text style={styles.statusLabel}>{statusLabel}</Text>
              {onlineCount > 0 && <Text style={styles.statusChevron}>›</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* User avatar - tap to open profile & exit menu */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.myAvatar, { backgroundColor: user?.avatarColor || COLORS.accentCyan }]}
            activeOpacity={0.7}
            onPress={() => setShowProfileModal(true)}
          >
            <Text style={styles.myAvatarText}>{userInitial}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Bottom accent line */}
      <LinearGradient
        colors={['transparent', COLORS.accentCyan, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBottomLine}
      />

      {/* ── Connection Banner ─────────────────────────────────────────────── */}
      <ConnectionBanner status={connStatus} onRetry={handleRetry} />

      {/* ── Online Users ──────────────────────────────────────────────────── */}
      <OnlineUsersBar
        users={onlineUsers}
        onOpenMembersModal={() => setShowMembersModal(true)}
      />

      {/* ── Chat Body ─────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {historyLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.accentCyan} />
            <Text style={styles.loadingText}>Loading messages…</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={listData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            windowSize={10}
            maxToRenderPerBatch={20}
            initialNumToRender={30}
            onContentSizeChange={() => scrollToEnd(false)}
            style={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <LinearGradient
                  colors={[COLORS.accentCyan, COLORS.accentViolet]}
                  style={styles.emptyIconWrap}
                >
                  <Text style={styles.emptyIcon}>💬</Text>
                </LinearGradient>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtitle}>Be the first to say hello!</Text>
              </View>
            }
          />
        )}

        <TypingIndicator typingUsers={typingUsers} />

        <MessageInput
          onSend={handleSend}
          onTypingStart={emitTypingStart}
          onTypingStop={emitTypingStop}
          disabled={connStatus === 'disconnected'}
        />
      </KeyboardAvoidingView>

      {/* ── Profile & Exit Popover Modal ──────────────────────────────────── */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileModal(false)}
        >
          <View style={styles.profilePopover}>
            <View style={styles.popoverHeader}>
              <View style={[styles.popoverAvatar, { backgroundColor: user?.avatarColor || COLORS.accentCyan }]}>
                <Text style={styles.popoverAvatarText}>{userInitial}</Text>
              </View>
              <View style={styles.popoverUserInfo}>
                <Text style={styles.popoverDisplayName} numberOfLines={1}>
                  {user?.displayName || user?.username}
                </Text>
                <Text style={styles.popoverUsername} numberOfLines={1}>
                  @{user?.username}
                </Text>
              </View>
            </View>

            <View style={styles.popoverDivider} />

            <TouchableOpacity
              style={styles.popoverExitBtn}
              activeOpacity={0.8}
              onPress={() => {
                setShowProfileModal(false);
                logout();
              }}
            >
              <Text style={styles.popoverExitText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Active Members Modal ────────────────────────────────────────── */}
      <ActiveMembersModal
        visible={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        users={onlineUsers}
        currentUser={user}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
  },
  flex: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomAvatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2.5,
    ...SHADOW.cyanGlow,
  },
  roomAvatarInner: {
    flex: 1,
    backgroundColor: COLORS.bgFloat,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomAvatarText: {
    fontSize: 18,
    fontWeight: FONTS.black,
    color: COLORS.accentCyan,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomName: {
    fontSize: 17,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: COLORS.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    color: '#0b0f19',
    fontSize: 10,
    fontWeight: FONTS.black,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  statusChevron: {
    fontSize: 13,
    color: COLORS.accentCyan,
    marginLeft: 2,
    fontWeight: FONTS.bold,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  myAvatarText: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 95 : 65,
    paddingRight: 16,
  },
  profilePopover: {
    width: 220,
    backgroundColor: '#161B27',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    ...Platform.select({
      web: { boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
      },
    }),
  },
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  popoverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popoverAvatarText: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  popoverUserInfo: {
    flex: 1,
  },
  popoverDisplayName: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  popoverUsername: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  popoverDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  popoverExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: RADIUS.md,
    paddingVertical: 9,
  },
  popoverExitText: {
    color: COLORS.accentRed,
    fontSize: 13,
    fontWeight: FONTS.semibold,
  },
  headerBottomLine: {
    height: 1,
    opacity: 0.25,
  },

  // ── List ──
  list: { flex: 1, backgroundColor: COLORS.bgBase },
  listContent: { paddingTop: 16, paddingBottom: 8 },

  // ── Loading ──
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.bgBase,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: FONTS.medium,
  },

  // ── Empty ──
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 14,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: FONTS.regular,
  },
});
