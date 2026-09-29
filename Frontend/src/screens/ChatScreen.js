import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import useSocket from '../socket/useSocket';
import { getMessages, sendMessage } from '../api/messageApi';
import { connectSocket } from '../socket/socket';

import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import OnlineUsersBar from '../components/OnlineUsersBar';
import ConnectionBanner from '../components/ConnectionBanner';

import { COLORS, DEFAULT_ROOM, HISTORY_LIMIT } from '../utils/constants';
import { formatDateLabel, isDifferentDay } from '../utils/formatTime';

export default function ChatScreen() {
  const { user, logout } = useAuth();

  // ── State ─────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);       // chronological array
  const [typingUsers, setTypingUsers] = useState([]); // [{username, userId}]
  const [onlineUsers, setOnlineUsers] = useState([]); // [{userId, username, ...}]
  const [connStatus, setConnStatus] = useState('connecting'); // 'connected'|'connecting'|'disconnected'
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sendError, setSendError] = useState(null);

  // Track message IDs for deduplication
  const msgIdSet = useRef(new Set());
  const flatListRef = useRef(null);

  // ── Load chat history via REST on mount ───────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getMessages({ room: DEFAULT_ROOM, limit: HISTORY_LIMIT });
        // Deduplicate on initial load
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

  // ── Auto-scroll to latest message ─────────────────────────────────────────
  const scrollToEnd = useCallback((animated = true) => {
    // Small delay lets FlatList finish rendering new items
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated }), 100);
  }, []);

  useEffect(() => {
    if (!historyLoading && messages.length > 0) {
      scrollToEnd(false);
    }
  }, [historyLoading]);

  // ── Socket event handlers ─────────────────────────────────────────────────
  const handleNewMessage = useCallback(
    (msg) => {
      if (!msg?._id) return;
      if (msgIdSet.current.has(msg._id)) return; // deduplicate
      msgIdSet.current.add(msg._id);
      setMessages((prev) => [...prev, msg]);
      scrollToEnd();

      // Clear the sender from typing list
      setTypingUsers((prev) =>
        prev.filter((u) => u.username !== msg.senderUsername)
      );
    },
    [scrollToEnd]
  );

  const handleTypingStart = useCallback(({ username, userId }) => {
    if (username === user?.username) return; // ignore own events
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

  const handleConnect = useCallback(() => {
    setConnStatus('connected');
  }, []);

  const handleDisconnect = useCallback(() => {
    setConnStatus('disconnected');
  }, []);

  // Update local message status when delivered/read events arrive
  const handleMsgDelivered = useCallback(({ messageId, status }) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId && m.status === 'sent' ? { ...m, status } : m
      )
    );
  }, []);

  const handleMsgRead = useCallback(({ messageId }) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId && m.status !== 'read' ? { ...m, status: 'read' } : m
      )
    );
  }, []);

  // ── Socket hook ───────────────────────────────────────────────────────────
  const { emitTypingStart, emitTypingStop } = useSocket({
    user,
    onMessage: handleNewMessage,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
    onUsersOnline: handleUsersOnline,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onMsgDelivered: handleMsgDelivered,
    onMsgRead: handleMsgRead
  });

  // ── Retry handler for ConnectionBanner ────────────────────────────────────
  const handleRetry = useCallback(() => {
    setConnStatus('connecting');
    connectSocket();
  }, []);

  // ── Send message via REST → server broadcasts via socket ──────────────────
  const handleSend = useCallback(
    async (text) => {
      if (!user) return;
      setSendError(null);

      // Optimistic UI: add a temporary message immediately
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
        createdAt: new Date().toISOString()
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
          room: DEFAULT_ROOM
        });

        // Replace optimistic message with the saved document
        msgIdSet.current.delete(tempId);
        msgIdSet.current.add(saved._id);
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? saved : m))
        );
      } catch (err) {
        // Mark optimistic message as failed
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        msgIdSet.current.delete(tempId);
        setSendError('Failed to send. Tap to retry.');
        Alert.alert(
          'Message Failed',
          err.message || 'Could not send message. Check your connection.',
          [
            { text: 'OK', style: 'cancel' },
            { text: 'Retry', onPress: () => handleSend(text) }
          ]
        );
      }
    },
    [user, scrollToEnd]
  );

  // ── Render helpers ────────────────────────────────────────────────────────

  /**
   * Build a flat list-ready array that inserts date separator objects
   * between messages from different calendar days.
   */
  const listData = useMemo(() => {
    const result = [];
    messages.forEach((msg, i) => {
      const prev = messages[i - 1];
      if (!prev || isDifferentDay(prev.createdAt, msg.createdAt)) {
        result.push({
          type: 'DATE_SEPARATOR',
          id: `sep_${msg.createdAt}`,
          label: formatDateLabel(msg.createdAt)
        });
      }
      result.push({ type: 'MESSAGE', id: msg._id, data: msg });
    });
    return result;
  }, [messages]);

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === 'DATE_SEPARATOR') {
        return (
          <View style={styles.dateSep}>
            <Text style={styles.dateSepText}>{item.label}</Text>
          </View>
        );
      }
      const msg = item.data;
      const isMine =
        msg.senderId === user?._id || msg.senderUsername === user?.username;
      return <MessageBubble message={msg} isMine={isMine} />;
    },
    [user]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  // ── Header ────────────────────────────────────────────────────────────────
  const onlineCount = onlineUsers.length;
  const headerSubtitle =
    connStatus === 'connected'
      ? `${onlineCount} online`
      : connStatus === 'connecting'
      ? 'connecting...'
      : 'offline';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgHeader} />

      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.roomAvatar, { backgroundColor: COLORS.accentGreen }]}>
            <Text style={styles.roomAvatarText}>#</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Chatzy Global</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </View>
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* ── Connection Banner ────────────────────────────────────────────── */}
      <ConnectionBanner status={connStatus} onRetry={handleRetry} />

      {/* ── Online Users Bar ─────────────────────────────────────────────── */}
      <OnlineUsersBar users={onlineUsers} />

      {/* ── Chat Body ────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages list */}
        {historyLoading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color={COLORS.accentGreen} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={listData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            // Performance tuning
            windowSize={10}
            maxToRenderPerBatch={20}
            initialNumToRender={30}
            onContentSizeChange={() => scrollToEnd(false)}
            ListEmptyComponent={
              <View style={styles.emptyArea}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>
                  No messages yet.{'\n'}Be the first to say hello!
                </Text>
              </View>
            }
          />
        )}

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Message Input */}
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
    backgroundColor: COLORS.bgHeader
  },
  flex: {
    flex: 1,
    backgroundColor: COLORS.bgChat
  },
  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.bgHeader,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  roomAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  roomAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.accentGreenLight,
    marginTop: 1
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.bgInputField,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  logoutText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  // ── Messages list ──
  listContent: {
    paddingTop: 12,
    paddingBottom: 8
  },
  loadingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14
  },
  emptyArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 10
  },
  emptyIcon: {
    fontSize: 48
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22
  },
  // ── Date separator ──
  dateSep: {
    alignItems: 'center',
    marginVertical: 10
  },
  dateSepText: {
    backgroundColor: COLORS.bgInputField,
    color: COLORS.textSecondary,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    fontWeight: '600'
  }
});
