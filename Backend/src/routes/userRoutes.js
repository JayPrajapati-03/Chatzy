const express = require('express');
const router = express.Router();
const { loginOrRegister, getUsers, getUserById } = require('../controllers/userController');
const { validateLoginInput } = require('../middleware/validate');

router.post('/login', validateLoginInput, loginOrRegister);
router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
