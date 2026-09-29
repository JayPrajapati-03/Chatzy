/**
 * Simple, robust input validation and sanitization middleware
 */
const validateLoginInput = (req, res, next) => {
  const { username, displayName } = req.body;

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Username is required and must be a valid string'
    });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 2 || cleanUsername.length > 30) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Username must be between 2 and 30 characters'
    });
  }

  // Sanitize: allow alphanumeric, underscore, dot, hyphen
  const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!validUsernameRegex.test(cleanUsername)) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Username can only contain letters, numbers, dots, dashes, and underscores'
    });
  }

  req.body.username = cleanUsername;
  if (displayName && typeof displayName === 'string') {
    req.body.displayName = displayName.trim().slice(0, 50);
  }

  next();
};

const validateMessageInput = (req, res, next) => {
  const { senderId, senderUsername, text, room } = req.body;

  if (!senderId || !senderUsername) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'senderId and senderUsername are required'
    });
  }

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Message text is required and cannot be blank'
    });
  }

  if (text.length > 2000) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Message text exceeds 2000 character limit'
    });
  }

  req.body.text = text.trim();
  req.body.room = room && typeof room === 'string' ? room.trim() : 'global';

  next();
};

module.exports = {
  validateLoginInput,
  validateMessageInput
};
