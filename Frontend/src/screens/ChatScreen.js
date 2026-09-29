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

import { COLORS, GRADIENTS, DEFAULT_ROOM, HISTORY_LIMIT, FONTS, RADIUS, SHADOW } from '../utils/constants';
import { formatDateLabel, isDifferentDay } from '../utils/formatTime';

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
          Animated.timing(pulse, { toValue: 1.6, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,   duration: 1000, useNativeDriver: true }),
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

  const msgIdSet   = useRef(new Set());
  const flatListRef = useRef(null);
  const headerAnim  = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
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

  // Socket handlers
  const handleNewMessage = useCallback(
    (msg) => {
      if (!msg?._id) return;
      if (msgIdSet.current.has(msg._id)) return;
      msgIdSet.current.add(msg._id);
      setMessages((prev) => [...prev, msg]);
      scrollToEnd();
      setTypingUsers((prev) => prev.filter((u) => u.username !== msg.senderUsername));
    },
    [scrollToEnd]
  );

  const handleTypingStart  = useCallback(({ username, userId }) => {
    if (username === user?.username) return;
    setTypingUsers((prev) => {
      if (prev.find((u) => u.username === username)) return prev;
      return [...prev, { username, userId }];
    });
  }, [user]);

  const handleTypingStop   = useCallback(({ username }) => {
    setTypingUsers((prev) => prev.filter((u) => u.username !== username));
  }, []);

  const handleUsersOnline  = useCallback((list) => {
    setOnlineUsers(Array.isArray(list) ? list : []);
  }, []);

  const handleConnect     = useCallback(() => setConnStatus('connected'),    []);
  const handleDisconnect  = useCallback(() => setConnStatus('disconnected'), []);

  const handleMsgDelivered = useCallback(({ messageId, status }) => {
    setMessages((prev) =>
      prev.map((m) => m._id === messageId && m.status === 'sent' ? { ...m, status } : m)
    );
  }, []);

  const handleMsgRead = useCallback(({ messageId }) => {
    setMessages((prev) =>
      prev.map((m) => m._id === messageId && m.status !== 'read' ? { ...m, status: 'read' } : m)
    );
  }, []);

  const { emitTypingStart, emitTypingStop } = useSocket({
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
        setMessages((prev) => prev.map((m) => (m._id === tempId ? saved : m)));
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
      return <MessageBubble message={item.data} isMine={isMine} />;
    },
    [user]
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
              <Text style={styles.roomAvatarText}>#</Text>
            </View>
          </LinearGradient>

          <View>
            <Text style={styles.roomName}>Chatzy Global</Text>
            <View style={styles.statusRow}>
              <StatusDot status={connStatus} />
              <Text style={styles.statusLabel}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* User avatar + logout */}
        <View style={styles.headerRight}>
          <View style={[styles.myAvatar, { backgroundColor: user?.avatarColor || COLORS.accentCyan }]}>
            <Text style={styles.myAvatarText}>{userInitial}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Exit</Text>
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
      <OnlineUsersBar users={onlineUsers} />

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
  roomName: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
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

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  myAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderGlass,
  },
  myAvatarText: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.white06,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  logoutText: {
    color: COLORS.textSecondary,
    fontSize: 12,
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
