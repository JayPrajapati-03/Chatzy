const User = require('../models/User');
const Message = require('../models/Message');
const logger = require('../utils/logger');

// In-memory registry of online socket sessions: socketId -> { userId, username, room }
const activeSockets = new Map();

/**
 * Returns a distinct list of currently online users
 */
const getOnlineUsersList = () => {
  const usersMap = new Map();
  for (const session of activeSockets.values()) {
    if (session.userId && !usersMap.has(session.userId)) {
      usersMap.set(session.userId, {
        userId: session.userId,
        username: session.username,
        displayName: session.displayName || session.username,
        avatarColor: session.avatarColor || '#128C7E',
        room: session.room || 'global'
      });
    }
  }
  return Array.from(usersMap.values());
};

const registerChatHandlers = (io, socket) => {
  /**
   * Event: user:join
   * Triggered when client establishes session with identity
   */
  socket.on('user:join', async (payload = {}) => {
    try {
      const { userId, username, displayName, avatarColor, room = 'global' } = payload;
      if (!userId || !username) {
        logger.warn(`user:join received with incomplete payload:`, payload);
        return;
      }

      // Associate socket with room
      socket.join(room);

      // Track active socket
      activeSockets.set(socket.id, {
        userId: userId.toString(),
        username,
        displayName: displayName || username,
        avatarColor: avatarColor || '#128C7E',
        room
      });

      // Update online status in database
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      logger.info(`User joined: ${username} (${userId}) on socket ${socket.id} in room [${room}]`);

      // Broadcast current online users to everyone
      const onlineList = getOnlineUsersList();
      io.emit('users:online', onlineList);
    } catch (err) {
      logger.error('Error in user:join handler:', err);
    }
  });

  /**
   * Event: typing:start
   */
  socket.on('typing:start', (payload = {}) => {
    try {
      const { username, userId, room = 'global' } = payload;
      if (!username) return;

      socket.to(room).emit('typing:start', {
        username,
        userId: userId || (activeSockets.get(socket.id)?.userId)
      });
    } catch (err) {
      logger.error('Error in typing:start handler:', err);
    }
  });

  /**
   * Event: typing:stop
   */
  socket.on('typing:stop', (payload = {}) => {
    try {
      const { username, userId, room = 'global' } = payload;
      if (!username) return;

      socket.to(room).emit('typing:stop', {
        username,
        userId: userId || (activeSockets.get(socket.id)?.userId)
      });
    } catch (err) {
      logger.error('Error in typing:stop handler:', err);
    }
  });

  /**
   * Event: message:delivered
   */
  socket.on('message:delivered', async (payload = {}) => {
    try {
      const { messageId, userId, room = 'global' } = payload;
      if (!messageId) return;

      const message = await Message.findById(messageId);
      if (message && message.status === 'sent') {
        // Sender cannot deliver their own message
        if (userId && message.senderId && message.senderId.toString() === userId.toString()) {
          return;
        }

        message.status = 'delivered';
        await message.save();

        io.to(room).emit('message:delivered', {
          messageId,
          userId,
          status: 'delivered'
        });
      }
    } catch (err) {
      logger.error('Error in message:delivered handler:', err);
    }
  });

  /**
   * Event: message:read
   */
  socket.on('message:read', async (payload = {}) => {
    try {
      const { messageId, userId, username, room = 'global' } = payload;
      if (!messageId || !userId) return;

      const message = await Message.findById(messageId);
      if (message) {
        // Sender cannot mark their own message as read
        if (message.senderId && message.senderId.toString() === userId.toString()) {
          return;
        }

        const alreadyRead = message.readBy?.some(
          (entry) => entry.userId && entry.userId.toString() === userId.toString()
        );
        if (!alreadyRead) {
          message.readBy.push({
            userId,
            username: username || 'User',
            readAt: new Date()
          });
        }
        message.status = 'read';
        await message.save();

        io.to(room).emit('message:read', {
          messageId,
          userId,
          username,
          status: 'read'
        });
      }
    } catch (err) {
      logger.error('Error in message:read handler:', err);
    }
  });

  /**
   * Event: message:react
   */
  socket.on('message:react', async (payload = {}) => {
    try {
      const { messageId, emoji, userId, username, room = 'global' } = payload;
      if (!messageId || !emoji || !userId) return;

      const message = await Message.findById(messageId);
      if (!message) return;

      const strUserId = userId.toString();
      let reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

      if (reactionIndex > -1) {
        const reaction = message.reactions[reactionIndex];
        const userIndex = reaction.users.findIndex((u) => u.toString() === strUserId);

        if (userIndex > -1) {
          reaction.users.splice(userIndex, 1);
          if (reaction.usernames) {
            const uIdx = reaction.usernames.indexOf(username);
            if (uIdx > -1) reaction.usernames.splice(uIdx, 1);
          }
          reaction.count = reaction.users.length;
          if (reaction.count <= 0) {
            message.reactions.splice(reactionIndex, 1);
          }
        } else {
          reaction.users.push(userId);
          if (username) reaction.usernames.push(username);
          reaction.count = reaction.users.length;
        }
      } else {
        message.reactions.push({
          emoji,
          count: 1,
          users: [userId],
          usernames: username ? [username] : []
        });
      }

      await message.save();

      io.to(room).emit('message:reaction_updated', {
        messageId: message._id,
        reactions: message.reactions,
        room
      });
    } catch (err) {
      logger.error('Error in message:react socket handler:', err);
    }
  });

  /**
   * Event: poll:vote
   */
  socket.on('poll:vote', async (payload = {}) => {
    try {
      const { messageId, optionId, userId, username, room = 'global' } = payload;
      if (!messageId || !optionId || !userId) return;

      const message = await Message.findById(messageId);
      if (!message || message.type !== 'poll' || !message.poll) return;

      const strUserId = userId.toString();
      let previouslyVotedOptionId = null;

      message.poll.options.forEach((opt) => {
        const idx = opt.votes.findIndex((v) => v.toString() === strUserId);
        if (idx > -1) {
          opt.votes.splice(idx, 1);
          if (opt.voteUsernames) {
            const uIdx = opt.voteUsernames.indexOf(username);
            if (uIdx > -1) opt.voteUsernames.splice(uIdx, 1);
          }
          previouslyVotedOptionId = opt.id;
        }
      });

      if (previouslyVotedOptionId !== optionId) {
        const targetOption = message.poll.options.find((opt) => opt.id === optionId);
        if (targetOption) {
          targetOption.votes.push(userId);
          if (username) targetOption.voteUsernames.push(username);
        }
      }

      message.poll.totalVotes = message.poll.options.reduce(
        (sum, opt) => sum + opt.votes.length,
        0
      );

      message.markModified('poll');
      await message.save();

      io.to(room).emit('poll:vote_updated', {
        messageId: message._id,
        poll: message.poll,
        room
      });
    } catch (err) {
      logger.error('Error in poll:vote socket handler:', err);
    }
  });

  /**
   * Event: disconnect
   */
  socket.on('disconnect', async () => {
    try {
      const session = activeSockets.get(socket.id);
      activeSockets.delete(socket.id);

      if (session && session.userId) {
        logger.info(`Socket disconnected: ${socket.id} (user: ${session.username})`);

        // Check if user still has other active sockets open (e.g. multi-tab)
        const stillConnected = Array.from(activeSockets.values()).some(
          (s) => s.userId === session.userId
        );

        if (!stillConnected) {
          await User.findByIdAndUpdate(session.userId, {
            isOnline: false,
            lastSeen: new Date()
          });
        }

        // Broadcast updated online list
        const onlineList = getOnlineUsersList();
        io.emit('users:online', onlineList);
      } else {
        logger.info(`Anonymous socket disconnected: ${socket.id}`);
      }
    } catch (err) {
      logger.error('Error in disconnect handler:', err);
    }
  });
};

module.exports = {
  registerChatHandlers,
  getOnlineUsersList
};
