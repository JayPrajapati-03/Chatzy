import { useEffect, useRef, useCallback } from 'react';
import getSocket, { connectSocket } from './socket';
import { DEFAULT_ROOM } from '../utils/constants';

/**
 * useSocket — manages socket lifecycle and event subscriptions for a component.
 *
 * @param {object} options
 * @param {object|null} options.user        - current logged-in user
 * @param {function}    options.onMessage   - handler for `message:new`
 * @param {function}    options.onTypingStart - handler for `typing:start`
 * @param {function}    options.onTypingStop  - handler for `typing:stop`
 * @param {function}    options.onUsersOnline - handler for `users:online`
 * @param {function}    options.onConnect   - handler for socket connect
 * @param {function}    options.onDisconnect - handler for socket disconnect
 * @param {function}    options.onMsgDelivered - handler for `message:delivered`
 * @param {function}    options.onMsgRead   - handler for `message:read`
 * @returns {{ emitTypingStart, emitTypingStop, emitJoin, emitMsgRead, socket }}
 */
const useSocket = ({
  user,
  onMessage,
  onTypingStart,
  onTypingStop,
  onUsersOnline,
  onConnect,
  onDisconnect,
  onMsgDelivered,
  onMsgRead
} = {}) => {
  // Use ref so that stale-closure callbacks always get the latest handlers
  const handlers = useRef({});
  handlers.current = {
    onMessage,
    onTypingStart,
    onTypingStop,
    onUsersOnline,
    onConnect,
    onDisconnect,
    onMsgDelivered,
    onMsgRead
  };

  useEffect(() => {
    if (!user) return; // don't connect until the user is known

    const socket = connectSocket();

    const handle = (name, payload) => {
      const fn = handlers.current[name];
      if (typeof fn === 'function') fn(payload);
    };

    // ── event bindings ──────────────────────────────────────────────────────
    const onConn = () => {
      // Join the global room with user identity
      socket.emit('user:join', {
        userId: user._id,
        username: user.username,
        displayName: user.displayName,
        avatarColor: user.avatarColor,
        room: DEFAULT_ROOM
      });
      handle('onConnect');
    };

    const onDisconn = () => handle('onDisconnect');
    const onMsg = (msg) => handle('onMessage', msg);
    const onTStart = (data) => handle('onTypingStart', data);
    const onTStop = (data) => handle('onTypingStop', data);
    const onUsersOnlineFn = (list) => handle('onUsersOnline', list);
    const onDelivered = (data) => handle('onMsgDelivered', data);
    const onRead = (data) => handle('onMsgRead', data);

    socket.on('connect', onConn);
    socket.on('disconnect', onDisconn);
    socket.on('message:new', onMsg);
    socket.on('typing:start', onTStart);
    socket.on('typing:stop', onTStop);
    socket.on('users:online', onUsersOnlineFn);
    socket.on('message:delivered', onDelivered);
    socket.on('message:read', onRead);

    // If already connected (e.g. reconnected), emit join immediately
    if (socket.connected) onConn();

    return () => {
      socket.off('connect', onConn);
      socket.off('disconnect', onDisconn);
      socket.off('message:new', onMsg);
      socket.off('typing:start', onTStart);
      socket.off('typing:stop', onTStop);
      socket.off('users:online', onUsersOnlineFn);
      socket.off('message:delivered', onDelivered);
      socket.off('message:read', onRead);
    };
  }, [user]);

  // ── helper emitters (stable refs) ──────────────────────────────────────────
  const emitTypingStart = useCallback(() => {
    if (!user) return;
    getSocket().emit('typing:start', {
      username: user.username,
      userId: user._id,
      room: DEFAULT_ROOM
    });
  }, [user]);

  const emitTypingStop = useCallback(() => {
    if (!user) return;
    getSocket().emit('typing:stop', {
      username: user.username,
      userId: user._id,
      room: DEFAULT_ROOM
    });
  }, [user]);

  // Called by receiver when they receive a new message from someone else
  const emitMsgDelivered = useCallback((messageId) => {
    if (!user || !messageId) return;
    getSocket().emit('message:delivered', {
      messageId,
      userId: user._id,
      username: user.username,
      room: DEFAULT_ROOM,
    });
  }, [user]);

  const emitJoin = useCallback(() => {
    if (!user) return;
    getSocket().emit('user:join', {
      userId: user._id,
      username: user.username,
      displayName: user.displayName,
      avatarColor: user.avatarColor,
      room: DEFAULT_ROOM
    });
  }, [user]);

  const emitMsgRead = useCallback(
    (messageId) => {
      if (!user || !messageId) return;
      getSocket().emit('message:read', {
        messageId,
        userId: user._id,
        username: user.username,
        room: DEFAULT_ROOM
      });
    },
    [user]
  );

  return { emitTypingStart, emitTypingStop, emitJoin, emitMsgRead, emitMsgDelivered, socket: getSocket() };
};

export default useSocket;
