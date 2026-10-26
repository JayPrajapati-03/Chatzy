const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markAsRead,
  reactToMessage,
  votePoll
} = require('../controllers/messageController');
const { validateMessageInput } = require('../middleware/validate');

router.post('/', validateMessageInput, sendMessage);
router.get('/', getMessages);
router.post('/:id/read', markAsRead);
router.post('/:id/react', reactToMessage);
router.post('/:id/poll/vote', votePoll);

module.exports = router;
