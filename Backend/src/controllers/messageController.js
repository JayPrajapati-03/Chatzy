const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

/**
 * @desc   Send a new message, persist to MongoDB, and broadcast via Socket.io
 * @route  POST /api/messages
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, senderUsername, senderDisplayName, senderAvatarColor, text, room } = req.body;

  const targetRoom = room || 'global';

  // 1. Persist message to MongoDB
  const message = await Message.create({
    senderId,
    senderUsername,
    senderDisplayName: senderDisplayName || senderUsername,
    senderAvatarColor: senderAvatarColor || '#128C7E',
    text,
    room: targetRoom,
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

module.exports = {
  sendMessage,
  getMessages,
  markAsRead
};
