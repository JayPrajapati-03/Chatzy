const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Curated avatar colors for modern UI
const AVATAR_COLORS = [
  '#075E54', '#128C7E', '#25D366', '#0284C7',
  '#7C3AED', '#DB2777', '#EA580C', '#059669',
  '#D97706', '#4F46E5', '#0891B2', '#E11D48'
];

const getRandomColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

/**
 * @desc   Login or auto-create user with username
 * @route  POST /api/users/login
 */
const loginOrRegister = asyncHandler(async (req, res) => {
  const { username, displayName } = req.body;

  let user = await User.findOne({ username });

  if (!user) {
    user = await User.create({
      username,
      displayName: displayName || username,
      avatarColor: getRandomColor(),
      isOnline: true,
      lastSeen: new Date()
    });
  } else {
    // If displayName provided, update it
    if (displayName && user.displayName !== displayName) {
      user.displayName = displayName;
    }
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: user,
    message: 'User logged in successfully'
  });
});

/**
 * @desc   Get list of all users or active users
 * @route  GET /api/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ isOnline: -1, lastSeen: -1 }).select('-__v');

  res.status(200).json({
    success: true,
    data: users,
    message: 'Users retrieved successfully'
  });
});

/**
 * @desc   Get a single user by ID
 * @route  GET /api/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-__v');

  if (!user) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user,
    message: 'User retrieved successfully'
  });
});

module.exports = {
  loginOrRegister,
  getUsers,
  getUserById
};
