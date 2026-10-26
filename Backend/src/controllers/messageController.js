const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

/**
 * @desc   Send a new message, persist to MongoDB, and broadcast via Socket.io
 * @route  POST /api/messages
 */
const sendMessage = asyncHandler(async (req, res) => {
  const {
    senderId,
    senderUsername,
    senderDisplayName,
    senderAvatarColor,
    text,
    room,
    type,
    replyTo,
    poll
  } = req.body;

  const targetRoom = room || 'global';

  // 1. Persist message to MongoDB
  const message = await Message.create({
    senderId,
    senderUsername,
    senderDisplayName: senderDisplayName || senderUsername,
    senderAvatarColor: senderAvatarColor || '#128C7E',
    text,
    room: targetRoom,
    type: type || 'text',
    replyTo: replyTo || undefined,
    poll: poll || undefined,
    status: 'sent'
  });

  // 2. Broadcast to all users in the room via shared Socket.io instance
  const io = req.app.get('io');
  if (io) {
    io.to(targetRoom).emit('message:new', message);
    logger.debug(`Broadcasted message [${message._id}] to room [${targetRoom}]`);
  } else {
    logger.warn('Socket.io instance not attached to express app');
  }

  // 3. Return created message
  res.status(201).json({
    success: true,
    data: message,
    message: 'Message created and broadcasted successfully'
  });
});

/**
 * @desc   Get chat history sorted by createdAt, with pagination (?limit=&before=&room=)
 * @route  GET /api/messages
 */
const getMessages = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const before = req.query.before;
  const room = req.query.room || 'global';

  const filter = { room };

  if (before) {
    // If before is a valid date string or timestamp
    const beforeDate = new Date(before);
    if (!isNaN(beforeDate.getTime())) {
      filter.createdAt = { $lt: beforeDate };
    }
  }

  // Fetch newest first to honor pagination 'before', then reverse to chronological order
  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const chronologicalMessages = messages.reverse();

  res.status(200).json({
    success: true,
    data: chronologicalMessages,
    count: chronologicalMessages.length,
    message: 'Messages fetched successfully'
  });
});

/**
 * @desc   Mark a message as read by a user
 * @route  POST /api/messages/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, username } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'userId is required'
    });
  }

  const message = await Message.findById(id);
  if (!message) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Message not found'
    });
  }

  // Avoid duplicate read entries
  const alreadyRead = message.readBy.some((entry) => entry.userId.toString() === userId.toString());
  if (!alreadyRead) {
    message.readBy.push({
      userId,
      username: username || 'User',
      readAt: new Date()
    });
    message.status = 'read';
    await message.save();

    // Broadcast read receipt via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(message.room).emit('message:read', {
        messageId: message._id,
        userId,
        username,
        status: 'read'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: message,
    message: 'Message marked as read'
  });
});

/**
 * @desc   Add or toggle an emoji reaction to a message
 * @route  POST /api/messages/:id/react
 */
const reactToMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { emoji, userId, username } = req.body;

  if (!emoji || !userId) {
    return res.status(400).json({
      success: false,
      message: 'emoji and userId are required'
    });
  }

  const message = await Message.findById(id);
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  const strUserId = userId.toString();
  let reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

  if (reactionIndex > -1) {
    const reaction = message.reactions[reactionIndex];
    const userIndex = reaction.users.findIndex((u) => u.toString() === strUserId);

    if (userIndex > -1) {
      // Toggle off: remove user reaction
      reaction.users.splice(userIndex, 1);
      if (reaction.usernames) {
        const uNameIdx = reaction.usernames.indexOf(username);
        if (uNameIdx > -1) reaction.usernames.splice(uNameIdx, 1);
      }
      reaction.count = reaction.users.length;

      if (reaction.count <= 0) {
        message.reactions.splice(reactionIndex, 1);
      }
    } else {
      // Add reaction
      reaction.users.push(userId);
      if (username) reaction.usernames.push(username);
      reaction.count = reaction.users.length;
    }
  } else {
    // New emoji reaction
    message.reactions.push({
      emoji,
      count: 1,
      users: [userId],
      usernames: username ? [username] : []
    });
  }

  await message.save();

  // Broadcast reaction update
  const io = req.app.get('io');
  if (io) {
    io.to(message.room).emit('message:reaction_updated', {
      messageId: message._id,
      reactions: message.reactions,
      room: message.room
    });
  }

  res.status(200).json({
    success: true,
    data: {
      messageId: message._id,
      reactions: message.reactions
    },
    message: 'Reaction updated successfully'
  });
});

/**
 * @desc   Cast or toggle a vote on a poll option
 * @route  POST /api/messages/:id/poll/vote
 */
const votePoll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { optionId, userId, username } = req.body;

  if (!optionId || !userId) {
    return res.status(400).json({
      success: false,
      message: 'optionId and userId are required'
    });
  }

  const message = await Message.findById(id);
  if (!message || message.type !== 'poll' || !message.poll) {
    return res.status(404).json({
      success: false,
      message: 'Poll message not found'
    });
  }

  const strUserId = userId.toString();

  // Remove user's previous vote from any option
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

  // If user tapped a different option (or first vote), record it
  if (previouslyVotedOptionId !== optionId) {
    const targetOption = message.poll.options.find((opt) => opt.id === optionId);
    if (targetOption) {
      targetOption.votes.push(userId);
      if (username) targetOption.voteUsernames.push(username);
    }
  }

  // Recalculate total votes
  message.poll.totalVotes = message.poll.options.reduce(
    (sum, opt) => sum + opt.votes.length,
    0
  );

  message.markModified('poll');
  await message.save();

  // Broadcast updated poll
  const io = req.app.get('io');
  if (io) {
    io.to(message.room).emit('poll:vote_updated', {
      messageId: message._id,
      poll: message.poll,
      room: message.room
    });
  }

  res.status(200).json({
    success: true,
    data: {
      messageId: message._id,
      poll: message.poll
    },
    message: 'Poll vote updated'
  });
});

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  reactToMessage,
  votePoll
};
