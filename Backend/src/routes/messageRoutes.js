const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsRead } = require('../controllers/messageController');
const { validateMessageInput } = require('../middleware/validate');

router.post('/', validateMessageInput, sendMessage);
router.get('/', getMessages);
router.post('/:id/read', markAsRead);

module.exports = router;
